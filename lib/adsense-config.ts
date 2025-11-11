export const ADSENSE_CONFIG = {
  publisherId: 'ca-pub-7204460641314366',
  enabled: true,
  adSlots: {
    inFeedAd: 'auto',
    stickyBanner: 'auto',
  },
  testMode: false
};

export interface AdSenseProps {
  adSlot?: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  fullWidthResponsive?: boolean;
  className?: string;
}
