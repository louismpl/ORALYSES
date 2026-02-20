"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

interface Props {
    children: React.ReactNode;
    gameName?: string;
}

export class GameErrorBoundary extends React.Component<Props, ErrorBoundaryState> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        // Log to console in dev; swap for Sentry in production
        console.error("[GameErrorBoundary]", error, info);
    }

    handleReset() {
        this.setState({ hasError: false, error: null });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gradient-to-b from-violet-100 to-orange-100 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-xl">
                        {/* Icon */}
                        <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>

                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            Oups, une erreur s&apos;est produite
                        </h2>
                        <p className="text-gray-500 text-sm mb-2">
                            {this.props.gameName
                                ? `Le jeu "${this.props.gameName}" a rencontré un problème.`
                                : "Le jeu a rencontré un problème."}
                        </p>

                        {process.env.NODE_ENV === "development" && this.state.error && (
                            <pre className="text-left text-xs bg-red-50 rounded-xl p-3 mb-4 text-red-700 overflow-auto max-h-32">
                                {this.state.error.message}
                            </pre>
                        )}

                        <div className="space-y-3 mt-6">
                            <Button
                                onClick={() => this.handleReset()}
                                className="w-full bg-gradient-to-r from-violet-500 to-orange-400 text-white"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Réessayer
                            </Button>
                            <Link href="/parent">
                                <Button variant="outline" className="w-full">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Retour à l&apos;accueil
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
