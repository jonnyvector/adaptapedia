import Image from 'next/image';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, monoUppercase } from '@/lib/brutalist-design';

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
    <div className={`border ${BORDERS.medium} p-4 bg-stone-50 dark:bg-stone-950`}>
      <h3 className={`${TEXT.secondary} font-bold mb-3 text-black dark:text-white ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>{title}</h3>

      {imageUrl && (
        <div className="mb-4">
          <Image
            src={imageUrl}
            alt={imageAlt || title}
            width={200}
            height={300}
            className="w-full h-auto"
          />
        </div>
      )}

      <dl className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex flex-col">
            <dt className={`${TEXT.metadata} ${TEXT.mutedMedium} font-bold ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>
              {item.label}
            </dt>
            <dd className={`${TEXT.secondary} mt-1 text-black dark:text-white`} style={{ fontFamily: FONTS.sans }}>{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
