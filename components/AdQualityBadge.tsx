'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Sparkles, TrendingUp, AlertCircle, CheckCircle2, Lightbulb } from 'lucide-react';

interface QualityBreakdown {
  description: number;
  photos: number;
  specifications: number;
  pricing: number;
}

interface AdQualityBadgeProps {
  adId?: string;
  adData?: any;
  userId: string;
  totalScore?: number;
  showDetails?: boolean;
}

export function AdQualityBadge({
  adId,
  adData,
  userId,
  totalScore: initialScore,
  showDetails = false,
}: AdQualityBadgeProps) {
  const [totalScore, setTotalScore] = useState(initialScore || 0);
  const [breakdown, setBreakdown] = useState<QualityBreakdown>({
    description: 0,
    photos: 0,
    specifications: 0,
    pricing: 0,
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [weaknesses, setWeaknesses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [evaluated, setEvaluated] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 75) return 'bg-green-100 dark:bg-green-950';
    if (score >= 50) return 'bg-yellow-100 dark:bg-yellow-950';
    return 'bg-red-100 dark:bg-red-950';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 75) return 'Výborná';
    if (score >= 50) return 'Dobrá';
    return 'Potrebuje zlepšenie';
  };

  const evaluateQuality = async () => {
    if (!adData || !userId) return;

    setLoading(true);

    try {
      const response = await fetch('/api/ai/evaluate-quality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adData,
          userId,
          adId,
        }),
      });

      if (!response.ok) {
        throw new Error('Nepodarilo sa vyhodnotiť kvalitu');
      }

      const data = await response.json();
      const evaluation = data.evaluation;

      setTotalScore(evaluation.totalScore);
      setBreakdown(evaluation.breakdown);
      setSuggestions(evaluation.suggestions);
      setStrengths(evaluation.strengths);
      setWeaknesses(evaluation.weaknesses);
      setEvaluated(true);
    } catch (error) {
      console.error('Error evaluating quality:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adData && !evaluated && !initialScore) {
      evaluateQuality();
    }
  }, [adData, evaluated, initialScore]);

  if (!evaluated && !initialScore) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={`${getScoreBg(totalScore)} cursor-pointer hover:opacity-80 transition-opacity`}
          onClick={() => setShowDetailsDialog(true)}
        >
          <Sparkles className="h-3 w-3 mr-1" />
          <span className={`font-semibold ${getScoreColor(totalScore)}`}>
            {totalScore}/100
          </span>
          {showDetails && (
            <span className="ml-1 text-xs">- {getScoreLabel(totalScore)}</span>
          )}
        </Badge>
      </div>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              Hodnotenie kvality inzerátu
            </DialogTitle>
            <DialogDescription>
              AI analýza kvality vášho inzerátu s návrhmi na zlepšenie
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Celkové skóre</h3>
                <div className="flex items-center gap-2">
                  <span className={`text-3xl font-bold ${getScoreColor(totalScore)}`}>
                    {totalScore}
                  </span>
                  <span className="text-gray-500">/100</span>
                </div>
              </div>
              <Progress value={totalScore} className="h-3" />
              <p className="text-sm text-gray-600 mt-2">{getScoreLabel(totalScore)}</p>
            </Card>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Detailné hodnotenie</h3>

              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Popis (max 30)</span>
                    <span className="text-sm font-semibold">{breakdown.description}/30</span>
                  </div>
                  <Progress value={(breakdown.description / 30) * 100} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Fotografie (max 25)</span>
                    <span className="text-sm font-semibold">{breakdown.photos}/25</span>
                  </div>
                  <Progress value={(breakdown.photos / 25) * 100} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Špecifikácie (max 25)</span>
                    <span className="text-sm font-semibold">{breakdown.specifications}/25</span>
                  </div>
                  <Progress value={(breakdown.specifications / 25) * 100} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Cena (max 20)</span>
                    <span className="text-sm font-semibold">{breakdown.pricing}/20</span>
                  </div>
                  <Progress value={(breakdown.pricing / 20) * 100} className="h-2" />
                </div>
              </div>
            </div>

            {strengths.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Silné stránky
                </h3>
                <ul className="space-y-2">
                  {strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {weaknesses.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  Oblasti na zlepšenie
                </h3>
                <ul className="space-y-2">
                  {weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  Návrhy na zlepšenie
                </h3>
                <ul className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              onClick={() => setShowDetailsDialog(false)}
              className="w-full"
              style={{ backgroundColor: '#10b981' }}
            >
              Zavrieť
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
