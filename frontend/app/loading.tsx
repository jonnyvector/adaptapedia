import { LoadingState } from '@/components/ui/LoadingState';

export default function Loading(): JSX.Element {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <LoadingState />
    </main>
  );
}
