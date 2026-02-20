import { OralysesLogo } from "@/components/oralyses-logo";

export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-violet-50 to-orange-50">
            <div className="text-center">
                <div className="mx-auto mb-4 animate-pulse">
                    <OralysesLogo size={64} />
                </div>
                <p className="text-gray-500 text-sm animate-pulse">Chargement...</p>
            </div>
        </div>
    );
}
