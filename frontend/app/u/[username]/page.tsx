import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import UserProfileClient from '@/components/user/UserProfileClient';
import type { UserProfile } from '@/lib/types';

interface UserProfilePageProps {
  params: {
    username: string;
  };
}

export async function generateMetadata({ params }: UserProfilePageProps): Promise<Metadata> {
  const { username } = params;

  return {
    title: `${username} - Adaptapedia`,
    description: `View ${username}'s profile, contributions, and activity on Adaptapedia`,
  };
}

async function getUserProfile(username: string): Promise<UserProfile | null> {
  try {
    const profile = await api.users.getProfile(username);
    return profile;
  } catch (error) {
    return null;
  }
}

export default async function UserProfilePage({ params }: UserProfilePageProps): Promise<JSX.Element> {
  const { username } = params;
  const profile = await getUserProfile(username);

  if (!profile) {
    notFound();
  }

  return <UserProfileClient profile={profile} />;
}
