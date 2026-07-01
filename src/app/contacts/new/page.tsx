import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import NewContactClient from './NewContactClient';

export default async function NewContactPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/login');
  }

  return <NewContactClient username={user.username} />;
}
