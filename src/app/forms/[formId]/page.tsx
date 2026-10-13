import React from 'react';
import { prisma } from '@/lib/prisma';
import DynamicFormRenderer from '@/components/forms/DynamicFormRenderer';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo-config';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    formId: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const form = await prisma.dynamicForm.findUnique({
    where: { id: resolvedParams.formId },
    select: { title: true, description: true },
  });

  if (!form) {
    return constructMetadata({
      title: 'Form | MITRA UK',
      image: '/logo.png',
    });
  }

  return constructMetadata({
    title: `${form.title} | MITRA UK`,
    description: form.description || undefined,
    image: '/logo.png',
    canonical: `/forms/${resolvedParams.formId}`,
  });
}

export default async function PublicFormPage({ params }: PageProps) {
  const { formId } = params;

  const form = await prisma.dynamicForm.findUnique({
    where: { id: formId },
    include: {
      fields: {
        where: { isActive: true },
        orderBy: { orderIndex: 'asc' },
      },
    },
  });

  if (!form) {
    notFound();
  }

  if (!form.isPublished) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-[#E65C00]/20 text-center space-y-4 shadow-lg">
          <div className="w-14 h-14 rounded-full bg-amber-50 text-[#E65C00] mx-auto flex items-center justify-center">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-black text-[#3D1A00] font-cinzel">Form Currently Closed</h1>
          <p className="text-xs text-[#6B3A2A] leading-relaxed">
            This form is currently in draft mode or has been unpublished by the administrator. Please check back later.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="text-xs font-bold text-[#E65C00] hover:underline inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Homepage</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formattedFields = form.fields.map((f) => ({
    id: f.id,
    label: f.label,
    type: f.type,
    placeholder: f.placeholder || '',
    helpText: f.helpText || '',
    isRequired: f.isRequired,
    orderIndex: f.orderIndex,
    options: (f.options as any) || [],
    appointmentConfig: (f.appointmentConfig as any) || undefined,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F0] via-[#FFF3E0] to-[#FFF8F0] py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#E65C00] font-bold hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to MITRA UK</span>
        </Link>
      </div>

      <DynamicFormRenderer
        formId={form.id}
        title={form.title}
        description={form.description || ''}
        fields={formattedFields}
      />
    </div>
  );
}
