'use client';

import { useEffect, useState } from 'react';

export default function RetroEasterEggs(): JSX.Element {
  const [isRetro, setIsRetro] = useState(false);
  const [visitorCount, setVisitorCount] = useState(0);

  useEffect(() => {
    // Check if retro mode is active
    const checkTheme = (): void => {
      const theme = document.documentElement.getAttribute('data-theme');
      setIsRetro(theme === 'retro');
    };

    // Initial check
    checkTheme();

    // Generate a fun fake visitor count
    const fakeCount = Math.floor(Math.random() * 999999) + 100000;
    setVisitorCount(fakeCount);

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  if (!isRetro) {
    return <></>;
  }

  return (
    <div className="mt-8 space-y-4">
      {/* Visitor Counter */}
      <div className="flex justify-center">
        <div className="border-4 border-border p-4 bg-[#002244] inline-block">
          <div className="text-center">
            <div className="text-xs mb-2" style={{ color: '#ffff00' }}>
              YOU ARE VISITOR NUMBER
            </div>
            <div
              className="font-mono text-2xl font-bold tracking-wider"
              style={{ color: '#00ff00' }}
            >
              {visitorCount.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Under Construction Banner */}
      <div className="flex justify-center">
        <div className="under-construction inline-block text-center px-4 py-2">
          SITE UNDER CONSTRUCTION
        </div>
      </div>

      {/* Best Viewed In Badge */}
      <div className="text-center text-xs" style={{ color: '#00cc00' }}>
        <div className="inline-block border-2 border-[#00ffff] px-3 py-1 bg-[#002244]">
          BEST VIEWED IN NETSCAPE NAVIGATOR 4.0
        </div>
      </div>

      {/* Scrolling Marquee Text */}
      <div className="overflow-hidden bg-[#002244] border-2 border-[#00ffff] py-2">
        <div className="retro-marquee whitespace-nowrap" style={{ color: '#ffff00' }}>
          Welcome to Adaptapedia! Comparing books and adaptations since 2024! GeoCities vibes!
          Web 1.0 forever! AOL keywords not included!
        </div>
      </div>

      {/* Blinking "NEW" badge */}
      <div className="text-center">
        <span
          className="retro-blink font-bold text-2xl"
          style={{ color: '#ff00ff' }}
        >
          ★ NEW! ★
        </span>
        <span className="ml-2" style={{ color: '#00ff00' }}>
          Now with 100% more nostalgia!
        </span>
      </div>

      {/* Web Ring Navigation */}
      <div className="border-4 border-[#00ffff] p-4 bg-[#001144] text-center">
        <div className="text-sm font-bold mb-2" style={{ color: '#ffff00' }}>
          [ ADAPTAPEDIA WEB RING ]
        </div>
        <div className="flex justify-center gap-4 text-xs" style={{ color: '#00cc00' }}>
          <button className="hover:underline px-2 py-1" disabled>
            &lt;&lt; PREV
          </button>
          <span>|</span>
          <button className="hover:underline px-2 py-1" disabled>
            RANDOM
          </button>
          <span>|</span>
          <button className="hover:underline px-2 py-1" disabled>
            NEXT &gt;&gt;
          </button>
        </div>
        <div className="mt-2 text-xs" style={{ color: '#0099ff' }}>
          Member #42069 of the BookWeb Ring
        </div>
      </div>

      {/* Guestbook Link */}
      <div className="text-center">
        <div
          className="inline-block border-3 border-[#ff00ff] px-4 py-2 bg-[#002244]"
          style={{ color: '#ffff00' }}
        >
          Please sign our GUESTBOOK!
          <div className="text-xs mt-1" style={{ color: '#00cc00' }}>
            (Feature coming in Year 2000)
          </div>
        </div>
      </div>
    </div>
  );
}
