'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import type { DiffCategory } from '@/lib/types';
import { BookOpenIcon, UserIcon, FilmIcon, SparklesIcon } from '@/components/ui/Icons';

interface DiffStarterKitProps {
  workSlug: string;
  screenSlug: string;
}

const STARTER_CATEGORIES: Array<{
  category: DiffCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}> = [
  {
    category: 'PLOT',
    label: 'Plot change',
    icon: BookOpenIcon,
    description: 'Major storyline differences',
  },
  {
    category: 'CHARACTER',
    label: 'Character change',
    icon: UserIcon,
    description: 'Character differences or omissions',
  },
  {
    category: 'ENDING',
    label: 'Ending change',
    icon: FilmIcon,
    description: 'How the story concludes',
  },
  {
    category: 'TONE',
    label: 'Tone/theme change',
    icon: SparklesIcon,
    description: 'Mood or thematic differences',
  },
];

export default function DiffStarterKit({ workSlug, screenSlug }: DiffStarterKitProps): JSX.Element {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleCategoryClick = (category: DiffCategory): void => {
    const addUrl = `/compare/${workSlug}/${screenSlug}/add?category=${category}`;

    if (!isAuthenticated) {
      router.push(`/auth/login?returnUrl=${encodeURIComponent(addUrl)}`);
      return;
    }

    router.push(addUrl);
  };

  return (
    <div className="py-8 sm:py-12 px-4">
      <div className="max-w-2xl mx-auto text-center mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Start building this comparison
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Pick a category to add the first difference. Your contribution makes this page useful.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 max-w-3xl mx-auto">
        {STARTER_CATEGORIES.map(({ category, label, icon: Icon, description }) => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className="group p-4 sm:p-5 bg-white dark:bg-surface border-2 border-gray-200 dark:border-border rounded-xl hover:border-primary dark:hover:border-primary transition-all hover:shadow-md text-left"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 text-gray-600 dark:text-gray-400 group-hover:text-primary transition-colors">
                <Icon className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">
                  {label}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="text-center mt-8">
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3">
          Or add a different type of difference
        </p>
        <button
          onClick={() => handleCategoryClick('OTHER')}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-border rounded-lg hover:bg-gray-50 dark:hover:bg-surface2 transition-colors"
        >
          Add custom difference
        </button>
      </div>
    </div>
  );
}
