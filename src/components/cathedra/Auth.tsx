import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from '@/lib/helmet-compat';
import { Icons } from '../../constants';
import { supabase } from '@/lib/db';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useSearchParams } from '@/lib/rr-compat';
import { AppRoute } from '@/types';
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';

// Links enviados pelo Supabase devem sempre retornar ao domínio público oficial.
// Não usar window.location.origin: em desenvolvimento/preview isso pode gerar
// links de confirmação apontando para localhost ou para um host temporário.
const AUTH_REDIRECT_ORIGIN = 'https://cathedradigital.com.br';

// Preserva ?next= (rota interna) através de login, signup e OAuth.
// Usado sobretudo pela rota /.lovable/oauth/consent para retornar à autorização MCP.
function safeNextPath(raw: string | null): string | null {
  if (!raw) return null;
  if (!raw.startsWith('/') || raw.startsWith('//')) return null;
  return raw;
}

function getAuthErrorMessage(error: unknown, mode: 'login' | 'signup' | 'forgot'): string {
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  if (message.includes('invalid login credentials')) return 'Email ou senha incorretos.';
  if (message.includes('email not confirmed')) return 'Confirme seu email pelo link enviado antes de entrar.';
  if (message.includes('already registered') || message.includes('user already exists')) {
    return 'Não foi possível criar a conta com esse email. Tente entrar ou redefinir sua senha.';
  }
  if (message.includes('password') && (message.includes('short') || message.includes('least'))) {
    return 'A senha precisa ter pelo menos 6 caracteres.';
  }
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return 'Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.';
  }
  if (message.includes('fetch') || message.includes('network') || message.includes('timeout')) {
    return 'Não foi possível conectar. Verifique sua conexão e tente novamente.';
  }
  if (mode === 'forgot') return 'Não foi possível enviar o link agora. Tente novamente em instantes.';
  if (mode === 'signup') return 'Não foi possível criar sua conta agora. Confira os dados e tente novamente.';
  return 'Não foi possível entrar. Confira seus dados e tente novamente.';
}

interface AuthProps {
  onSuccess: () => void;
  onSignupSuccess?: () => void;
}

/**
 * Auth — Sprint Visual 3.0 (extensão): padrão Noir & Gold aplicado à porta de entrada.
 * Toda a lógica de autenticação foi preservada verbatim; só a apresentação muda.
 */
