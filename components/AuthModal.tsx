'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Chrome } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Chyba pri prihlásení cez Google');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, name);
        setError('');
        alert('Registrácia úspešná! Skontrolujte svoj email pre potvrdenie.');
      } else {
        await signInWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      if (err.message.includes('Invalid login credentials')) {
        setError('Nesprávny email alebo heslo');
      } else if (err.message.includes('User already registered')) {
        setError('Tento email je už zaregistrovaný');
      } else {
        setError(err.message || 'Chyba pri prihlásení');
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isSignUp ? 'Registrácia' : 'Prihlásenie'}</DialogTitle>
          <DialogDescription>
            {isSignUp ? 'Vytvorte si nový účet' : 'Prihláste sa do svojho účtu'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isSignUp && (
              <div>
                <Label htmlFor="name">Meno</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Heslo</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600">
              <Mail className="mr-2 h-4 w-4" />
              {isSignUp ? 'Zaregistrovať sa' : 'Prihlásiť sa'}
            </Button>
          </form>

          <div className="text-center text-sm">
            {isSignUp ? 'Už máte účet?' : 'Nemáte účet?'}{' '}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-emerald-600 hover:underline font-medium"
            >
              {isSignUp ? 'Prihláste sa' : 'Zaregistrujte sa'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
