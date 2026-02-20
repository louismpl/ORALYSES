import { OralysesLogo } from "@/components/oralyses-logo";

export default function ParentLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-violet-50 to-orange-50">
            <header className="bg-white/80 backdrop-blur-md border-b border-violet-100 sticky top-0 z-50">
                <div className="max-w-lg mx-auto px-4 h-14 flex items-center">
                    <div className="flex items-center gap-2">
                        <OralysesLogo size={28} />
                        <span className="font-bold" style={{ color: '#F28C6F' }}>Oralyses</span>
                    </div>
                </div>
            </header>
            <div className="max-w-lg mx-auto px-4 py-6">
                <div className="animate-pulse space-y-4">
                    <div className="bg-white rounded-2xl p-6 shadow-sm h-48" />
                    <div className="bg-white rounded-2xl p-4 shadow-sm h-32" />
                    <div className="bg-white rounded-2xl p-4 shadow-sm h-40" />
                </div>
            </div>
        </div>
    );
}
