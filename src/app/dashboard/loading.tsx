import { OralysesLogo } from "@/components/oralyses-logo";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Skeleton */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="bg-gray-100 p-1.5 rounded-xl">
                            <OralysesLogo size={28} />
                        </div>
                        <Skeleton className="h-6 w-24" />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end gap-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                        <Skeleton className="h-10 w-10 rounded-2xl" />
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Welcome Section Skeleton */}
                <div className="mb-8 space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>

                {/* Stats Grid Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm space-y-4">
                            <Skeleton className="h-10 w-10 rounded-xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-16" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs Skeleton */}
                <div className="space-y-6">
                    <div className="flex gap-2 p-1 bg-gray-100/50 rounded-xl w-fit">
                        <Skeleton className="h-9 w-24 rounded-lg" />
                        <Skeleton className="h-9 w-24 rounded-lg" />
                        <Skeleton className="h-9 w-24 rounded-lg" />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-6">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-10 w-40 rounded-xl" />
                        </div>

                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="h-12 w-12 rounded-2xl" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                </div>
                                <Skeleton className="h-10 w-24 rounded-xl" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
