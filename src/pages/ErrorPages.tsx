// ────────────────────────────────────────────────────────────
// Premium Error Pages — Part 3B
// 404 / 500 / Network / Session Expired / Permission Denied
// ────────────────────────────────────────────────────────────

import { useNavigate, useLocation } from 'react-router-dom';
import {
  AlertTriangle, WifiOff, Clock, ShieldX, FileX, Home, RefreshCw,
  ArrowLeft, Mail, Sparkles, Search,
} from 'lucide-react';
import { Button } from '../components/ui/StatCard';
import clsx from 'clsx';

type ErrorType = '404' | '500' | 'network' | 'session' | 'permission';

export function ErrorPage({ type = '404' }: { type?: ErrorType }) {
  const navigate = useNavigate();
  const location = useLocation();

  const config = {
    '404': {
      icon: FileX,
      title: 'Page not found',
      description: 'The page you\'re looking for doesn\'t exist or has been moved.',
      suggestion: 'Check the URL for typos, or head back to the dashboard.',
      color: 'warning' as const,
      actions: [
        { label: 'Go to Dashboard', icon: Home, onClick: () => navigate('/'), variant: 'primary' as const },
        { label: 'Go Back', icon: ArrowLeft, onClick: () => window.history.back(), variant: 'secondary' as const },
      ],
    },
    '500': {
      icon: AlertTriangle,
      title: 'Something went wrong',
      description: 'Our servers are having a brief moment. We\'ve been notified and are looking into it.',
      suggestion: 'Try again in a moment, or contact support if the issue persists.',
      color: 'danger' as const,
      actions: [
        { label: 'Try Again', icon: RefreshCw, onClick: () => window.location.reload(), variant: 'primary' as const },
        { label: 'Go to Dashboard', icon: Home, onClick: () => navigate('/'), variant: 'secondary' as const },
        { label: 'Contact Support', icon: Mail, onClick: () => window.location.href = 'mailto:support@asiftraders.com', variant: 'ghost' as const },
      ],
    },
    'network': {
      icon: WifiOff,
      title: 'No internet connection',
      description: 'Please check your network and try again.',
      suggestion: 'Your changes will be saved locally and synced when you\'re back online.',
      color: 'warning' as const,
      actions: [
        { label: 'Try Again', icon: RefreshCw, onClick: () => window.location.reload(), variant: 'primary' as const },
      ],
    },
    'session': {
      icon: Clock,
      title: 'Session expired',
      description: 'Your session has timed out for security. Please log in again to continue.',
      suggestion: 'You\'ll be redirected to the login page in 5 seconds.',
      color: 'info' as const,
      actions: [
        { label: 'Log In Again', icon: RefreshCw, onClick: () => navigate('/login?expired=1', { replace: true }), variant: 'primary' as const },
      ],
      autoRedirect: '/login?expired=1',
    },
    'permission': {
      icon: ShieldX,
      title: 'Access denied',
      description: 'You don\'t have permission to access this resource.',
      suggestion: 'Contact your administrator if you believe this is a mistake.',
      color: 'danger' as const,
      actions: [
        { label: 'Go to Dashboard', icon: Home, onClick: () => navigate('/'), variant: 'primary' as const },
        { label: 'Contact Support', icon: Mail, onClick: () => window.location.href = 'mailto:support@asiftraders.com', variant: 'ghost' as const },
      ],
    },
  }[type];

  const Icon = config.icon;
  const colorMap = {
    warning: { bg: 'bg-warning-subtle', text: 'text-warning-600', ring: 'ring-warning-200' },
    danger:  { bg: 'bg-danger-subtle',  text: 'text-danger-600',  ring: 'ring-danger-200' },
    info:    { bg: 'bg-info-subtle',    text: 'text-info-600',    ring: 'ring-info-200' },
  };

  // Auto-redirect for session
  if ('autoRedirect' in config && config.autoRedirect) {
    setTimeout(() => navigate(config.autoRedirect as string, { replace: true }), 5000);
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 animate-fade-in">
      <div className="max-w-lg w-full text-center">
        {/* Decorative orbs */}
        <div className="relative mx-auto w-32 h-32 mb-6">
          <div className={clsx('absolute inset-0 rounded-full opacity-50 blur-3xl', colorMap[config.color].bg)} />
          <div className={clsx(
            'relative w-32 h-32 rounded-full flex items-center justify-center ring-1',
            colorMap[config.color].bg, colorMap[config.color].ring,
          )}>
            <Icon className={clsx('w-14 h-14', colorMap[config.color].text)} strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="text-4xl font-black text-ink-900 tracking-tight mb-2">{config.title}</h1>
        <p className="text-base text-ink-600 mb-2">{config.description}</p>
        <p className="text-sm text-ink-500 mb-6">{config.suggestion}</p>

        {type === '404' && (
          <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-pill bg-ink-100 text-2xs font-mono text-ink-600">
            <Search className="w-3 h-3" />
            {location.pathname}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-2">
          {config.actions.map((a) => (
            <Button key={a.label} variant={a.variant} leftIcon={<a.icon className="w-4 h-4" />} onClick={a.onClick}>
              {a.label}
            </Button>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-ink-200">
          <p className="text-2xs text-ink-500 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3 h-3 text-accent-500" />
            ASIF TRADERS Admin · v1.0
          </p>
        </div>
      </div>
    </div>
  );
}

// Convenience exports
export function NotFoundPage() { return <ErrorPage type="404" />; }
export function ServerErrorPage() { return <ErrorPage type="500" />; }
export function NetworkErrorPage() { return <ErrorPage type="network" />; }
export function SessionExpiredPage() { return <ErrorPage type="session" />; }
export function PermissionDeniedPage() { return <ErrorPage type="permission" />; }
