'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2, Check, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface AIDescriptionGeneratorProps {
  open: boolean;
  onClose: () => void;
  onGenerated: (description: string, title?: string) => void;
  category: string;
  userId: string;
}

export function AIDescriptionGenerator({
  open,
  onClose,
  onGenerated,
  category,
  userId,
}: AIDescriptionGeneratorProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
  const [selectedTitle, setSelectedTitle] = useState('');

  const [productInfo, setProductInfo] = useState({
    productName: '',
    brand: '',
    model: '',
    condition: '',
    keyFeatures: '',
    price: '',
    location: '',
  });

  const handleGenerateDescription = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productInfo: {
            ...productInfo,
            category,
          },
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Nepodarilo sa vygenerovať popis');
      }

      const data = await response.json();
      setGeneratedDescription(data.description);
      setStep(2);

      toast.success('Popis bol úspešne vygenerovaný!');
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Chyba pri generovaní popisu');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTitles = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/ai/generate-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productInfo: {
            ...productInfo,
            category,
          },
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Nepodarilo sa vygenerovať nadpisy');
      }

      const data = await response.json();
      setGeneratedTitles(data.titles);
      setStep(3);

      toast.success('Nadpisy boli úspešne vygenerované!');
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Chyba pri generovaní nadpisov');
    } finally {
      setLoading(false);
    }
  };

  const handleUseGenerated = () => {
    onGenerated(generatedDescription, selectedTitle);
    handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setGeneratedDescription('');
    setGeneratedTitles([]);
    setSelectedTitle('');
    setProductInfo({
      productName: '',
      brand: '',
      model: '',
      condition: '',
      keyFeatures: '',
      price: '',
      location: '',
    });
    onClose();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Skopírované do schránky');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            AI Asistent na vytvorenie inzerátu
          </DialogTitle>
          <DialogDescription>
            Vyplňte základné informácie a AI vytvorí profesionálny popis
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Názov produktu *</Label>
              <Input
                id="productName"
                value={productInfo.productName}
                onChange={(e) =>
                  setProductInfo({ ...productInfo, productName: e.target.value })
                }
                placeholder="napr. iPhone 15 Pro"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Značka</Label>
                <Input
                  id="brand"
                  value={productInfo.brand}
                  onChange={(e) =>
                    setProductInfo({ ...productInfo, brand: e.target.value })
                  }
                  placeholder="napr. Apple"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={productInfo.model}
                  onChange={(e) =>
                    setProductInfo({ ...productInfo, model: e.target.value })
                  }
                  placeholder="napr. Pro Max 256GB"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Stav *</Label>
              <Select
                value={productInfo.condition}
                onValueChange={(value) =>
                  setProductInfo({ ...productInfo, condition: value })
                }
              >
                <SelectTrigger id="condition">
                  <SelectValue placeholder="Vyberte stav" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Nový</SelectItem>
                  <SelectItem value="like-new">Ako nový</SelectItem>
                  <SelectItem value="very-good">Veľmi dobrý</SelectItem>
                  <SelectItem value="good">Dobrý</SelectItem>
                  <SelectItem value="fair">Uspokojivý</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keyFeatures">Kľúčové vlastnosti *</Label>
              <Textarea
                id="keyFeatures"
                value={productInfo.keyFeatures}
                onChange={(e) =>
                  setProductInfo({ ...productInfo, keyFeatures: e.target.value })
                }
                placeholder="napr. 256GB úložisko, titánová farba, výborná batéria, kompletné príslušenstvo"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Cena (€)</Label>
                <Input
                  id="price"
                  type="number"
                  value={productInfo.price}
                  onChange={(e) =>
                    setProductInfo({ ...productInfo, price: e.target.value })
                  }
                  placeholder="1200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Lokalita</Label>
                <Input
                  id="location"
                  value={productInfo.location}
                  onChange={(e) =>
                    setProductInfo({ ...productInfo, location: e.target.value })
                  }
                  placeholder="Bratislava"
                />
              </div>
            </div>

            <Button
              onClick={handleGenerateDescription}
              disabled={
                loading ||
                !productInfo.productName ||
                !productInfo.condition ||
                !productInfo.keyFeatures
              }
              className="w-full"
              style={{ backgroundColor: '#10b981' }}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generujem popis...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Vygenerovať popis
                </>
              )}
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Vygenerovaný popis</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(generatedDescription)}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Kopírovať
                </Button>
              </div>
              <Textarea
                value={generatedDescription}
                onChange={(e) => setGeneratedDescription(e.target.value)}
                rows={12}
                className="font-normal"
              />
              <p className="text-sm text-gray-500">
                Môžete upraviť text pred použitím
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Späť
              </Button>
              <Button
                onClick={handleGenerateTitles}
                disabled={loading}
                className="flex-1"
                style={{ backgroundColor: '#10b981' }}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generujem nadpisy...
                  </>
                ) : (
                  'Pokračovať na nadpisy'
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Vyberte nadpis</Label>
              <div className="space-y-2">
                {generatedTitles.map((title, index) => (
                  <div
                    key={index}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedTitle === title
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950'
                        : 'hover:border-gray-400'
                    }`}
                    onClick={() => setSelectedTitle(title)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{title}</span>
                      {selectedTitle === title && (
                        <Check className="h-5 w-5 text-emerald-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Späť
              </Button>
              <Button
                onClick={handleUseGenerated}
                disabled={!selectedTitle}
                className="flex-1"
                style={{ backgroundColor: '#10b981' }}
              >
                <Check className="mr-2 h-4 w-4" />
                Použiť
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 pt-4 border-t">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
          <span className="text-sm text-gray-500">
            Krok {step} z 3
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
