import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: unknown) {
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary]", error, info);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="min-h-[400px] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center rounded-3xl p-8"
          style={{
            background: "rgba(10, 16, 40, 0.7)",
            border: "1px solid rgba(239,68,68,0.25)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}
          >
            <AlertTriangle className="w-6 h-6 text-rose-400" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2">Something went wrong</h2>
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
            This section ran into an unexpected error. You can try reloading just this part.
          </p>
          {this.state.error?.message && (
            <p className="text-xs text-muted-foreground/60 font-mono mb-5 px-3 py-2 rounded-lg bg-white/5 border border-white/5 truncate">
              {this.state.error.message}
            </p>
          )}
          <button
            onClick={this.reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }
}
