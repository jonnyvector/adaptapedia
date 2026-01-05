'use server';

import { cookies } from 'next/headers';

/**
 * Set auth token in cookie for server actions
 */
export async function setAuthCookie(accessToken: string) {
  const cookieStore = await cookies();

  // Set httpOnly cookie for security
  cookieStore.set('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

/**
 * Clear auth cookie on logout
 */
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('accessToken');
}
