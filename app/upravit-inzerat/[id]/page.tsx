'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { categories } from '@/lib/categories';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { X, Upload, Loader2 } from 'lucide-react';

export default function EditAdPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const adId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category_id: '',
    location: '',
    postal_code: ''
  });

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    loadAd();
  }, [user, adId, router]);

  const loadAd = async () => {
    try {
      const adDoc = await getDoc(doc(db, 'ads', adId));

      if (!adDoc.exists()) {
        toast.error('Inzerát nebol nájdený');
        router.push('/moje-inzeraty');
        return;
      }

      const adData = adDoc.data();

      if (adData.user_id !== user?.uid) {
        toast.error('Nemáte oprávnenie upraviť tento inzerát');
        router.push('/moje-inzeraty');
        return;
      }

      setFormData({
        title: adData.title || '',
        description: adData.description || '',
        price: adData.price?.toString() || '',
        category_id: adData.category_id || '',
        location: adData.location || '',
        postal_code: adData.postal_code || ''
      });

      setExistingImages(adData.images || []);
    } catch (error) {
      console.error('Error loading ad:', error);
      toast.error('Chyba pri načítaní inzerátu');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = existingImages.length + newImages.length + files.length;

    if (totalImages > 10) {
      toast.error('Môžete mať maximálne 10 obrázkov');
      return;
    }

    setNewImages([...newImages, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages(newImages.filter((_, i) => i !== index));
    setNewPreviews(newPreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Musíte sa prihlásiť');
      return;
    }

    if (!formData.title || !formData.description || !formData.category_id || !formData.location) {
      toast.error('Vyplňte všetky povinné polia');
      return;
    }

    setLoading(true);

    try {
      const newImageUrls: string[] = [];

      for (const image of newImages) {
        const imageRef = ref(storage, `ads/${user.uid}/${Date.now()}_${image.name}`);
        await uploadBytes(imageRef, image);
        const url = await getDownloadURL(imageRef);
        newImageUrls.push(url);
      }

      const allImages = [...existingImages, ...newImageUrls];

      await updateDoc(doc(db, 'ads', adId), {
        ...formData,
        price: parseFloat(formData.price) || 0,
        images: allImages,
        updated_at: new Date().toISOString()
      });

      toast.success('Inzerát bol úspešne aktualizovaný');
      router.push('/moje-inzeraty');
    } catch (error) {
      console.error('Error updating ad:', error);
      toast.error('Chyba pri aktualizácii inzerátu');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <p>Musíte sa prihlásiť</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#F8F9FA] dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card className="p-6">
            <h1 className="text-3xl font-bold mb-6">Upraviť inzerát</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Názov *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="napr. iPhone 13 Pro Max"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Kategória *</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(v) => setFormData({ ...formData, category_id: v })}
                  required
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Vyberte kategóriu" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.slug}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Popis *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailný popis produktu..."
                  rows={6}
                  required
                />
              </div>

              <div>
                <Label htmlFor="price">Cena (€)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0 = Dohodou"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Mesto *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="napr. Bratislava"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="postal_code">PSČ</Label>
                  <Input
                    id="postal_code"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    placeholder="napr. 81101"
                  />
                </div>
              </div>

              <div>
                <Label>Obrázky (max 10)</Label>

                {existingImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    {existingImages.map((img, idx) => (
                      <div key={`existing-${idx}`} className="relative bg-gray-100 rounded aspect-square">
                        <img
                          src={img}
                          alt={`Existing ${idx + 1}`}
                          className="w-full h-full object-contain rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(idx)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {newPreviews.length > 0 && (
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    {newPreviews.map((preview, idx) => (
                      <div key={`new-${idx}`} className="relative bg-gray-100 rounded aspect-square">
                        <img
                          src={preview}
                          alt={`New ${idx + 1}`}
                          className="w-full h-full object-contain rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(idx)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4">
                  <label
                    htmlFor="images"
                    className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Pridať ďalšie obrázky</p>
                    </div>
                    <input
                      id="images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                  style={{ backgroundColor: '#2ECC71' }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Ukladám...
                    </>
                  ) : (
                    'Uložiť zmeny'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/moje-inzeraty')}
                >
                  Zrušiť
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </>
  );
}
