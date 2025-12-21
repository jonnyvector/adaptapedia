import Link from 'next/link';
import SearchBar from '@/components/search/SearchBar';

export default function Home(): JSX.Element {
  return (
    <main className="min-h-screen p-3 sm:p-4">
      <div className="max-w-6xl mx-auto">

        {/* Header - Boxed Title */}
        <div className="mb-3">
          <h1>ADAPTAPEDIA</h1>
          <p className="mt-2 border-l-3 border-black pl-2">
            DATABASE FOR COMPARING BOOKS AND SCREEN ADAPTATIONS
          </p>
        </div>

        <hr className="mb-3" />

        {/* Stats Table */}
        <div className="brutalist-box mb-3">
          <table>
            <thead>
              <tr>
                <th>CATEGORY</th>
                <th>COUNT</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>BOOKS</td>
                <td>2,185</td>
              </tr>
              <tr>
                <td>ADAPTATIONS</td>
                <td>3,417</td>
              </tr>
              <tr>
                <td>DIFFERENCES</td>
                <td>12,834</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Search Section */}
        <div className="brutalist-box-thick mb-3">
          <h2 className="mb-2">SEARCH</h2>
          <SearchBar placeholder="ENTER TITLE..." />
        </div>

        {/* Sample Comparisons - Split Screen Style */}
        <div className="mb-3">
          <h2 className="mb-2">SAMPLE COMPARISONS</h2>

          <div className="brutalist-box mb-2">
            <div className="border-bottom pb-2 mb-2">
              <h3>JURASSIC PARK</h3>
              <p className="text-gray">CASE STUDY 001</p>
            </div>
            <div className="split-screen">
              <div className="split-screen-left">
                <p className="bold">NOVEL (1990)</p>
                <p>BY MICHAEL CRICHTON</p>
              </div>
              <div className="split-screen-right">
                <p className="bold">FILM (1993)</p>
                <p>DIR. STEVEN SPIELBERG</p>
              </div>
            </div>
            <div className="border-top pt-2 mt-2">
              <p>
                <span className="bold text-red">6 DIFFERENCES DOCUMENTED</span> |
                <Link href="/compare/jurassic-park/jurassic-park-1993"> VIEW COMPARISON →</Link>
              </p>
            </div>
          </div>

          <div className="brutalist-box">
            <div className="border-bottom pb-2 mb-2">
              <h3>SPHERE</h3>
              <p className="text-gray">CASE STUDY 002</p>
            </div>
            <div className="split-screen">
              <div className="split-screen-left">
                <p className="bold">NOVEL (1987)</p>
                <p>BY MICHAEL CRICHTON</p>
              </div>
              <div className="split-screen-right">
                <p className="bold">FILM (1998)</p>
                <p>DIR. BARRY LEVINSON</p>
              </div>
            </div>
            <div className="border-top pt-2 mt-2">
              <p>
                <span className="bold text-red">5 DIFFERENCES DOCUMENTED</span> |
                <Link href="/compare/sphere-novel/sphere-1998"> VIEW COMPARISON →</Link>
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-3">
          <h2 className="mb-2">FEATURES</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="brutalist-box-double">
              <p className="bold uppercase mb-1">[1] STRUCTURED ANALYSIS</p>
              <p className="text-gray">
                DIFFERENCES ORGANIZED BY CATEGORY: PLOT, CHARACTER, ENDING, SETTING, THEME
              </p>
            </div>
            <div className="brutalist-box-double">
              <p className="bold uppercase mb-1">[2] SPOILER CONTROLS</p>
              <p className="text-gray">
                ADAPTIVE SYSTEM LETS YOU CHOOSE EXACTLY WHAT SPOILERS YOU SEE
              </p>
            </div>
            <div className="brutalist-box-double">
              <p className="bold uppercase mb-1">[3] COMMUNITY VOTING</p>
              <p className="text-gray">
                VOTE ON ACCURACY TO SURFACE THE MOST RELIABLE INFORMATION
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="brutalist-box-accent mb-3">
          <h2 className="mb-2">HOW IT WORKS</h2>
          <ol>
            <li className="mb-1"><span className="bold">SEARCH:</span> FIND ANY BOOK OR ADAPTATION IN DATABASE</li>
            <li className="mb-1"><span className="bold">COMPARE:</span> VIEW STRUCTURED DIFFERENCES WITH SPOILER CONTROLS</li>
            <li className="mb-1"><span className="bold">CONTRIBUTE:</span> ADD DIFFERENCES, VOTE ON ACCURACY</li>
          </ol>
        </div>

        {/* CTA */}
        <div className="bg-black p-3 text-center">
          <p className="bold mb-2">READY TO EXPLORE?</p>
          <p className="mb-3">
            JOIN THE COMMUNITY DOCUMENTING HOW STORIES TRANSFORM FROM PAGE TO SCREEN
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link href="/search" className="btn primary">
              START SEARCHING
            </Link>
            <Link href="/about" className="btn">
              LEARN MORE
            </Link>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-3 text-center text-gray">
          <p>ADAPTAPEDIA v1.0 | 2025</p>
        </div>

      </div>
    </main>
  );
}
