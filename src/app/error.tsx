"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-violet-50 to-orange-50 px-4">
            <div className="text-center max-w-sm">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Oups, une erreur !
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                    Quelque chose s&apos;est mal passé. Pas de panique, ça arrive même aux
                    meilleurs orthophonistes.
                </p>
                <div className="flex flex-col gap-3">
                    <Button
                        onClick={reset}
                        className="bg-gradient-to-r from-violet-500 to-orange-400 hover:from-violet-600 hover:to-orange-500 text-white"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Réessayer
                    </Button>
                    <Link href="/">
                        <Button variant="outline" className="w-full">
                            <Home className="w-4 h-4 mr-2" />
                            Retour à l&apos;accueil
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
