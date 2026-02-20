"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Sparkles, Star, Trophy } from "lucide-react";

interface Challenge {
    id: string;
    title: string;
    description: string;
    reward_stars: number;
}

interface DailyQuestsProps {
    patientId: string;
    sessionsToday: number;
}

export function DailyQuests({ patientId, sessionsToday }: DailyQuestsProps) {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchChallenges() {
            const { data } = await supabase
                .from('daily_challenges')
                .select('*')
                .limit(3);
            if (data) setChallenges(data);
            setLoading(false);
        }
        fetchChallenges();
    }, []);

    if (loading) return null;

    return (
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-violet-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-bl-full opacity-50 -z-0" />

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <Trophy className="w-5 h-5 text-violet-500" />
                    <h3 className="font-black text-gray-900 tracking-tight">Missions du jour</h3>
                </div>

                <div className="space-y-3">
                    {challenges.map((c, i) => {
                        // Very simple logic for demo: first quest is sessions count
                        const isCompleted = i === 0 ? sessionsToday >= 1 : false;

                        return (
                            <div key={c.id} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${isCompleted ? "bg-emerald-50 border-emerald-100" : "bg-gray-50/50 border-gray-100"
                                }`}>
                                <div className={`flex-shrink-0 ${isCompleted ? "text-emerald-500" : "text-gray-300"}`}>
                                    {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-bold truncate ${isCompleted ? "text-emerald-700 font-black" : "text-gray-700"}`}>
                                        {c.title}
                                    </p>
                                    <p className="text-[10px] text-gray-500 font-medium">
                                        {c.description}
                                    </p>
                                </div>
                                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black ${isCompleted ? "bg-emerald-100 text-emerald-700" : "bg-violet-100 text-violet-700"
                                    }`}>
                                    <Star className="w-3 h-3 fill-current" />
                                    +{c.reward_stars}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
