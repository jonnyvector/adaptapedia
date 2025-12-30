import Link from 'next/link';
import { ArrowTopRightOnSquareIcon } from '@/components/ui/Icons';

export default function Footer(): JSX.Element {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border mt-12 sm:mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {/* About Section */}
          <div>
            <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Book vs. Movie</h3>
            <p className="text-muted text-sm mb-4">
              A community-driven database for comparing books and their film adaptations.
            </p>
          </div>

          {/* Links Section */}
          <div>
            <h4 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/browse" className="text-muted hover:text-link inline-block min-h-[28px] flex items-center">
                  Browse by Genre
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted hover:text-link inline-block min-h-[28px] flex items-center">
                  About
                </Link>
              </li>
              <li>
                <Link href="/about/sources" className="text-muted hover:text-link inline-block min-h-[28px] flex items-center">
                  Data Sources
                </Link>
              </li>
              <li>
                <Link href="/about/guidelines" className="text-muted hover:text-link inline-block min-h-[28px] flex items-center">
                  Community Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div className="sm:col-span-2 md:col-span-1">
            <h4 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <a
                  href="https://github.com/adaptapedia/adaptapedia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-link inline-block min-h-[28px] flex items-center gap-1"
                >
                  GitHub Repository
                  <ArrowTopRightOnSquareIcon className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li className="text-xs pt-4">
                &copy; {currentYear} Book vs. Movie
              </li>
            </ul>
          </div>
        </div>

        {/* TMDb Attribution - Required by TMDb Terms */}
        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-border">
          <p className="text-xs text-muted text-center">
            This product uses the TMDb API but is not endorsed or certified by TMDb.
          </p>
        </div>
      </div>
    </footer>
  );
}
