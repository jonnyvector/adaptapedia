import { Metadata } from 'next';
import NeedsHelpClient from '@/components/needs-help/NeedsHelpClient';

export const metadata: Metadata = {
  title: 'Needs Help | Book vs. Movie',
  description: 'Help improve Book vs. Movie by contributing to comparisons that need more differences, disputed diffs, and more.',
};

export default function NeedsHelpPage() {
  return <NeedsHelpClient />;
}
