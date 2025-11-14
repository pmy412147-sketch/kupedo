'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  revieweeId: string;
  revieweeName: string;
  adId?: string;
  onReviewSubmitted?: () => void;
}

export function ReviewModal({
  open,
  onOpenChange,
  revieweeId,
  revieweeName,
  adId,
  onReviewSubmitted
}: ReviewModalProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user || rating === 0) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          reviewer_id: user.id,
          reviewed_user_id: revieweeId,
          ad_id: adId || null,
          rating,
          comment: comment.trim() || null
        });

      if (error) throw error;

      alert('Recenzia bola úspešne pridaná!');
      setRating(0);
      setComment('');
      onOpenChange(false);
      onReviewSubmitted?.();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Chyba pri pridávaní recenzie');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pridať recenziu pre {revieweeName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Hodnotenie</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Komentár (voliteľné)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Napíšte vašu skúsenosť s predávajúcim..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/500 znakov
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={loading || rating === 0}
              className="flex-1"
            >
              {loading ? 'Ukladám...' : 'Odoslať recenziu'}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Zrušiť
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
