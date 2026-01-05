import { Metadata } from 'next';
import NeedsHelpClient from '@/components/needs-help/NeedsHelpClient';

export const metadata: Metadata = {
  title: 'Needs Help | Adaptapedia',
  description: 'Help improve Adaptapedia by contributing to comparisons that need more differences, disputed diffs, and more.',
};

export default function NeedsHelpPage() {
  return <NeedsHelpClient />;
}
