'use client';

import { GoogleAdSense } from './GoogleAdSense';

export function AdSenseInFeed() {
  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 h-full flex flex-col border border-gray-100 dark:border-gray-700">
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1 uppercase tracking-wide">
              Sponzorované
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Reklama
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-center">
        <GoogleAdSense
          adFormat="auto"
          style={{
            minHeight: '100px'
          }}
          className="w-full"
        />
      </div>
    </div>
  );
}
