'use client';

import { GoogleAdSense } from './GoogleAdSense';

export function AdSenseInFeed() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 h-full flex flex-col border border-gray-100 dark:border-gray-700 relative">
      <GoogleAdSense
        adFormat="fluid"
        style={{
          minHeight: '280px',
          width: '100%'
        }}
        className="w-full h-full"
      />
    </div>
  );
}
