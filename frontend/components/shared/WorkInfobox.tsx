import type { Work } from '@/lib/types';
import Infobox from './Infobox';

interface WorkInfoboxProps {
  work: Work;
}

export default function WorkInfobox({ work }: WorkInfoboxProps): JSX.Element {
  const items: Array<{ label: string; value: string | number | JSX.Element }> = [];

  if (work.year) {
    items.push({ label: 'Year', value: work.year });
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
          className="text-link hover:underline"
        >
          {work.wikidata_qid}
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
          className="text-link hover:underline"
        >
          {work.openlibrary_work_id}
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
