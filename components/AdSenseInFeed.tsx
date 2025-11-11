'use client';

import { GoogleAdSense } from './GoogleAdSense';

export function AdSenseInFeed() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 min-h-[280px] w-full border border-gray-100 dark:border-gray-700 relative p-4">
      <GoogleAdSense
        adFormat="auto"
        style={{
          minHeight: '250px'
        }}
        className="w-full"
      />
    </div>
  );
}
