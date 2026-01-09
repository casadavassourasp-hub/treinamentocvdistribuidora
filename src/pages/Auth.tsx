import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Lock, User } from 'lucide-react';
import logoCV from '@/assets/logo-cv-login.png';

// Rate limiting constants
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<Date | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Check and clear lockout if expired
  useEffect(() => {
    if (lockoutUntil && new Date() >= lockoutUntil) {
      setLockoutUntil(null);
      setLoginAttempts(0);
    }
  }, [lockoutUntil]);

  const getRemainingLockoutSeconds = (): number => {
    if (!lockoutUntil) return 0;
    return Math.max(0, Math.ceil((lockoutUntil.getTime() - Date.now()) / 1000));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if currently locked out
    if (lockoutUntil && new Date() < lockoutUntil) {
      const remainingSeconds = getRemainingLockoutSeconds();
      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;
      toast({ 
        title: 'Muitas tentativas', 
        description: `Aguarde ${minutes}m ${seconds}s antes de tentar novamente.`,
        variant: 'destructive' 
      });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        // Reset attempts on successful login
        setLoginAttempts(0);
        setLockoutUntil(null);
        toast({ title: 'Bem-vindo de volta!' });
      } else {
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast({
          title: 'Conta criada!',
          description: 'Verifique seu email para confirmar o cadastro.',
        });
      }
    } catch (error: any) {
      // Increment failed attempts for login only
      if (isLogin) {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        
        // Lock after MAX_LOGIN_ATTEMPTS failed attempts
        if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
          setLockoutUntil(new Date(Date.now() + LOCKOUT_DURATION_MS));
          toast({ 
            title: 'Conta temporariamente bloqueada', 
            description: 'Muitas tentativas de login. Tente novamente em 5 minutos.',
            variant: 'destructive' 
          });
          setLoading(false);
          return;
        }
      }
      
      // Map error messages to safe, user-friendly versions
      let message = 'Ocorreu um erro. Tente novamente.';
      if (error.message?.includes('User already registered')) {
        message = 'Este email já está cadastrado.';
      } else if (error.message?.includes('Invalid login credentials')) {
        message = 'Email ou senha inválidos.';
      } else if (error.message?.includes('Email not confirmed')) {
        message = 'Confirme seu email antes de fazer login.';
      } else if (error.message?.includes('Password')) {
        message = 'A senha deve ter pelo menos 6 caracteres.';
      }
      
      toast({ title: 'Erro', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const isLockedOut = lockoutUntil && new Date() < lockoutUntil;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto">
            <img src={logoCV} alt="CV Distribuidora" className="h-28 w-auto mx-auto" />
          </div>
          <div>
            <CardDescription className="mt-2">
              {isLogin ? 'Faça login para acessar seus treinamentos' : 'Crie sua conta para começar'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Seu nome"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLockedOut}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  minLength={6}
                  required
                  disabled={isLockedOut}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading || isLockedOut}>
              {loading ? 'Carregando...' : isLockedOut ? 'Bloqueado temporariamente' : isLogin ? 'Entrar' : 'Criar conta'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:underline"
            >
              {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
