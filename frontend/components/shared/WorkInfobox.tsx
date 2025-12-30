import type { Work } from '@/lib/types';
import Infobox from './Infobox';
import { ArrowTopRightOnSquareIcon } from '@/components/ui/Icons';

interface WorkInfoboxProps {
  work: Work;
}

export default function WorkInfobox({ work }: WorkInfoboxProps): JSX.Element {
  const items: Array<{ label: string; value: string | number | JSX.Element }> = [];

  if (work.author) {
    items.push({ label: 'Author', value: work.author });
  }

  if (work.year) {
    items.push({ label: 'Year', value: work.year });
  }

  if (work.genre) {
    items.push({ label: 'Genre', value: work.genre });
  }

  if (work.average_rating) {
    const ratingText = work.ratings_count
      ? `${work.average_rating}/5 (${work.ratings_count.toLocaleString()} ratings)`
      : `${work.average_rating}/5`;
    items.push({ label: 'Rating', value: ratingText });
  }

  if (work.language) {
    items.push({ label: 'Language', value: work.language });
  }

  if (work.wikidata_qid) {
    items.push({
      label: 'Wikidata',
      value: (
        <a
          href={`https://www.wikidata.org/wiki/${work.wikidata_qid}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-link hover:underline inline-flex items-center gap-1"
        >
          {work.wikidata_qid}
          <ArrowTopRightOnSquareIcon className="w-3 h-3" />
        </a>
      ),
    });
  }

  if (work.openlibrary_work_id) {
    items.push({
      label: 'OpenLibrary',
      value: (
        <a
          href={`https://openlibrary.org/works/${work.openlibrary_work_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-link hover:underline inline-flex items-center gap-1"
        >
          {work.openlibrary_work_id}
          <ArrowTopRightOnSquareIcon className="w-3 h-3" />
        </a>
      ),
    });
  }

  return (
    <div className="sticky top-6">
      <Infobox
        title="Information"
        items={items}
        imageUrl={work.cover_url}
        imageAlt={`Cover of ${work.title}`}
      />
    </div>
  );
}
