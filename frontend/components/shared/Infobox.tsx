import Image from 'next/image';

interface InfoboxProps {
  title: string;
  items: Array<{
    label: string;
    value: string | number | JSX.Element;
  }>;
  imageUrl?: string;
  imageAlt?: string;
}

export default function Infobox({
  title,
  items,
  imageUrl,
  imageAlt,
}: InfoboxProps): JSX.Element {
  return (
    <div className="border border-border rounded-lg p-4 bg-muted/5">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>

      {imageUrl && (
        <div className="mb-4">
          <Image
            src={imageUrl}
            alt={imageAlt || title}
            width={200}
            height={300}
            className="rounded-md w-full h-auto"
          />
        </div>
      )}

      <dl className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex flex-col">
            <dt className="text-xs text-muted font-semibold uppercase tracking-wide">
              {item.label}
            </dt>
            <dd className="text-sm mt-1">{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
