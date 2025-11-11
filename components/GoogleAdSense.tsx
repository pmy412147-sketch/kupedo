'use client';

import { useEffect, useRef } from 'react';
import { ADSENSE_CONFIG } from '@/lib/adsense-config';

interface GoogleAdSenseProps {
  adSlot?: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle';
  fullWidthResponsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function GoogleAdSense({
  adSlot = 'auto',
  adFormat = 'auto',
  fullWidthResponsive = true,
  style,
  className = ''
}: GoogleAdSenseProps) {
  const adRef = useRef<HTMLModElement>(null);
  const isAdPushed = useRef(false);

  useEffect(() => {
    if (!ADSENSE_CONFIG.enabled) {
      return;
    }

    try {
      if (adRef.current && !isAdPushed.current) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isAdPushed.current = true;
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  if (!ADSENSE_CONFIG.enabled && ADSENSE_CONFIG.testMode) {
    return (
      <div className={`bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center ${className}`} style={style}>
        <div className="text-center p-6">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">REKLAMA (TEST MODE)</div>
          <div className="text-sm text-gray-400 dark:text-gray-500">AdSense Placeholder</div>
        </div>
      </div>
    );
  }

  if (!ADSENSE_CONFIG.enabled) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <div className="absolute -top-5 left-0 text-[10px] text-gray-400 dark:text-gray-600 font-medium">
        Sponzorované
      </div>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: 'block',
          ...style
        }}
        data-ad-client={ADSENSE_CONFIG.publisherId}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </div>
  );
}
