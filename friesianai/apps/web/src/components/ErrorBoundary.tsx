import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

interface Props {
  children: ReactNode;
  /** Optional label so nested boundaries can identify their region. */
  region?: string;
}

interface State {
  error: Error | null;
}

/**
 * Error boundary — wraps the app (and can wrap individual panels) so a
 * rendering failure degrades to a friendly recovery screen, never a blank page.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Hook point for real error reporting (Sentry etc.).
    console.error(`[ErrorBoundary${this.props.region ? `:${this.props.region}` : ''}]`, error, info);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="flex h-full min-h-40 w-full items-center justify-center bg-background">
          <EmptyState
            icon={<AlertTriangle />}
            title="Something went wrong"
            description={
              this.props.region
                ? `The ${this.props.region} hit an unexpected error. Your data is safe.`
                : 'An unexpected error occurred. Your data is safe.'
            }
            action={
              <Button variant="secondary" onClick={() => this.setState({ error: null })}>
                Try again
              </Button>
            }
          />
        </div>
      );
    }
    return this.props.children;
  }
}
