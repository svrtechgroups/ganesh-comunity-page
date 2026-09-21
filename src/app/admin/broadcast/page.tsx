import { redirect } from 'next/navigation';

export default function BroadcastRedirectPage() {
  redirect('/admin/members/broadcast');
}
