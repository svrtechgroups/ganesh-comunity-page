import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const SEED_SPONSORS = [
  {
    id: 'sp-1',
    name: 'RR furnitures',
    tier: 'Brought to u by',
    logoUrl: '/assets/sponsers/rr_furnitures.png',
    websiteUrl: '#',
    order: 1,
    active: true,
    accent: 'from-[#E65C00] to-[#FF7A00]',
    gradient: 'linear-gradient(135deg, #E65C00 0%, #FF7A00 100%)',
    blackLogoBg: false,
  },
  {
    id: 'sp-2',
    name: 'Biryanis',
    tier: 'Presented By',
    logoUrl: '/assets/sponsers/biryanis.png',
    websiteUrl: '#',
    order: 2,
    active: true,
    accent: 'from-[#E65C00] to-[#FF7A00]',
    gradient: 'linear-gradient(135deg, #E65C00 0%, #FF7A00 100%)',
    blackLogoBg: false,
  },
  {
    id: 'sp-3',
    name: 'ELE Entertainments',
    tier: 'In Association With',
    logoUrl: '/assets/sponsers/ELE%20Enteratinments.jpeg',
    websiteUrl: '#',
    order: 3,
    active: true,
    accent: 'from-[#9C1F2E] to-[#7A1620]',
    gradient: 'linear-gradient(135deg, #9C1F2E 0%, #6E121C 100%)',
    blackLogoBg: false,
  },
  {
    id: 'sp-4',
    name: 'FARANI TAYLOR',
    tier: 'Partner',
    logoUrl: '/assets/sponsers/FT%20Light%20logo%20.png',
    websiteUrl: '#',
    order: 4,
    active: true,
    accent: 'from-[#1A6F8D] to-[#0F4C6B]',
    gradient: 'linear-gradient(135deg, #164E63 0%, #0E3646 100%)',
    blackLogoBg: true,
  },
  {
    id: 'sp-5',
    name: 'Langley Telugu Association',
    tier: 'SEVA PARTNERS',
    logoUrl: '/assets/sponsers/Langley%20Telugu%20Association.jpeg',
    websiteUrl: '#',
    order: 5,
    active: true,
    accent: 'from-[#3F7A3A] to-[#2C5A2F]',
    gradient: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
    blackLogoBg: false,
  },
  {
    id: 'sp-6',
    name: 'United Core',
    tier: 'Partner',
    logoUrl: '/assets/sponsers/United%20Core.jpeg',
    websiteUrl: '#',
    order: 6,
    active: true,
    accent: 'from-[#6A5B8D] to-[#4D446B]',
    gradient: 'linear-gradient(135deg, #4C1D95 0%, #311068 100%)',
    blackLogoBg: false,
  },
  {
    id: 'sp-7',
    name: 'Willow Pharmacy',
    tier: 'Partner',
    logoUrl: '/assets/sponsers/Willow%20Pharmacy.jpeg',
    websiteUrl: '#',
    order: 7,
    active: true,
    accent: 'from-[#4B7A6E] to-[#335E54]',
    gradient: 'linear-gradient(135deg, #0F766E 0%, #115E59 100%)',
    blackLogoBg: false,
  },
  {
    id: 'sp-8',
    name: 'Wealthmax',
    tier: 'Partner',
    logoUrl: '/assets/sponsers/wealthmax.png',
    websiteUrl: '#',
    order: 8,
    active: true,
    accent: 'from-[#B87F1B] to-[#8A6214]',
    gradient: 'linear-gradient(135deg, #B45309 0%, #78350F 100%)',
    blackLogoBg: false,
  },
  {
    id: 'sp-9',
    name: 'PARAMPARA',
    tier: 'Partner',
    logoUrl: '/assets/sponsers/parampara.png',
    websiteUrl: '#',
    order: 9,
    active: true,
    accent: 'from-[#4A5568] to-[#1F2937]',
    gradient: 'linear-gradient(135deg, #374151 0%, #1F2937 100%)',
    blackLogoBg: false,
  },
  {
    id: 'sp-10',
    name: 'A&S Multi Services',
    tier: 'Partner',
    logoUrl: '/assets/sponsers/a_s_multi_services.png',
    websiteUrl: '#',
    order: 10,
    active: true,
    accent: 'from-[#0EA5E9] to-[#0369A1]',
    gradient: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
    blackLogoBg: false,
  },
  {
    id: 'sp-11',
    name: 'Wicket Travel',
    tier: 'Partner',
    logoUrl: '/assets/sponsers/wickettravel.jpeg',
    websiteUrl: '#',
    order: 11,
    active: true,
    accent: 'from-[#7C3AED] to-[#4C1D95]',
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
    blackLogoBg: false,
  },
  {
    id: 'sp-12',
    name: 'Groceries Basket',
    tier: 'Partner',
    logoUrl: '/assets/sponsers/GROCERIES%20BASKET.jpeg',
    websiteUrl: '#',
    order: 12,
    active: true,
    accent: 'from-[#84CC16] to-[#4D7C0F]',
    gradient: 'linear-gradient(135deg, #65A30D 0%, #4D7C0F 100%)',
    blackLogoBg: false,
  },
  {
    id: 'sp-13',
    name: 'AMRI',
    tier: 'Partner',
    logoUrl: '/assets/sponsers/amrit_mangoes.jpeg',
    websiteUrl: '#',
    order: 13,
    active: true,
    accent: 'from-[#F59E0B] to-[#B45309]',
    gradient: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
    blackLogoBg: false,
  },
  {
    id: 'sp-14',
    name: 'Taste of Bhimavaram',
    tier: 'Partner',
    logoUrl: '/assets/sponsers/taste%20of%20Bhimavaram.jpeg',
    websiteUrl: '#',
    order: 14,
    active: true,
    accent: 'from-[#F97316] to-[#C2410C]',
    gradient: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
    blackLogoBg: false,
  },
];

