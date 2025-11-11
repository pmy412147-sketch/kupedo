'use client';

import { useState } from 'react';
import { GoogleAdSense } from './GoogleAdSense';
import { X } from 'lucide-react';

export function AdSenseStickyBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <div className="hidden lg:block fixed bottom-6 right-6 z-40" style={{ width: '320px' }}>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden p-4">
          <div className="relative">
            <button
              onClick={() => setIsVisible(false)}
              className="absolute top-2 right-2 z-50 p-1.5 rounded-full bg-white/90 dark:bg-gray-900/90 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shadow-md"
              aria-label="Zavrieť reklamu"
            >
              <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
            <GoogleAdSense
              adFormat="auto"
              style={{
                minHeight: '250px'
              }}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="lg:hidden mt-8 mb-4 w-full">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden p-4 w-full">
          <GoogleAdSense
            adFormat="auto"
            style={{
              minHeight: '100px'
            }}
            className="w-full"
          />
        </div>
      </div>
    </>
  );
}
