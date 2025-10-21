import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="p-8 max-w-md text-center bg-card/50 backdrop-blur-xl border-white/10">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-destructive/10 rounded-full">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Une erreur s'est produite</h3>
                <p className="text-sm text-muted-foreground">
                  Désolé, quelque chose s'est mal passé. Essaie de rafraîchir la page.
                </p>
              </div>
              <Button onClick={this.handleReset} className="mt-2">
                Rafraîchir la page
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
