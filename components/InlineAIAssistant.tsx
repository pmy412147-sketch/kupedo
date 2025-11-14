'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Check, AlertCircle, TrendingUp, Info } from 'lucide-react';
import { toast } from 'sonner';

interface InlineAIAssistantProps {
  formData: {
    title: string;
    description: string;
    price: string;
    category_id: string;
    images?: string[];
  };
  onSuggestion: (field: string, value: string) => void;
  userId: string;
}

interface QualityScore {
  totalScore: number;
  breakdown: {
    description: number;
    photos: number;
    specifications: number;
    pricing: number;
  };
  suggestions: string[];
  strengths: string[];
  weaknesses: string[];
}

export function InlineAIAssistant({ formData, onSuggestion, userId }: InlineAIAssistantProps) {
  const [evaluating, setEvaluating] = useState(false);
  const [qualityScore, setQualityScore] = useState<QualityScore | null>(null);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [generatingTitle, setGeneratingTitle] = useState(false);

  useEffect(() => {
    if (formData.description && formData.title && formData.price) {
      const debounce = setTimeout(() => {
        evaluateQuality();
      }, 2000);

      return () => clearTimeout(debounce);
    }
  }, [formData.description, formData.title, formData.price]);

  const evaluateQuality = async () => {
    if (!formData.description || !formData.title) return;

    setEvaluating(true);

    try {
      const response = await fetch('/api/ai/evaluate-quality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adData: formData,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Nepodarilo sa vyhodnotiť kvalitu');
      }

      const data = await response.json();
      setQualityScore(data);
    } catch (error: any) {
      console.error('Error evaluating quality:', error);
    } finally {
      setEvaluating(false);
    }
  };

  const generateDescription = async () => {
    setGeneratingDescription(true);

    try {
      const response = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productInfo: {
            productName: formData.title || 'Produkt',
            category: formData.category_id,
            price: formData.price,
          },
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Nepodarilo sa vygenerovať popis');
      }

      const data = await response.json();
      onSuggestion('description', data.description);
      toast.success('Popis bol vygenerovaný');
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Chyba pri generovaní popisu');
    } finally {
      setGeneratingDescription(false);
    }
  };

  const generateTitle = async () => {
    setGeneratingTitle(true);

    try {
      const response = await fetch('/api/ai/generate-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productInfo: {
            productName: formData.title || 'Produkt',
            category: formData.category_id,
            description: formData.description,
          },
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Nepodarilo sa vygenerovať nadpis');
      }

      const data = await response.json();
      if (data.titles && data.titles.length > 0) {
        onSuggestion('title', data.titles[0]);
        toast.success('Nadpis bol vygenerovaný');
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Chyba pri generovaní nadpisu');
    } finally {
      setGeneratingTitle(false);
    }
  };

  if (!formData.category_id) return null;

  return (
    <Card className="p-4 bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-600" />
          <h3 className="font-semibold text-gray-900">AI Asistent</h3>
        </div>

        {qualityScore && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Kvalita inzerátu</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      qualityScore.totalScore >= 80
                        ? 'bg-green-500'
                        : qualityScore.totalScore >= 60
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${qualityScore.totalScore}%` }}
                  />
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {qualityScore.totalScore}/100
                </span>
              </div>
            </div>

            {qualityScore.suggestions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
                  <TrendingUp className="h-4 w-4" />
                  Odporúčania na zlepšenie:
                </div>
                {qualityScore.suggestions.slice(0, 3).map((suggestion, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            )}

            {qualityScore.strengths.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
                  <Check className="h-4 w-4 text-green-600" />
                  Silné stránky:
                </div>
                {qualityScore.strengths.slice(0, 2).map((strength, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-green-600">•</span>
                    <span>{strength}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {evaluating && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
            <span>Vyhodnocujem kvalitu...</span>
          </div>
        )}

        <div className="space-y-2 pt-2 border-t border-gray-200">
          <Button
            onClick={generateDescription}
            disabled={generatingDescription || !formData.title}
            variant="outline"
            size="sm"
            className="w-full"
          >
            {generatingDescription ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generujem popis...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Vygenerovať popis s AI
              </>
            )}
          </Button>

          <Button
            onClick={generateTitle}
            disabled={generatingTitle || !formData.description}
            variant="outline"
            size="sm"
            className="w-full"
          >
            {generatingTitle ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generujem nadpis...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Vylepšiť nadpis s AI
              </>
            )}
          </Button>
        </div>

        <div className="flex items-start gap-2 text-xs text-gray-500 pt-2 border-t border-gray-200">
          <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>
            AI ti pomáha vytvoriť kvalitný inzerát, ktorý priláka viac záujemcov
          </span>
        </div>
      </div>
    </Card>
  );
}
