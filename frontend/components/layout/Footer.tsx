import Link from 'next/link';
import { ArrowTopRightOnSquareIcon } from '@/components/ui/Icons';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, monoUppercase } from '@/lib/brutalist-design';

export default function Footer(): JSX.Element {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`border-t ${BORDERS.medium}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {/* About Section */}
          <div>
            <h3 className={`font-bold text-base sm:text-lg mb-3 sm:mb-4 text-black dark:text-white ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wider }}>Adaptapedia</h3>
            <p className={`${TEXT.mutedMedium} ${TEXT.secondary} mb-4`} style={{ fontFamily: FONTS.mono }}>
              A community-driven database for comparing books and their film adaptations.
            </p>
          </div>

          {/* Links Section */}
          <div>
            <h4 className={`font-bold text-sm sm:text-base mb-3 sm:mb-4 text-black dark:text-white ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>Index</h4>
            <ul className={`space-y-2 ${TEXT.secondary}`}>
              <li>
                <Link href="/browse" className={`${TEXT.mutedMedium} hover:text-black hover:dark:text-white inline-block min-h-[28px] flex items-center transition-colors`} style={{ fontFamily: FONTS.mono }}>
                  Browse by Genre
                </Link>
              </li>
              <li>
                <Link href="/about" className={`${TEXT.mutedMedium} hover:text-black hover:dark:text-white inline-block min-h-[28px] flex items-center transition-colors`} style={{ fontFamily: FONTS.mono }}>
                  About
                </Link>
              </li>
              <li>
                <Link href="/about/sources" className={`${TEXT.mutedMedium} hover:text-black hover:dark:text-white inline-block min-h-[28px] flex items-center transition-colors`} style={{ fontFamily: FONTS.mono }}>
                  Data Sources
                </Link>
              </li>
              <li>
                <Link href="/about/guidelines" className={`${TEXT.mutedMedium} hover:text-black hover:dark:text-white inline-block min-h-[28px] flex items-center transition-colors`} style={{ fontFamily: FONTS.mono }}>
                  Community Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div className="sm:col-span-2 md:col-span-1">
            <h4 className={`font-bold text-sm sm:text-base mb-3 sm:mb-4 text-black dark:text-white ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>Legal</h4>
            <ul className={`space-y-2 ${TEXT.secondary} ${TEXT.mutedMedium}`}>
              <li>
                <a
                  href="https://github.com/adaptapedia/adaptapedia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${TEXT.mutedMedium} hover:text-black hover:dark:text-white inline-block min-h-[28px] flex items-center gap-1 transition-colors`}
                  style={{ fontFamily: FONTS.mono }}
                >
                  GitHub Repository
                  <ArrowTopRightOnSquareIcon className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li className={`${TEXT.metadata} pt-4`} style={{ fontFamily: FONTS.mono }}>
                &copy; {currentYear} Adaptapedia
              </li>
            </ul>
          </div>
        </div>

        {/* TMDb Attribution - Required by TMDb Terms */}
        <div className={`mt-6 sm:mt-8 pt-6 sm:pt-8 border-t ${BORDERS.subtle}`}>
          <p className={`${TEXT.metadata} ${TEXT.mutedMedium} text-center`} style={{ fontFamily: FONTS.mono }}>
            This product uses the TMDb API but is not endorsed or certified by TMDb.
          </p>
        </div>
      </div>
    </footer>
  );
}
