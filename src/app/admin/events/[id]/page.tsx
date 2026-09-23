import { redirect } from 'next/navigation';

export default function EventIdPage({ params }: { params: { id: string } }) {
  redirect(`/admin/events/${params.id}/edit`);
}
