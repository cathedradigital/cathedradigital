import * as React from 'react';
import { AlertCircle, ArrowLeft, RefreshCw, SearchX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StateActionProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

interface BaseStateProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}

export interface EmptyStateProps extends BaseStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  action?: StateActionProps;
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ title, description, action, icon: Icon = SearchX, className }, ref) => (
    <div
      ref={ref}
      role="status"
      className={cn(
        'flex flex-col items-center justify-center px-spacing-lg py-spacing-3xl text-center',
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="mb-spacing-lg flex h-12 w-12 items-center justify-center rounded-premium-full border border-border bg-muted/20 text-muted-foreground"
      >
        <Icon className="h-5 w-5" />
      </div>
      <h2 className="max-w-lg text-premium-xl font-display font-medium leading-tight text-foreground">
        {title}
      </h2>
      {description && (
        <p className="mt-spacing-sm max-w-lg text-premium-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          disabled={action.disabled}
          className="mt-spacing-xl inline-flex min-h-[44px] items-center justify-center gap-2 rounded-premium-full border border-primary/30 px-spacing-lg text-premium-sm font-medium text-primary transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          {action.label}
        </button>
      )}
    </div>
  ),
);
EmptyState.displayName = 'EmptyState';

export interface ErrorStateProps extends BaseStateProps {
  action?: StateActionProps;
  backAction?: StateActionProps;
}

export const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  ({ title, description, action, backAction, className }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center px-spacing-lg py-spacing-3xl text-center',
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="mb-spacing-lg flex h-12 w-12 items-center justify-center rounded-premium-full border border-destructive/20 bg-destructive/5 text-destructive"
      >
        <AlertCircle className="h-5 w-5" />
      </div>
      <h2 className="max-w-lg text-premium-xl font-display font-medium leading-tight text-foreground">
        {title}
      </h2>
      {description && (
        <p className="mt-spacing-sm max-w-lg text-premium-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {(action || backAction) && (
        <div className="mt-spacing-xl flex flex-wrap items-center justify-center gap-spacing-sm">
          {action && (
            <button
              type="button"
              onClick={action.onClick}
              disabled={action.disabled}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-premium-full bg-primary px-spacing-lg text-premium-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              {action.label}
            </button>
          )}
          {backAction && (
            <button
              type="button"
              onClick={backAction.onClick}
              disabled={backAction.disabled}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-premium-full border border-border px-spacing-lg text-premium-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {backAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  ),
);
ErrorState.displayName = 'ErrorState';
