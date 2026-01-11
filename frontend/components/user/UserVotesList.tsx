import type { ComparisonVote } from '@/lib/types';
import ComparisonVoteCard from './ComparisonVoteCard';
import { FONTS, BORDERS, TEXT, RADIUS} from '@/lib/brutalist-design';

interface UserVotesListProps {
  votes: ComparisonVote[];
}

export default function UserVotesList({
  votes,
}: UserVotesListProps): JSX.Element {
  if (votes.length === 0) {
    return (
      <div className={`border ${BORDERS.medium} ${RADIUS.control} p-12 text-center bg-stone-50 dark:bg-stone-950`}>
        <p className={`${TEXT.body} ${TEXT.mutedMedium} font-bold`} style={{ fontFamily: FONTS.mono }}>No votes cast yet</p>
        <p className={`${TEXT.secondary} ${TEXT.mutedMedium} mt-2`} style={{ fontFamily: FONTS.mono }}>
          Start voting on comparisons to build your voting history
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {votes.map((vote) => (
        <ComparisonVoteCard key={vote.id} vote={vote} />
      ))}
    </div>
  );
}