export async function GET() {
  try {
    // 1. Seed Events
    await prisma.event.deleteMany({});
    await prisma.event.createMany({
      data: [
        {
          id: 'evt-ganesh-chaturthi',
          title: 'Maha Ganapathi — London Ganesh Mahotsav 2026',
          category: 'Cultural Events',
          date: '2026-09-14',
          time: 'Monday – Friday: 6:00 PM – 9:00 PM | Saturday: 11:00 AM – 3:00 PM',
          venue: 'E Block, SLOUGH & LANGLEY COLLEGE',
          address: 'Langley Road, SL3 8GW',
          description: 'London’s largest Maha Ganapathi Mahotsav featuring the historic 6ft eco-friendly murti, Sthapana puja, Kuchipudi cultural showcase, grand evening Aarti, and daily Mahaprasadam.',
          bannerUrl: '/assets/organizers-poster.jpg',
          status: 'Upcoming',
          capacity: 5000,
          rsvpCount: 1420,
          ticketPrice: 0,
          featured: true,
        },
        {
          id: 'evt-diwali-2026',
          title: 'Grand Diwali & South Asian Cultural Gala 2026',
          category: 'Cultural Events',
          date: '2026-11-08',
          time: '5:30 PM – 10:30 PM',
          venue: 'Byron Hall, Harrow Leisure Centre',
          address: 'Christchurch Ave, Harrow HA3 5BD',
          description: 'Spectacular Diwali fireworks, traditional classical orchestra, festive dinner banquet, dance performances, and family entertainment.',
          bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1200',
          status: 'Upcoming',
          capacity: 800,
          rsvpCount: 340,
          ticketPrice: 15,
          featured: true,
        },
        {
          id: 'evt-ugadi-2027',
          title: 'UK Telugu Ugadi Puraskaralu & Sangeetha Vibhavari',
          category: 'Cultural Events',
          date: '2027-04-04',
          time: '3:00 PM – 8:30 PM',
          venue: 'Logan Hall, Institute of Education, London',
          address: '20 Bedford Way, London WC1H 0AL',
          description: 'Telugu New Year celebration featuring Ugadi Pachadi distribution, Panchanga Sravanam, community honors, and live orchestra from Tollywood singers.',
          bannerUrl: 'https://images.unsplash.com/photo-1545232979-fbf34fe37b38?auto=format&fit=crop&q=80&w=1200',
          status: 'Upcoming',
          capacity: 650,
          rsvpCount: 120,
          ticketPrice: 10,
          featured: false,
        },
        {
          id: 'evt-bathukamma-2026',
          title: 'MITRA Grays Bathukamma 2026',
          category: 'Cultural Events',
          date: '2026-10-18',
          time: '4:30 PM onwards',
          venue: 'Thurrock Rugby Football Club',
          address: 'Oakfield, Long Lane, Grays, Essex, RM16 2QH',
          description: 'Get ready for a wonderful evening celebrating flowers, culture and togetherness, with family fun, DJ, food and traditional Bathukamma celebrations.',
          bannerUrl: 'https://images.unsplash.com/photo-1545232979-fbf34fe37b38?auto=format&fit=crop&q=80&w=1200',
          status: 'Upcoming',
          capacity: 600,
          rsvpCount: 150,
          ticketPrice: 0,
          featured: true,
        },
        {
          id: 'evt-badminton-cup',
          title: 'MITRA All-UK Telugu Badminton & Sports Championship',
          category: 'Sports',
          date: '2026-10-18',
          time: '9:00 AM – 6:00 PM',
          venue: 'Slough Sports Academy',
          address: 'Ragstone Rd, Slough SL1 2PU',
          description: 'Annual diaspora sports meet with Mens Doubles, Mixed Doubles, and Junior categories with trophies and sponsored prizes.',
          bannerUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=1200',
          status: 'Upcoming',
          capacity: 250,
          rsvpCount: 85,
          ticketPrice: 20,
          featured: false,
        },
      ],
    });

    // Update new custom columns via raw SQL (one statement per executeRawUnsafe)
    await prisma.$executeRawUnsafe(`
      UPDATE "Event" SET 
        "childTicketPrice" = 0,
        "enableRsvp" = true,
        "enableSupportPayment" = true,
        "enablePooja" = true,
        "enforceCapacityLimit" = false
      WHERE id = 'evt-ganesh-chaturthi'
    `);

    await prisma.$executeRawUnsafe(`
      UPDATE "Event" SET 
        "childTicketPrice" = 5,
        "enableRsvp" = true,
        "enableSupportPayment" = true,
        "enablePooja" = true,
        "enforceCapacityLimit" = false
      WHERE id = 'evt-diwali-2026'
    `);

    await prisma.$executeRawUnsafe(`
      UPDATE "Event" SET 
        "childTicketPrice" = 0,
        "enableRsvp" = true,
        "enableSupportPayment" = true,
        "enablePooja" = false,
        "enforceCapacityLimit" = false
      WHERE id = 'evt-ugadi-2027'
    `);

    await prisma.$executeRawUnsafe(`
      UPDATE "Event" SET 
        "childTicketPrice" = 10,
        "enableRsvp" = true,
        "enableSupportPayment" = true,
        "enablePooja" = false,
        "enforceCapacityLimit" = true
      WHERE id = 'evt-badminton-cup'
    `);

    // 2. Seed Sponsors
    await prisma.sponsor.deleteMany({});
    await prisma.sponsor.createMany({
      data: SEED_SPONSORS.map((sp) => ({
        id: sp.id,
        name: sp.name,
        tier: sp.tier,
        logoUrl: sp.logoUrl,
        websiteUrl: sp.websiteUrl || '#',
        order: sp.order,
        active: sp.active ?? true,
        accent: sp.accent,
        gradient: sp.gradient,
        blackLogoBg: sp.blackLogoBg,
      })),
    });

    // 3. Seed Site Settings
    await prisma.siteSettings.upsert({
      where: { id: 'default-settings' },
      update: {},
      create: {
        id: 'default-settings',
        siteTitle: 'Mana Indian Telugu Roots Abroad (MITRA)',
        tagline: 'Serving and Connecting the Telugu Community in the United Kingdom',
        contactEmail: 'info@mitra.org.uk',
        contactPhone: '+44 20 8123 4567',
        address: 'MITRA Centre, Chiswick Park, 566 Chiswick High Rd, London W4 5YA, United Kingdom',
        twitterUrl: 'https://twitter.com/mitra_official',
        linkedinUrl: 'https://linkedin.com/company/mitra-official',
        facebookUrl: 'https://facebook.com/ukteluguassociation',
        instagramUrl: 'https://instagram.com/mitra_official',
        youtubeUrl: 'https://youtube.com/@mitraofficial',
        googleAnalyticsId: 'G-MITRA2026SEO',
        enableTracking: true,
      },
    });

    // 4. Seed Members
    await prisma.member.deleteMany({});
    await prisma.member.createMany({
      data: [
        {
          id: 'MITRA-MEM-5001',
          fullName: 'Mahesh Babu G',
          email: 'member@mitra.org.uk',
          phone: '+44 7890 123456',
          tier: 'Life Member',
          role: 'Executive',
          status: 'Active',
          profession: 'Senior Software Architect',
          address: 'Chiswick, London W4 2AB',
          passwordHash: 'pass123',
          startDate: '2024-01-15',
          expiryDate: 'Lifetime',
        },
        {
          id: 'MITRA-MEM-5002',
          fullName: 'Priyanka Reddy',
          email: 'priyanka.reddy@example.co.uk',
          phone: '+44 7890 654321',
          tier: 'Annual Member',
          role: 'Member',
          status: 'Active',
          profession: 'NHS Consultant Physician',
          address: 'Birmingham B1 1AA',
          passwordHash: 'pass123',
          startDate: '2026-02-10',
          expiryDate: '2027-02-10',
        },
        {
          id: 'MITRA-MEM-5003',
          fullName: 'Venkatesh Naidu',
          email: 'v.naidu@example.co.uk',
          phone: '+44 7890 987654',
          tier: 'Volunteer',
          role: 'Volunteer',
          status: 'Active',
          profession: 'Postgraduate Student',
          address: 'Manchester M1 2WD',
          passwordHash: 'pass123',
          startDate: '2026-08-22',
          expiryDate: '2027-08-22',
        },
      ],
    });

    // 5. Seed Charity Cases
    await prisma.charityCase.deleteMany({});
    await prisma.charityCase.createMany({
      data: [
        {
          id: 'MITRA-HELP-1092',
          applicantName: 'Srinivas Rao',
          contactEmail: 'srinivas.r@gmail.com',
          contactPhone: '+44 7700 900123',
          category: 'Student Care',
          description: 'Urgent assistance requested for university accommodation guidance and part-time work compliance in London.',
          status: 'Under Review',
          urgency: 'Medium',
        },
        {
          id: 'MITRA-HELP-1093',
          applicantName: 'Confidential Beneficiary',
          contactEmail: 'help.welfare@mitra.org.uk',
          contactPhone: '+44 7700 900456',
          category: 'Women Helpline',
          description: 'Domestic support request and legal advisory referral.',
          status: 'Open',
          urgency: 'High',
        },
        {
          id: 'MITRA-HELP-1091',
          applicantName: 'Family of Late K. Sharma',
          contactEmail: 'sharma.family@outlook.com',
          contactPhone: '+44 7700 900789',
          category: 'Repatriation Support',
          description: 'Consular documentation assistance and emergency flights logistics to Hyderabad.',
          status: 'Resolved',
          urgency: 'High',
        },
      ],
    });

    // 6. Seed Media Items
    await prisma.mediaItem.deleteMany({});
    await prisma.mediaItem.createMany({
      data: [
        {
          id: 'med-gn-1',
          title: 'Maha Ganapathi Sanctum & 6ft Eco-Friendly Murti Darshan',
          type: 'IMAGE',
          category: 'Photo',
          coverImage: '/assets/organizers-poster.jpg',
          url: '/assets/organizers-poster.jpg',
          description: 'First grand look of the 6ft clay Maha Ganapathi idol installed at Slough Langley sanctum.',
          eventId: 'evt-ganesh-chaturthi',
          isFeatured: true,
          displayOrder: 1,
        },
        {
          id: 'med-gn-2',
          title: 'Official Teaser Video Reel — Slough Mahotsav 2026',
          type: 'VIDEO',
          category: 'Video',
          coverImage: '/assets/poster.jpg',
          url: '/assets/teaser-reel.mp4',
          description: 'Official teaser video reel featuring Slough Langley sanctum diyas and swaying ghanta bells.',
          eventId: 'evt-ganesh-chaturthi',
          isFeatured: false,
          displayOrder: 2,
        },
        {
          id: 'med-gn-3',
          title: 'Mahaprasadam Kitchen Preparation & Volunteer Seva',
          type: 'IMAGE',
          category: 'Photo',
          coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1000',
          url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1000',
          description: 'Devoted volunteers preparing daily Annadanam and festive sweets for thousands of visiting devotees.',
          eventId: 'evt-ganesh-chaturthi',
          isFeatured: false,
          displayOrder: 3,
        },
        {
          id: 'med-gn-4',
          title: 'London Ganesh Mahotsav Promo & Devotee Invitations',
          type: 'VIDEO',
          category: 'Video',
          coverImage: '/assets/organizers-poster.jpg',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          description: 'Special invitation video to the Telugu diaspora across the United Kingdom.',
          eventId: 'evt-ganesh-chaturthi',
          isFeatured: false,
          displayOrder: 4,
        },
        {
          id: 'med-gn-5',
          title: 'Ugadi Sangeetha Vibhavari Classical Orchestra',
          type: 'IMAGE',
          category: 'Photo',
          coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1000',
          url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1000',
          description: 'Grand opening musical symphony with veena, mridangam, and vocal carnatic legends.',
          eventId: 'evt-ganesh-chaturthi',
          isFeatured: false,
          displayOrder: 5,
        },
        {
          id: 'med-gn-6',
          title: 'Kuchipudi 500+ Dancers Grand Ensemble Live Highlights',
          type: 'VIDEO',
          category: 'Video',
          coverImage: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          description: 'Official YouTube stream of the historic 500+ classical dancers performing in London.',
          eventId: 'evt-ganesh-chaturthi',
          isFeatured: false,
          displayOrder: 6,
        },
        {
          id: 'med-gn-7',
          title: 'TTD Celestial Srinivasa Kalyanam Mandapam',
          type: 'IMAGE',
          category: 'Photo',
          coverImage: 'https://images.unsplash.com/photo-1545232979-fbf34fe37b38?auto=format&fit=crop&q=80&w=1000',
          url: 'https://images.unsplash.com/photo-1545232979-fbf34fe37b38?auto=format&fit=crop&q=80&w=1000',
          description: 'Divine wedding ritual of Lord Venkateswara with Sridevi and Bhoodevi in London.',
          eventId: 'evt-ganesh-chaturthi',
          isFeatured: false,
          displayOrder: 7,
        },
        {
          id: 'med-pub-1',
          title: 'MITRA Patrika — Mahotsav Special Edition 2026 (Digital PDF)',
          type: 'IMAGE',
          category: 'MITRA Patrika',
          coverImage: '/assets/organizers-poster.jpg',
          url: '/assets/organizers-poster.jpg',
          description: 'Features community news, Telugu poetry, student accomplishments, and event photo spreads.',
          isFeatured: false,
          displayOrder: 10,
        },
        {
          id: 'med-pub-2',
          title: 'MITRA 10th Anniversary Commemorative Souvenir Magazine',
          type: 'IMAGE',
          category: 'MITRA Souvenir',
          coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
          url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
          description: 'Comprehensive souvenir chronicling MITRA journey, founder messages, and letters from UK Parliamentarians.',
          isFeatured: false,
          displayOrder: 11,
        },
      ],
    });

    // 7. Seed Admin User
    await prisma.adminUser.deleteMany({});
    await prisma.adminUser.create({
      data: {
        username: 'admin',
        email: 'admin@mitra.org.uk',
        passwordHash: 'admin123',
        role: 'SuperAdmin',
      },
    });

    // 8. Seed Telugu Businesses
    await prisma.teluguBusiness.deleteMany({});
    await prisma.teluguBusiness.createMany({
      data: [
        {
          id: 'tb-1',
          businessName: 'Godavari Caterers & Royal Telugu Kitchen',
          ownerName: 'Srinivas Varma',
          category: 'Restaurants & Catering',
          tagline: 'Authentic Andhra & Telangana Traditional Feast Catering for UK Events',
          description: 'Specialised in royal Telugu wedding banquets, Mahotsav prasadam, live dosa stations, Gongura mutton, and traditional sweet delicacies across Greater London, Slough, and Reading.',
          logoUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300&auto=format&fit=crop&q=80',
          coverUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
          email: 'events@godavaricaterers.co.uk',
          phone: '+44 7700 900123',
          whatsapp: '447700900123',
          website: 'https://godavaricaterers.co.uk',
          address: 'Unit 4, High Street, Langley',
          city: 'Slough',
          postcode: 'SL3 8GW',
          status: 'Approved',
          isFeatured: true,
          specialOffer: '10% Discount on Bulk Mahotsav & Wedding Bookings for MITRA Members',
          adminNotes: 'Verified UK Telugu partner for Ganesh Mahotsav catering.',
        },
        {
          id: 'tb-2',
          businessName: 'Veda IT Solutions & Cloud Advisory',
          ownerName: 'Venkatesh Rao & Kiran Kumar',
          category: 'IT & Software Services',
          tagline: 'Enterprise Cloud Transformation, DevOps & Fullstack Engineering',
          description: 'Premier technology consulting firm helping UK enterprises and startups build resilient cloud-native architectures, AI integration, and offshore dedicated developer pods.',
          logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&auto=format&fit=crop&q=80',
          coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
          email: 'info@vedaitconsulting.com',
          phone: '+44 20 7946 0982',
          whatsapp: '442079460982',
          website: 'https://vedaitconsulting.com',
          address: 'Level 18, 40 Bank Street, Canary Wharf',
          city: 'London',
          postcode: 'E14 5NR',
          status: 'Approved',
          isFeatured: true,
          specialOffer: 'Complimentary 2-hour Cloud Architecture Audit for Telugu Founders',
          adminNotes: 'Founding sponsor of UK Telugu IT network.',
        },
        {
          id: 'tb-3',
          businessName: 'Saffron Heritage Mortgages & Property Advisors',
          ownerName: 'Madhavi Latha Reddy',
          category: 'Real Estate & Mortgages',
          tagline: 'FCA Regulated UK Mortgage & Buy-to-Let Property Specialists',
          description: 'Helping Telugu families and professionals navigate first-time buyer mortgages, HMO investments, remortgages, and property conveyancing with tailored Telugu language advisory.',
          logoUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=300&auto=format&fit=crop&q=80',
          coverUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
          email: 'madhavi@saffronmortgages.co.uk',
          phone: '+44 7891 234567',
          whatsapp: '447891234567',
          website: 'https://saffronmortgages.co.uk',
          address: 'Silbury Boulevard, Central Milton Keynes',
          city: 'Milton Keynes',
          postcode: 'MK9 2AH',
          status: 'Approved',
          isFeatured: true,
          specialOffer: 'Zero Broker Fee on First-Time Buyer Applications for Registered MITRA Members',
          adminNotes: 'FCA registered broker.',
        },
      ],
    });

    const eventCount = await prisma.event.count();
    const allEvents = await prisma.event.findMany();

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully with events, sponsors, site settings, members, and businesses.',
      eventCount,
      events: allEvents.map((e) => ({ id: e.id, title: e.title })),
    });
  } catch (error: unknown) {
    const err = error as any;
    console.error('[API SEED ERROR]:', error);
    return NextResponse.json({ 
      success: false, 
      error: err?.message || String(error),
      stack: err?.stack,
      code: err?.code
    }, { status: 200 });
  }
}

export async function POST() {
  return GET();
}

