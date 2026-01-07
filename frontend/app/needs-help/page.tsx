import { Metadata } from 'next';

// Force dynamic rendering - page uses client components with useSearchParams
export const dynamic = 'force-dynamic';
import NeedsHelpClient from '@/components/needs-help/NeedsHelpClient';

export const metadata: Metadata = {
  title: 'Needs Help | Adaptapedia',
  description: 'Help improve Adaptapedia by contributing to comparisons that need more differences, disputed diffs, and more.',
};

export default function NeedsHelpPage() {
  return <NeedsHelpClient />;
}
