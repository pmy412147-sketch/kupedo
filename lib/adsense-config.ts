export const ADSENSE_CONFIG = {
  publisherId: 'ca-pub-7204460641314366',
  enabled: process.env.NODE_ENV === 'production',
  adSlots: {
    inFeedAd: '1234567890',
    stickyBanner: '0987654321',
  },
  testMode: process.env.NODE_ENV !== 'production'
};

export interface AdSenseProps {
  adSlot?: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  fullWidthResponsive?: boolean;
  className?: string;
}
