import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Admin GET: fetches businesses (with optional status filter, search, and category)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const q = searchParams.get('q')?.toLowerCase().trim();

    const whereClause: any = {};

    if (status && status !== 'All') {
      whereClause.status = status;
    }

    if (category && category !== 'All') {
      whereClause.category = category;
    }

    let businesses = await prisma.teluguBusiness.findMany({
      where: whereClause,
      orderBy: [
        { status: 'asc' }, // 'Approved', 'Pending', 'Rejected'
        { createdAt: 'desc' },
      ],
    });

    if (q) {
      businesses = businesses.filter((b) => {
        return (
          b.businessName.toLowerCase().includes(q) ||
          b.ownerName.toLowerCase().includes(q) ||
          b.email.toLowerCase().includes(q) ||
          b.phone.toLowerCase().includes(q) ||
          b.city.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q)
        );
      });
    }

    const pendingCount = await prisma.teluguBusiness.count({
      where: { status: 'Pending' },
    });

    const approvedCount = await prisma.teluguBusiness.count({
      where: { status: 'Approved' },
    });

    const rejectedCount = await prisma.teluguBusiness.count({
      where: { status: 'Rejected' },
    });

    return NextResponse.json({
      success: true,
      source: 'prisma',
      data: businesses,
      counts: {
        total: businesses.length,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Admin fetch failed';
    return NextResponse.json({ success: false, error: errorMsg, data: [], counts: { total: 0, pending: 0, approved: 0, rejected: 0 } }, { status: 500 });
  }
}

// Admin POST: Admin manually adds a pre-approved or pending business
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      businessName,
      ownerName,
      category,
      tagline,
      description,
      logoUrl,
      coverUrl,
      email,
      phone,
      whatsapp,
      website,
      address,
      city,
      postcode,
      status,
      isFeatured,
      specialOffer,
      adminNotes,
    } = body;

    if (!businessName || !ownerName || !email || !phone || !description) {
      return NextResponse.json(
        { success: false, error: 'Business name, owner name, email, phone, and description are required.' },
        { status: 400 }
      );
    }

    const cleanWhatsapp = whatsapp ? whatsapp.replace(/[^0-9]/g, '') : phone.replace(/[^0-9]/g, '');

    const created = await prisma.teluguBusiness.create({
      data: {
        businessName: businessName.trim(),
        ownerName: ownerName.trim(),
        category: category || 'IT & Software Services',
        tagline: tagline?.trim() || null,
        description: description.trim(),
        logoUrl: logoUrl?.trim() || null,
        coverUrl: coverUrl?.trim() || null,
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        whatsapp: cleanWhatsapp || null,
        website: website?.trim() || null,
        address: address?.trim() || null,
        city: city?.trim() || 'London',
        postcode: postcode?.trim() || null,
        status: status || 'Approved', // Defaults to approved when added by admin
        isFeatured: Boolean(isFeatured),
        specialOffer: specialOffer?.trim() || null,
        adminNotes: adminNotes?.trim() || null,
      },
    });

    // Audit Log
    try {
      await prisma.systemLog.create({
        data: {
          level: 'INFO',
          source: 'admin/telugu-business',
          message: `Admin added Telugu business: "${created.businessName}" (${created.status})`,
          details: { businessId: created.id },
        },
      });
    } catch {
      // Non-blocking log
    }

    return NextResponse.json({ success: true, source: 'prisma', data: created });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to add business';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
  }
}

// Admin PATCH: Update business status (Approve/Reject), toggle featured, or edit fields
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, isFeatured, adminNotes, ...rest } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Business ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured);
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    // Optional field updates if editing full business
    if (rest.businessName) updateData.businessName = rest.businessName.trim();
    if (rest.ownerName) updateData.ownerName = rest.ownerName.trim();
    if (rest.category) updateData.category = rest.category;
    if (rest.tagline !== undefined) updateData.tagline = rest.tagline ? rest.tagline.trim() : null;
    if (rest.description) updateData.description = rest.description.trim();
    if (rest.logoUrl !== undefined) updateData.logoUrl = rest.logoUrl ? rest.logoUrl.trim() : null;
    if (rest.coverUrl !== undefined) updateData.coverUrl = rest.coverUrl ? rest.coverUrl.trim() : null;
    if (rest.email) updateData.email = rest.email.trim().toLowerCase();
    if (rest.phone) updateData.phone = rest.phone.trim();
    if (rest.whatsapp !== undefined) updateData.whatsapp = rest.whatsapp ? rest.whatsapp.replace(/[^0-9]/g, '') : null;
    if (rest.website !== undefined) updateData.website = rest.website ? rest.website.trim() : null;
    if (rest.address !== undefined) updateData.address = rest.address ? rest.address.trim() : null;
    if (rest.city) updateData.city = rest.city.trim();
    if (rest.postcode !== undefined) updateData.postcode = rest.postcode ? rest.postcode.trim() : null;
    if (rest.specialOffer !== undefined) updateData.specialOffer = rest.specialOffer ? rest.specialOffer.trim() : null;

    const updated = await prisma.teluguBusiness.update({
      where: { id },
      data: updateData,
    });

    // Audit Log
    try {
      await prisma.systemLog.create({
        data: {
          level: 'INFO',
          source: 'admin/telugu-business',
          message: `Admin updated Telugu business "${updated.businessName}": Status = ${updated.status}, Featured = ${updated.isFeatured}`,
          details: { businessId: updated.id, updates: updateData },
        },
      });
    } catch {
      // Non-blocking log
    }

    return NextResponse.json({ success: true, source: 'prisma', data: updated });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Update failed';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
  }
}

// Admin DELETE: Remove business listing
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Business ID required' }, { status: 400 });
    }

    await prisma.teluguBusiness.delete({ where: { id } });

    try {
      await prisma.systemLog.create({
        data: {
          level: 'WARN',
          source: 'admin/telugu-business',
          message: `Admin deleted Telugu business with ID: ${id}`,
          details: { businessId: id },
        },
      });
    } catch {
      // Non-blocking log
    }

    return NextResponse.json({ success: true, message: `Business ${id} removed successfully` });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Delete failed';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
