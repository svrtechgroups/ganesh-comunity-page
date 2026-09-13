import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Public GET: returns approved businesses with optional category, city, and search query filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const q = searchParams.get('q')?.toLowerCase().trim();

    const whereClause: any = {
      status: 'Approved',
    };

    if (category && category !== 'All') {
      whereClause.category = category;
    }

    if (city && city !== 'All') {
      whereClause.city = {
        equals: city,
        mode: 'insensitive',
      };
    }

    let businesses = await prisma.teluguBusiness.findMany({
      where: whereClause,
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    if (q) {
      businesses = businesses.filter((b) => {
        return (
          b.businessName.toLowerCase().includes(q) ||
          b.ownerName.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          b.city.toLowerCase().includes(q) ||
          (b.tagline && b.tagline.toLowerCase().includes(q)) ||
          (b.description && b.description.toLowerCase().includes(q)) ||
          (b.specialOffer && b.specialOffer.toLowerCase().includes(q))
        );
      });
    }

    return NextResponse.json({
      success: true,
      source: 'prisma',
      data: businesses,
      count: businesses.length,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch directory';
    return NextResponse.json({ success: false, error: errorMsg, data: [] }, { status: 500 });
  }
}

// Public POST: business self-registration request (status: 'Pending')
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
      specialOffer,
    } = body;

    if (!businessName || !ownerName || !email || !phone || !description) {
      return NextResponse.json(
        { success: false, error: 'Please fill in all mandatory fields (Business Name, Owner Name, Email, Phone, Description).' },
        { status: 400 }
      );
    }

    // Clean phone/whatsapp digits
    const cleanWhatsapp = whatsapp ? whatsapp.replace(/[^0-9]/g, '') : phone.replace(/[^0-9]/g, '');

    const newBusiness = await prisma.teluguBusiness.create({
      data: {
        businessName: businessName.trim(),
        ownerName: ownerName.trim(),
        category: category || 'Other Services',
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
        status: 'Pending', // Pending admin approval
        isFeatured: false,
        specialOffer: specialOffer?.trim() || null,
      },
    });

    // Audit Log
    try {
      await prisma.systemLog.create({
        data: {
          level: 'INFO',
          source: 'business/self-registration',
          message: `New Telugu Business Registration requested: "${newBusiness.businessName}" by ${newBusiness.ownerName}`,
          details: {
            businessId: newBusiness.id,
            category: newBusiness.category,
            city: newBusiness.city,
            email: newBusiness.email,
            phone: newBusiness.phone,
          },
        },
      });
    } catch {
      // Non-blocking log
    }

    return NextResponse.json({
      success: true,
      message: 'Your business listing request has been submitted successfully! It is now under review by MITRA administrators and will be published once verified.',
      data: newBusiness,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to submit business registration';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
  }
}
