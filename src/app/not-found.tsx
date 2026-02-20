import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-violet-50 to-orange-50 px-4">
            <div className="text-center max-w-sm">
                <div className="text-8xl font-bold bg-gradient-to-r from-violet-500 to-orange-400 bg-clip-text text-transparent mb-4">
                    404
                </div>
                <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-violet-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Page introuvable
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                    Cette page n&apos;existe pas ou a été déplacée. Retournez à
                    l&apos;accueil pour retrouver votre chemin.
                </p>
                <Link href="/">
                    <Button className="bg-gradient-to-r from-violet-500 to-orange-400 hover:from-violet-600 hover:to-orange-500 text-white">
                        <Home className="w-4 h-4 mr-2" />
                        Retour à l&apos;accueil
                    </Button>
                </Link>
            </div>
        </div>
    );
}