const Auth: React.FC<AuthProps> = ({ onSuccess, onSignupSuccess }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = safeNextPath(searchParams.get('next'));
  const nextQuery = nextPath ? `?next=${encodeURIComponent(nextPath)}` : '';
  const { user: sessionUser, loading: sessionLoading } = useAuth();
  const handledSessionUserId = useRef<string | null>(null);
  const handleSuccess = useCallback(() => {
    if (nextPath) navigate(nextPath, { replace: true });
    else onSuccess();
  }, [nextPath, navigate, onSuccess]);
  const handleSignupSuccess = useCallback(() => {
    if (nextPath) navigate(nextPath, { replace: true });
    else if (onSignupSuccess) onSignupSuccess();
    else onSuccess();
  }, [nextPath, navigate, onSignupSuccess, onSuccess]);

  // O callback OAuth retorna a /auth depois que o Supabase restaura a sessão.
  // A navegação ocorre somente após o AuthProvider confirmar o usuário.
  useEffect(() => {
    if (sessionLoading || !sessionUser) return;
    if (handledSessionUserId.current === sessionUser.id) return;
    handledSessionUserId.current = sessionUser.id;
    handleSuccess();
  }, [sessionUser, sessionLoading, handleSuccess]);
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'forgot') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${AUTH_REDIRECT_ORIGIN}/reset-password`,
        });
        if (resetError) setError(getAuthErrorMessage(resetError, 'forgot'));
        else setSuccess('Se este email estiver cadastrado, você receberá um link para redefinir sua senha.');
        return;
      }

      if (mode === 'signup') {
        const { data: signupData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
            emailRedirectTo: `${AUTH_REDIRECT_ORIGIN}${nextPath ?? '/'}`,
          },
        });
        if (signUpError) {
          setError(getAuthErrorMessage(signUpError, 'signup'));
          return;
        }

        // Com confirmação de email habilitada, o Supabase não cria sessão
        // imediatamente. Não tentar autenticar antes da confirmação.
        if (signupData.session && signupData.user) {
          handledSessionUserId.current = signupData.user.id;
          handleSignupSuccess();
        } else {
          setSuccess('Conta criada! Enviamos um link de confirmação para seu e-mail. Confirme o endereço para entrar na Cathedra Digital.');
          setMode('login');
        }
        return;
      }

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(getAuthErrorMessage(signInError, 'login'));
      } else {
        handledSessionUserId.current = signInData.user?.id ?? null;
        handleSuccess();
      }
    } catch (authError) {
      console.error('[Auth] Falha inesperada durante a autenticação:', authError);
      setError('Não foi possível concluir a autenticação. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: 'login' | 'signup' | 'forgot') => {
    if (loading) return;
    setMode(newMode);
    setError('');
    setSuccess('');
    setShowPassword(false);
  };

  const title = mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Criar Conta' : 'Redefinir Senha';
  const subtitle =
    mode === 'login'
      ? 'Retorne ao silêncio. Prossiga na caminhada.'
      : mode === 'signup'
      ? 'Uma Cathedra Digital para a vida interior. Comece agora.'
      : 'Informe seu email para receber o link de redefinição.';

  // ─── estilos base compartilhados ──────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    background: 'transparent',
    borderBottom: '1px solid var(--noir-line-strong)',
    color: 'var(--noir-text)',
    fontFamily: "var(--font-brand)",
  };

  return (
      <div className="cathedra-noir relative flex min-h-[100svh] w-full items-center justify-center px-4 py-20 sm:px-6 md:px-12">
      <Helmet>
        <title>{title} · Cathedra Digital</title>
        <meta name="description" content="Acesse a Cathedra Digital para retomar sua caminhada de estudo, oração e formação." />
      </Helmet>

      {/* Halo dourado sutil, igual ao da Home */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 40%, rgba(201,168,76,0.07) 0%, transparent 65%)',
        }}
      />

      {/* Voltar */}
      <button
        type="button"
        onClick={() => navigate(AppRoute.HOME)}
        className="group absolute left-3 top-3 inline-flex min-h-[44px] items-center gap-2 rounded-md px-3 text-premium-xs tracking-[0.2em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50 focus-visible:ring-offset-2 sm:left-4 sm:top-4 md:left-10 md:top-8"
        style={{ color: 'var(--noir-text-faint)', fontFamily: 'var(--font-brand)' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--noir-text-faint)')}
      >
        <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" aria-hidden />
        VOLTAR
      </button>

      <main className="relative z-10 flex w-full max-w-md flex-col items-center">
        {/* Cabeçalho editorial */}
        <div data-rise className="mb-8 flex flex-col items-center text-center sm:mb-10">
          <span
            className="mb-4 inline-block text-[10px] font-medium uppercase tracking-[0.24em] sm:mb-6 sm:text-premium-xs sm:tracking-[0.32em]"
            style={{ color: 'var(--gold)', fontFamily: 'var(--font-brand)' }}
          >
            Sanctuarium Spiritus
          </span>
          <h1
            className="mb-4 leading-none"
            style={{
              fontFamily: "var(--font-brand)",
              fontWeight: 500,
              fontSize: 'clamp(2.25rem, 8vw, 3.5rem)',
              color: 'var(--noir-text)',
              letterSpacing: '0.02em',
            }}
          >
            {title}
          </h1>
          <p
            className="max-w-sm text-sm italic leading-relaxed sm:text-base"
            style={{ fontFamily: "var(--font-brand)", color: 'var(--noir-text-muted)' }}
          >
            {subtitle}
          </p>
        </div>

        {/* Alertas */}
        {error && (
          <div
            data-rise="1"
            id="auth-error"
            role="alert"
            className="mb-5 w-full break-words rounded-md px-4 py-3 text-sm leading-relaxed [overflow-wrap:anywhere]"
            style={{
              borderLeft: '2px solid #b06060',
              color: '#e8b0b0',
              background: 'rgba(176,96,96,0.08)',
              fontFamily: 'var(--font-brand)',
            }}
          >
            {error}
          </div>
        )}
        {success && (
          <div
            data-rise="1"
            id="auth-success"
            role="status"
            className="mb-5 w-full break-words rounded-md px-4 py-3 text-sm leading-relaxed [overflow-wrap:anywhere]"
            style={{
              borderLeft: '2px solid var(--gold)',
              color: 'var(--gold-light)',
              background: 'rgba(201,168,76,0.06)',
              fontFamily: 'var(--font-brand)',
            }}
          >
            {success}
          </div>
        )}

        {/* Formulário */}
        <form data-rise="2" onSubmit={handleSubmit} aria-busy={loading} className="flex w-full flex-col gap-6 rounded-xl border border-[color:var(--noir-line)] bg-black/10 p-5 sm:gap-7 sm:p-7">
          {mode === 'signup' && (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="auth-name"
                className="text-premium-xs uppercase tracking-[0.28em]"
                style={{ color: 'var(--noir-text-faint)', fontFamily: 'var(--font-brand)' }}
              >
                Nome
              </label>
              <input
                id="auth-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Como devemos chamá-lo?"
                autoComplete="name"
                className="min-h-12 w-full rounded-md px-3 py-2 text-base placeholder:italic placeholder:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-lg"
                style={inputStyle}
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label
              htmlFor="auth-email"
              className="text-premium-xs uppercase tracking-[0.28em]"
              style={{ color: 'var(--noir-text-faint)', fontFamily: 'var(--font-brand)' }}
            >
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              inputMode="email"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'auth-error' : success ? 'auth-success' : undefined}
              placeholder="seu@email.com"
              className="min-h-12 w-full rounded-md px-3 py-2 text-base placeholder:italic placeholder:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-lg"
              style={inputStyle}
            />
          </div>

          {mode !== 'forgot' && (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="auth-password"
                className="text-premium-xs uppercase tracking-[0.28em]"
                style={{ color: 'var(--noir-text-faint)', fontFamily: 'var(--font-brand)' }}
              >
                Senha
              </label>
              <div className="relative">
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={mode === 'signup' ? 6 : undefined}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                placeholder={mode === 'signup' ? 'Mínimo 6 caracteres' : 'Digite sua senha'}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'auth-error' : undefined}
                className="min-h-12 w-full rounded-md py-2 pl-3 pr-12 text-base placeholder:italic placeholder:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-lg"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                aria-pressed={showPassword}
                className="absolute right-1 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/70"
              >
                {showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
              </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group mt-1 inline-flex min-h-[48px] w-full items-center justify-center gap-3 rounded-md border px-5 py-3 text-xs uppercase tracking-[0.24em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 sm:tracking-[0.32em]"
            style={{
              borderColor: 'var(--gold)',
              color: 'var(--gold)',
              fontFamily: 'var(--font-brand)',
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'var(--gold)';
                e.currentTarget.style.color = '#0a0a0a';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--gold)';
            }}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            <span aria-live="polite">{loading ? 'Aguarde…' : mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Criar Conta' : 'Enviar Link'}</span>
          </button>
        </form>

        {/* Divisor "ou" */}
        {mode !== 'forgot' && (
          <div data-rise="3" className="my-10 flex w-full items-center gap-4">
            <div className="h-px flex-1" style={{ background: 'var(--noir-line)' }} />
            <span
              className="text-[10px] uppercase tracking-[0.32em]"
              style={{ color: 'var(--noir-text-faint)', fontFamily: 'var(--font-brand)' }}
            >
              ou
            </span>
            <div className="h-px flex-1" style={{ background: 'var(--noir-line)' }} />
          </div>
        )}

        {/* OAuth */}
        {mode !== 'forgot' && (
          <div data-rise="3" className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                setError('');
                try {
                  const { error: oauthError } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      redirectTo: `${AUTH_REDIRECT_ORIGIN}${AppRoute.LOGIN}${nextQuery}`,
                      queryParams: { prompt: 'select_account' },
                    },
                  });
                  if (oauthError) {
                    console.error('Google Auth Error:', oauthError);
                    setError('Não foi possível conectar com o Google. Verifique sua conexão e tente novamente.');
                  }
                  // O Supabase conduz o redirecionamento OAuth; a navegação de retorno
                  // usa o redirectTo com nextQuery após o provedor concluir.
                } catch (oauthError) {
                  console.error('Google Auth Error:', oauthError);
                  setError('Não foi possível conectar com o Google. Verifique sua conexão e tente novamente.');
                } finally {
                  setLoading(false);
                }
              }}
              className="inline-flex min-h-11 items-center justify-center gap-3 border px-4 py-3 text-xs uppercase tracking-[0.28em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50 focus-visible:ring-offset-2 disabled:opacity-40"
              style={{
                borderColor: 'var(--noir-line-strong)',
                color: 'var(--noir-text)',
                fontFamily: 'var(--font-brand)',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.borderColor = 'var(--gold)';
                  e.currentTarget.style.color = 'var(--gold-light)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--noir-line-strong)';
                e.currentTarget.style.color = 'var(--noir-text)';
              }}
            >
              <Icons.Google className="h-4 w-4" />
              Google
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                setError('');
                try {
                  const { error: oauthError } = await supabase.auth.signInWithOAuth({
                    provider: 'apple',
                    options: {
                      redirectTo: `${AUTH_REDIRECT_ORIGIN}${AppRoute.LOGIN}${nextQuery}`,
                    },
                  });
                  if (oauthError) {
                    console.error('Apple Auth Error:', oauthError);
                    setError('Não foi possível conectar com a Apple. Tente novamente em instantes.');
                  }
                  // O Supabase conduz o redirecionamento OAuth; a navegação de retorno
                  // usa o redirectTo com nextQuery após o provedor concluir.
                } catch (oauthError) {
                  console.error('Apple Auth Error:', oauthError);
                  setError('Não foi possível conectar com a Apple. Tente novamente em instantes.');
                } finally {
                  setLoading(false);
                }
              }}
              className="inline-flex min-h-11 items-center justify-center gap-3 border px-4 py-3 text-xs uppercase tracking-[0.28em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50 focus-visible:ring-offset-2 disabled:opacity-40"
              style={{
                borderColor: 'var(--noir-line-strong)',
                color: 'var(--noir-text)',
                fontFamily: 'var(--font-brand)',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.borderColor = 'var(--gold)';
                  e.currentTarget.style.color = 'var(--gold-light)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--noir-line-strong)';
                e.currentTarget.style.color = 'var(--noir-text)';
              }}
            >
              <Icons.Apple className="h-4 w-4" />
              Apple
            </button>
          </div>
        )}

        {/* Modo-switch links */}
        <div data-rise="4" className="mt-10 flex flex-col items-center gap-3 text-center">
          {mode === 'login' && (
            <button
              type="button"
              disabled={loading}
              onClick={() => switchMode('forgot')}
              className="inline-flex min-h-[44px] items-center justify-center px-3 text-xs tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/70"
              style={{ color: 'var(--noir-text-muted)', fontFamily: 'var(--font-brand)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold-light)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--noir-text-muted)')}
            >
              Esqueci minha senha
            </button>
          )}
          <button
            type="button"
            disabled={loading}
            onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
            className="inline-flex min-h-[44px] items-center justify-center px-3 text-sm tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/70"
            style={{ color: 'var(--gold)', fontFamily: "var(--font-brand)", fontStyle: 'italic' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold-light)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--gold)')}
          >
            {mode === 'login'
              ? 'Ainda não tem conta? Crie a sua'
              : mode === 'signup'
              ? 'Já tem conta? Entrar'
              : 'Voltar ao login'}
          </button>
        </div>

        {/* Rodapé leve */}
        <p
          className="mt-16 text-center text-premium-xs uppercase tracking-[0.32em]"
          style={{ color: 'var(--noir-text-faint)', fontFamily: 'var(--font-brand)' }}
        >
          Acesso essencial · 100% gratuito
        </p>
      </main>
    </div>
  );
};

export default Auth;
