"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Star, ShoppingBag, Check, Lock, Sparkles, Coins } from "lucide-react";
import { toast } from "sonner";

interface RewardItem {
    id: string;
    name: string;
    cost: number;
    category: string;
    emoji: string;
}

interface RewardShopProps {
    patientId: string;
    starsTotal: number;
    onUpdate: () => void;
}

export function RewardShop({ patientId, starsTotal, onUpdate }: RewardShopProps) {
    const [rewards, setRewards] = useState<RewardItem[]>([]);
    const [myRewards, setMyRewards] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState<string | null>(null);

    const supabase = createClient();

    useEffect(() => {
        fetchData();
    }, [patientId]);

    async function fetchData() {
        setLoading(true);
        try {
            // Fetch all items
            const { data: items } = await supabase
                .from('reward_items')
                .select('*')
                .order('cost', { ascending: true });

            // Fetch owned items
            const { data: owned } = await supabase
                .from('patient_rewards')
                .select('reward_item_id')
                .eq('patient_id', patientId);

            if (items) setRewards(items);
            if (owned) setMyRewards(owned.map(r => r.reward_item_id));
        } finally {
            setLoading(false);
        }
    }

    async function handleBuy(item: RewardItem) {
        if (starsTotal < item.cost) {
            toast.error("Pas assez d'étoiles ! Continue à jouer !");
            return;
        }

        setPurchasing(item.id);
        try {
            // 1. Add to unlocks
            const { error: unlockError } = await supabase
                .from('patient_rewards')
                .insert({
                    patient_id: patientId,
                    reward_item_id: item.id
                });

            if (unlockError) throw unlockError;

            // 2. Deduct stars
            const { error: updateError } = await supabase
                .from('patients')
                .update({ stars_total: starsTotal - item.cost })
                .eq('id', patientId);

            if (updateError) throw updateError;

            toast.success(`Bravo ! Tu as débloqué : ${item.name} ${item.emoji}`, {
                icon: <Sparkles className="text-amber-400" />
            });

            setMyRewards([...myRewards, item.id]);
            onUpdate();
        } catch (err) {
            console.error(err);
            toast.error("Erreur lors de l'achat.");
        } finally {
            setPurchasing(null);
        }
    }

    async function handleEquip(item: RewardItem) {
        try {
            const field = item.category === 'avatar' ? 'avatar_emoji' : 'banner_sticker';
            const { error } = await supabase
                .from('patients')
                .update({ [field]: item.emoji })
                .eq('id', patientId);

            if (error) throw error;
            toast.success(`${item.name} équipé !`);
            onUpdate();
        } catch (err) {
            toast.error("Erreur lors de l'équipement.");
        }
    }

    if (loading) return <div className="p-8 text-center text-gray-400">Ouverture de la boutique...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-800 tracking-tight">Boutique Magique</h2>
                        <p className="text-sm text-gray-500 font-medium">Utilise tes étoiles pour des cadeaux !</p>
                    </div>
                </div>
                <div className="bg-amber-50 px-4 py-2 rounded-2xl border-2 border-amber-100 flex items-center gap-2 shadow-sm">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <span className="text-xl font-black text-amber-700">{starsTotal}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {rewards.map((item) => {
                    const isOwned = myRewards.includes(item.id);
                    const canAfford = starsTotal >= item.cost;

                    return (
                        <motion.div
                            key={item.id}
                            whileHover={{ y: -4 }}
                            className={`relative p-5 rounded-[2rem] border-2 transition-all group ${isOwned
                                ? "bg-green-50/50 border-green-100"
                                : "bg-white border-gray-100 hover:border-amber-200 hover:shadow-xl hover:shadow-amber-50"
                                }`}
                        >
                            <div className="text-5xl mb-4 text-center select-none group-hover:scale-110 transition-transform">
                                {item.emoji}
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-gray-800 text-sm mb-3">{item.name}</p>

                                {isOwned ? (
                                    <Button
                                        onClick={() => handleEquip(item)}
                                        className="w-full bg-white border-2 border-green-200 text-green-700 hover:bg-green-50 rounded-full h-9 font-bold text-xs"
                                    >
                                        Équiper
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => handleBuy(item)}
                                        disabled={purchasing === item.id || !canAfford}
                                        className={`w-full rounded-full h-9 font-bold text-xs transition-all ${canAfford
                                            ? "bg-amber-400 hover:bg-amber-500 text-amber-900"
                                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            }`}
                                    >
                                        {purchasing === item.id ? (
                                            "..."
                                        ) : (
                                            <span className="flex items-center gap-1.5">
                                                <Star className="w-3 h-3 fill-current" /> {item.cost}
                                            </span>
                                        )}
                                    </Button>
                                )}
                            </div>

                            {!isOwned && !canAfford && (
                                <div className="absolute top-2 right-2">
                                    <Lock className="w-3 h-3 text-gray-300" />
                                </div>
                            )}

                            {isOwned && (
                                <div className="absolute top-2 right-2">
                                    <Check className="w-3 h-3 text-green-500" />
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {rewards.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                    <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">La boutique sera bientôt réapprovisionnée !</p>
                </div>
            )}
        </div>
    );
}
