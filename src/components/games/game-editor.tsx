"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Plus, Trash2, Save, Pencil, Volume2, Brain, Gamepad2,
    ChevronDown, ChevronUp, ShoppingCart, Zap, Fish, Train,
    Type, GitMerge, BookOpen,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Game {
    id: string;
    slug: string;
    name: string;
    category: string;
    config: Record<string, unknown>;
}

interface CustomConfig {
    id: string;
    name: string;
    game_id: string;
    config: Record<string, unknown>;
    games?: { name: string; slug: string };
}

// Slugs that have a custom editor
const EDITABLE_SLUGS = [
    "attrape-les-sons", "memory-vocabulaire", "simon-dit", "train-des-syllabes", "peche-aux-rimes",
    "architecte-des-phrases", "supermarche", "mot-troue", "tapis-volant-du-temps", "conjugueur-fou",
    "virelangues", "souffle-plume", "miroir-grimaces", "amuz-bouch", "sons-animaux", "serpent-siffleur",
    "prononcio", "chiffon-cochon", "jean-geant", "telephones-chuchoteurs", "boite-surprises",
    "mimes-actions", "devinettes-objets", "de-premiers-mots", "loto-pronoms", "memory-contraires",
    "imagier-couleurs", "imagier-corps", "imagier-ecole", "imagier-transports", "bizarre-bizarre",
    "langue-au-chat", "qui-est-ce", "spirale-pronoms", "course-des-accords", "train-des-natures",
    "lecteur-flash", "tri-lettres", "bulles-mots", "histoires-libres", "compte-est-bon"
];

const GAME_ICONS: Record<string, React.ReactNode> = {
    "attrape-les-sons": <Volume2 className="w-4 h-4" />,
    "memory-vocabulaire": <Brain className="w-4 h-4" />,
    "simon-dit": <Gamepad2 className="w-4 h-4" />,
    "train-des-syllabes": <Train className="w-4 h-4" />,
    "peche-aux-rimes": <Fish className="w-4 h-4" />,
    "architecte-des-phrases": <GitMerge className="w-4 h-4" />,
    "supermarche": <ShoppingCart className="w-4 h-4" />,
    "mot-troue": <Type className="w-4 h-4" />,
    "tapis-volant-du-temps": <BookOpen className="w-4 h-4" />,
    "conjugueur-fou": <Zap className="w-4 h-4" />,
};

// ─── Helper: 3-level accordion ───────────────────────────────────────────────

const LEVEL_NAMES = ["Facile", "Moyen", "Difficile"];

function ThreeLevelWrapper({ children }: { children: (levelIdx: number) => React.ReactNode }) {
    const [openLevel, setOpenLevel] = useState<number>(0);
    return (
        <div className="space-y-2">
            {LEVEL_NAMES.map((name, i) => (
                <div key={i} className="border border-violet-200 rounded-xl overflow-hidden">
                    <button
                        className="w-full flex items-center justify-between px-4 py-3 bg-violet-50 hover:bg-violet-100 transition-colors"
                        onClick={() => setOpenLevel(openLevel === i ? -1 : i)}
                    >
                        <span className="font-medium text-violet-800 text-sm">Niveau {i + 1} — {name}</span>
                        {openLevel === i ? <ChevronUp className="w-4 h-4 text-violet-500" /> : <ChevronDown className="w-4 h-4 text-violet-500" />}
                    </button>
                    <AnimatePresence>
                        {openLevel === i && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="p-4">{children(i)}</div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
}

// ─── 1. Attrape les Sons editor ───────────────────────────────────────────────

function AttrapeEditor({ config, onChange }: { config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void; }) {
    const soundPairs = (config.sound_pairs as Array<{ target: string; distractor: string; words: Array<{ word: string; target: boolean }> }>) || [
        { target: "", distractor: "", words: [{ word: "", target: true }] },
        { target: "", distractor: "", words: [{ word: "", target: true }] },
        { target: "", distractor: "", words: [{ word: "", target: true }] },
    ];
    // Ensure 3 pairs
    const pairs = [...soundPairs, ...Array(3)].slice(0, 3).map(p => p || { target: "", distractor: "", words: [{ word: "", target: true }] });

    function update(idx: number, field: string, value: unknown) {
        const updated = (pairs as any[]).map((p, i) => i === idx ? { ...p, [field]: value } : p);
        onChange({ ...config, sound_pairs: updated });
    }
    function updateWord(pairIdx: number, wordIdx: number, key: string, value: unknown) {
        const updated = (pairs as any[]).map((p, i) => {
            if (i !== pairIdx) return p;
            return { ...p, words: (p.words as any[]).map((w, j) => j === wordIdx ? { ...w, [key]: value } : w) };
        });
        onChange({ ...config, sound_pairs: updated });
    }
    function addWord(pairIdx: number) {
        const updated = pairs.map((p, i) => i === pairIdx ? { ...p, words: [...p.words, { word: "", target: true }] } : p);
        onChange({ ...config, sound_pairs: updated });
    }
    function removeWord(pairIdx: number, wordIdx: number) {
        const updated = (pairs as any[]).map((p, i) => i === pairIdx ? { ...p, words: (p.words as any[]).filter((_, j) => j !== wordIdx) } : p);
        onChange({ ...config, sound_pairs: updated });
    }

    return (
        <ThreeLevelWrapper>
            {(i) => (
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs text-gray-500">Son cible (ex: "ch")</Label>
                            <Input value={pairs[i].target} onChange={e => update(i, "target", e.target.value)} placeholder="ch, f, r..." className="mt-1 h-8 text-sm" />
                        </div>
                        <div>
                            <Label className="text-xs text-gray-500">Son distracteur (ex: "s")</Label>
                            <Input value={pairs[i].distractor} onChange={e => update(i, "distractor", e.target.value)} placeholder="s, v, l..." className="mt-1 h-8 text-sm" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <Label className="text-xs text-gray-500">Mots ({pairs[i].words.length})</Label>
                            <Button size="sm" variant="outline" onClick={() => addWord(i)} className="h-6 text-xs px-2"><Plus className="w-3 h-3 mr-1" />Mot</Button>
                        </div>
                        <div className="space-y-2">
                            {(pairs[i].words as any[]).map((word, j) => (
                                <div key={j} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                                    <Input value={word.word} onChange={e => updateWord(i, j, "word", e.target.value)} placeholder="Mot..." className="h-7 text-sm flex-1" />
                                    <Select value={word.target ? "true" : "false"} onValueChange={v => updateWord(i, j, "target", v === "true")}>
                                        <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="true">✅ Contient</SelectItem>
                                            <SelectItem value="false">❌ Ne contient pas</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <button onClick={() => removeWord(i, j)} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </ThreeLevelWrapper>
    );
}

// ─── 2. Memory Vocabulaire editor ─────────────────────────────────────────────

const EMOJI_LIST = [
    { value: "🐱", label: "🐱 Chat" }, { value: "🐶", label: "🐶 Chien" }, { value: "🐰", label: "🐰 Lapin" },
    { value: "🐦", label: "🐦 Oiseau" }, { value: "🐟", label: "🐟 Poisson" }, { value: "🍎", label: "🍎 Pomme" },
    { value: "🍌", label: "🍌 Banane" }, { value: "🍕", label: "🍕 Pizza" }, { value: "🎂", label: "🎂 Gâteau" },
    { value: "🏠", label: "🏠 Maison" }, { value: "🚗", label: "🚗 Voiture" }, { value: "☀️", label: "☀️ Soleil" },
    { value: "🌸", label: "🌸 Fleur" }, { value: "🌙", label: "🌙 Lune" }, { value: "⭐", label: "⭐ Étoile" },
    { value: "🎈", label: "🎈 Ballon" }, { value: "📚", label: "📚 Livre" }, { value: "🎵", label: "🎵 Musique" },
];

function MemoryEditor({ config, onChange }: { config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void; }) {
    const themes = (config.themes as Array<{ name: string; pairs: Array<{ word: string; image: string }> }>) || [
        { name: "Animaux", pairs: [{ word: "", image: "🐱" }] },
        { name: "Objets", pairs: [{ word: "", image: "🏠" }] },
        { name: "Nature", pairs: [{ word: "", image: "☀️" }] },
    ];
    const ts = [...themes, ...Array(3)].slice(0, 3).map(t => t || { name: "", pairs: [{ word: "", image: "🐱" }] });

    function updateName(i: number, name: string) {
        const updated = ts.map((t, j) => j === i ? { ...t, name } : t);
        onChange({ ...config, themes: updated });
    }
    function updatePair(ti: number, pi: number, field: string, value: string) {
        const updated = (ts as any[]).map((t, j) => {
            if (j !== ti) return t;
            return { ...t, pairs: (t.pairs as any[]).map((p, k) => k === pi ? { ...p, [field]: value } : p) };
        });
        onChange({ ...config, themes: updated });
    }
    function addPair(ti: number) {
        const updated = ts.map((t, j) => j === ti ? { ...t, pairs: [...t.pairs, { word: "", image: "🐱" }] } : t);
        onChange({ ...config, themes: updated });
    }
    function removePair(ti: number, pi: number) {
        const updated = (ts as any[]).map((t, j) => j === ti ? { ...t, pairs: (t.pairs as any[]).filter((_, k) => k !== pi) } : t);
        onChange({ ...config, themes: updated });
    }

    return (
        <ThreeLevelWrapper>
            {(i) => (
                <div className="space-y-3">
                    <div>
                        <Label className="text-xs text-gray-500">Nom du thème</Label>
                        <Input value={ts[i].name} onChange={e => updateName(i, e.target.value)} className="mt-1 h-8 text-sm" />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <Label className="text-xs text-gray-500">Paires mot / emoji ({ts[i].pairs.length})</Label>
                            <Button size="sm" variant="outline" onClick={() => addPair(i)} className="h-6 text-xs px-2"><Plus className="w-3 h-3 mr-1" />Paire</Button>
                        </div>
                        <div className="space-y-2">
                            {(ts[i].pairs as any[]).map((pair, j) => (
                                <div key={j} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                                    <Input value={pair.word} onChange={e => updatePair(i, j, "word", e.target.value)} placeholder="Mot..." className="h-7 text-sm flex-1" />
                                    <Select value={pair.image} onValueChange={v => updatePair(i, j, "image", v)}>
                                        <SelectTrigger className="h-7 w-36 text-xs"><SelectValue /></SelectTrigger>
                                        <SelectContent>{EMOJI_LIST.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <button onClick={() => removePair(i, j)} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </ThreeLevelWrapper>
    );
}

// ─── 3. Simon Dit editor ──────────────────────────────────────────────────────

const SHAPE_OPTIONS = [
    { value: "red-circle", label: "🔴 Cercle rouge" },
    { value: "blue-square", label: "🟦 Carré bleu" },
    { value: "yellow-triangle", label: "🟡 Triangle jaune" },
    { value: "green-star", label: "🟢 Étoile verte" },
];

function SimonEditor({ config, onChange }: { config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void; }) {
    const levels = (config.levels as Array<{ level: number; name: string; instructions: Array<{ text: string; targets: string[] }> }>) || [
        { level: 1, name: "Facile", instructions: [{ text: "Touche le cercle rouge", targets: ["red-circle"] }] },
        { level: 2, name: "Moyen", instructions: [{ text: "Touche le carré bleu", targets: ["blue-square"] }] },
        { level: 3, name: "Difficile", instructions: [{ text: "Touche le cercle rouge puis le carré bleu", targets: ["red-circle", "blue-square"] }] },
    ];
    const ls = [...levels, ...Array(3)].slice(0, 3).map((l, i) => l || { level: i + 1, name: LEVEL_NAMES[i], instructions: [] });

    function addInstruction(li: number) {
        const updated = ls.map((l, i) => i !== li ? l : { ...l, instructions: [...l.instructions, { text: "", targets: ["red-circle"] }] });
        onChange({ ...config, levels: updated });
    }
    function removeInstruction(li: number, ii: number) {
        const updated = (ls as any[]).map((l, i) => i !== li ? l : { ...l, instructions: (l.instructions as any[]).filter((_, j) => j !== ii) });
        onChange({ ...config, levels: updated });
    }
    function updateText(li: number, ii: number, text: string) {
        const updated = (ls as any[]).map((l, i) => i !== li ? l : { ...l, instructions: (l.instructions as any[]).map((inst, j) => j === ii ? { ...inst, text } : inst) });
        onChange({ ...config, levels: updated });
    }
    function toggleTarget(li: number, ii: number, shape: string) {
        const updated = ls.map((l, i) => {
            if (i !== li) return l;
            return {
                ...l, instructions: (l.instructions as any[]).map((inst, j) => {
                    if (j !== ii) return inst;
                    const targets = (inst.targets as any[]).includes(shape) ? (inst.targets as any[]).filter((t: any) => t !== shape) : [...inst.targets, shape];
                    return { ...inst, targets };
                })
            };
        });
        onChange({ ...config, levels: updated });
    }

    return (
        <ThreeLevelWrapper>
            {(i) => (
                <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1">
                        <Label className="text-xs text-gray-500">Instructions ({ls[i].instructions.length})</Label>
                        <Button size="sm" variant="outline" onClick={() => addInstruction(i)} className="h-6 text-xs px-2"><Plus className="w-3 h-3 mr-1" />Instruction</Button>
                    </div>
                    {(ls[i].instructions as any[]).map((instr, j) => (
                        <div key={j} className="bg-gray-50 rounded-lg p-3 space-y-2">
                            <div className="flex gap-2">
                                <Input value={instr.text} onChange={e => updateText(i, j, e.target.value)} placeholder="Ex: Touche le cercle rouge..." className="h-7 text-sm flex-1" />
                                <button onClick={() => removeInstruction(i, j)} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {SHAPE_OPTIONS.map(s => (
                                    <button key={s.value} onClick={() => toggleTarget(i, j, s.value)}
                                        className={`text-xs px-2 py-1 rounded-full border transition-colors ${instr.targets.includes(s.value) ? "bg-violet-100 border-violet-400 text-violet-700" : "bg-white border-gray-200 text-gray-500"}`}>
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </ThreeLevelWrapper>
    );
}

// ─── 4. Train des Syllabes editor ─────────────────────────────────────────────

function TrainSyllabesEditor({ config, onChange }: { config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void; }) {
    const words = (config.words as Array<{ word: string; emoji: string; syllables: number; syllable_display: string }>) || [];

    function updateWord(i: number, field: string, value: string | number) {
        const updated = words.map((w, j) => j === i ? { ...w, [field]: value } : w);
        onChange({ ...config, words: updated });
    }
    function addWord() {
        onChange({ ...config, words: [...words, { word: "", emoji: "🐱", syllables: 2, syllable_display: "" }] });
    }
    function removeWord(i: number) {
        onChange({ ...config, words: words.filter((_, j) => j !== i) });
    }

    return (
        <div className="space-y-3">
            <p className="text-xs text-gray-500">Les mots sont partagés entre les 3 niveaux — le niveau filtre selon le nombre max de syllabes (Facile=2, Moyen=3, Difficile=4).</p>
            <Button size="sm" onClick={addWord} className="bg-violet-500 hover:bg-violet-600 text-white"><Plus className="w-3 h-3 mr-1" />Ajouter un mot</Button>
            <div className="space-y-2">
                {words.map((w, i) => (
                    <div key={i} className="grid grid-cols-4 gap-2 items-center bg-gray-50 rounded-lg p-2">
                        <Input value={w.word} onChange={e => updateWord(i, "word", e.target.value)} placeholder="Mot..." className="h-7 text-sm" />
                        <Input value={w.emoji} onChange={e => updateWord(i, "emoji", e.target.value)} placeholder="Emoji" className="h-7 text-sm text-center" />
                        <Select value={String(w.syllables)} onValueChange={v => updateWord(i, "syllables", parseInt(v))}>
                            <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {[1, 2, 3, 4].map(n => <SelectItem key={n} value={String(n)}>{n} syllabe{n > 1 ? "s" : ""}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <div className="flex gap-1">
                            <Input value={w.syllable_display} onChange={e => updateWord(i, "syllable_display", e.target.value)} placeholder="EX-EM-PLE" className="h-7 text-xs flex-1" />
                            <button onClick={() => removeWord(i)} className="p-1 text-red-400"><Trash2 className="w-3 h-3" /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── 5. Pêche aux Rimes editor ────────────────────────────────────────────────

function PecheRimesEditor({ config, onChange }: { config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void; }) {
    type RoundType = { bait: string; bait_emoji: string; fish: Array<{ word: string; emoji: string; rhymes: boolean }> };
    const rounds = (config.rounds as RoundType[]) || [];

    function addRound() {
        onChange({ ...config, rounds: [...rounds, { bait: "", bait_emoji: "🎣", fish: [{ word: "", emoji: "🐟", rhymes: true }, { word: "", emoji: "🐠", rhymes: false }] }] });
    }
    function removeRound(i: number) {
        onChange({ ...config, rounds: rounds.filter((_, j) => j !== i) });
    }
    function updateBait(i: number, field: string, value: string) {
        const updated = rounds.map((r, j) => j === i ? { ...r, [field]: value } : r);
        onChange({ ...config, rounds: updated });
    }
    function updateFish(ri: number, fi: number, field: string, value: string | boolean) {
        const updated = rounds.map((r, i) => {
            if (i !== ri) return r;
            return { ...r, fish: r.fish.map((f, j) => j === fi ? { ...f, [field]: value } : f) };
        });
        onChange({ ...config, rounds: updated });
    }
    function addFish(ri: number) {
        const updated = rounds.map((r, i) => i !== ri ? r : { ...r, fish: [...r.fish, { word: "", emoji: "🐟", rhymes: false }] });
        onChange({ ...config, rounds: updated });
    }
    function removeFish(ri: number, fi: number) {
        const updated = rounds.map((r, i) => i !== ri ? r : { ...r, fish: r.fish.filter((_, j) => j !== fi) });
        onChange({ ...config, rounds: updated });
    }

    return (
        <div className="space-y-3">
            <p className="text-xs text-gray-500">Chaque manche a un mot-appât et des poissons (certains riment, d&apos;autres non).</p>
            <Button size="sm" onClick={addRound} className="bg-violet-500 hover:bg-violet-600 text-white"><Plus className="w-3 h-3 mr-1" />Ajouter une manche</Button>
            {rounds.map((round, ri) => (
                <div key={ri} className="border rounded-xl p-3 space-y-2">
                    <div className="flex gap-2 items-center">
                        <Input value={round.bait_emoji} onChange={e => updateBait(ri, "bait_emoji", e.target.value)} placeholder="🎣" className="h-7 text-sm w-14 text-center" />
                        <Input value={round.bait} onChange={e => updateBait(ri, "bait", e.target.value)} placeholder="Mot appât (ex: Bateau)" className="h-7 text-sm flex-1" />
                        <button onClick={() => removeRound(ri)} className="p-1 text-red-400"><Trash2 className="w-3 h-3" /></button>
                    </div>
                    <div className="space-y-1">
                        {round.fish.map((fish, fi) => (
                            <div key={fi} className="flex gap-2 items-center bg-blue-50 rounded p-1.5">
                                <Input value={fish.emoji} onChange={e => updateFish(ri, fi, "emoji", e.target.value)} className="h-6 text-xs w-10 text-center" />
                                <Input value={fish.word} onChange={e => updateFish(ri, fi, "word", e.target.value)} placeholder="Poisson..." className="h-6 text-xs flex-1" />
                                <Select value={fish.rhymes ? "true" : "false"} onValueChange={v => updateFish(ri, fi, "rhymes", v === "true")}>
                                    <SelectTrigger className="h-6 w-24 text-xs"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">✅ Rime</SelectItem>
                                        <SelectItem value="false">❌ Ne rime pas</SelectItem>
                                    </SelectContent>
                                </Select>
                                <button onClick={() => removeFish(ri, fi)} className="p-1 text-red-400"><Trash2 className="w-3 h-3" /></button>
                            </div>
                        ))}
                        <Button size="sm" variant="outline" onClick={() => addFish(ri)} className="h-6 text-xs w-full mt-1"><Plus className="w-3 h-3 mr-1" />Poisson</Button>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── 6. Architecte des Phrases editor ────────────────────────────────────────

function ArchitecteEditor({ config, onChange }: { config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void; }) {
    type SentType = { words: string[]; hint?: string };
    const sentences = (config.sentences as SentType[]) || [];

    function addSentence() {
        onChange({ ...config, sentences: [...sentences, { words: [], hint: "" }] });
    }
    function removeSentence(i: number) {
        onChange({ ...config, sentences: sentences.filter((_, j) => j !== i) });
    }
    function updateSentence(i: number, raw: string) {
        const words = raw.trim().split(/\s+/).filter(Boolean);
        const updated = sentences.map((s, j) => j === i ? { ...s, words } : s);
        onChange({ ...config, sentences: updated });
    }
    function updateHint(i: number, hint: string) {
        const updated = sentences.map((s, j) => j === i ? { ...s, hint } : s);
        onChange({ ...config, sentences: updated });
    }

    return (
        <div className="space-y-3">
            <p className="text-xs text-gray-500">Entrez les phrases telles que vous les voulez (correctes). Le jeu les mélangera automatiquement.</p>
            <Button size="sm" onClick={addSentence} className="bg-violet-500 hover:bg-violet-600 text-white"><Plus className="w-3 h-3 mr-1" />Ajouter une phrase</Button>
            {sentences.map((s, i) => (
                <div key={i} className="border rounded-xl p-3 space-y-2">
                    <div className="flex gap-2">
                        <div className="flex-1 space-y-1">
                            <Input value={s.words.join(" ")} onChange={e => updateSentence(i, e.target.value)} placeholder="Ex: Le chat mange la souris" className="h-7 text-sm" />
                            <Input value={s.hint || ""} onChange={e => updateHint(i, e.target.value)} placeholder="Indice pour l'enfant (optionnel)..." className="h-7 text-xs text-gray-500" />
                        </div>
                        <button onClick={() => removeSentence(i)} className="p-1 text-red-400"><Trash2 className="w-3 h-3" /></button>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── 7. Supermarché editor ────────────────────────────────────────────────────

const DEFAULT_CATEGORIES = ["Fruits", "Légumes", "Animaux", "Vêtements"];

function SupermarcheEditor({ config, onChange }: { config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void; }) {
    type ItemType = { name: string; emoji: string; category: string };
    const items = (config.items as ItemType[]) || [];
    const categories = (config.categories as string[]) || DEFAULT_CATEGORIES;

    function addItem() {
        onChange({ ...config, items: [...items, { name: "", emoji: "📦", category: categories[0] }] });
    }
    function removeItem(i: number) {
        onChange({ ...config, items: items.filter((_, j) => j !== i) });
    }
    function updateItem(i: number, field: string, value: string) {
        const updated = items.map((it, j) => j === i ? { ...it, [field]: value } : it);
        onChange({ ...config, items: updated });
    }

    return (
        <div className="space-y-3">
            <p className="text-xs text-gray-500">Catégories actives : {categories.join(", ")}. Niveaux 1=2 catégories, 2=3, 3=toutes.</p>
            <Button size="sm" onClick={addItem} className="bg-violet-500 hover:bg-violet-600 text-white"><Plus className="w-3 h-3 mr-1" />Ajouter un article</Button>
            <div className="space-y-2">
                {items.map((item, i) => (
                    <div key={i} className="flex gap-2 items-center bg-gray-50 rounded-lg p-2">
                        <Input value={item.emoji} onChange={e => updateItem(i, "emoji", e.target.value)} className="h-7 text-sm w-10 text-center" />
                        <Input value={item.name} onChange={e => updateItem(i, "name", e.target.value)} placeholder="Nom..." className="h-7 text-sm flex-1" />
                        <Select value={item.category} onValueChange={v => updateItem(i, "category", v)}>
                            <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                        <button onClick={() => removeItem(i)} className="p-1 text-red-400"><Trash2 className="w-3 h-3" /></button>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── 8. Mot Troué editor ──────────────────────────────────────────────────────

function MotTroueEditor({ config, onChange }: { config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void; }) {
    type ItemType = { sentence: string; options: string[]; answer: string; full_word: string };
    const items = (config.items as ItemType[]) || [];

    function addItem() {
        onChange({ ...config, items: [...items, { sentence: "", options: ["", "", "", ""], answer: "", full_word: "" }] });
    }
    function removeItem(i: number) {
        onChange({ ...config, items: items.filter((_, j) => j !== i) });
    }
    function updateItem(i: number, field: string, value: string | string[]) {
        const updated = items.map((it, j) => j === i ? { ...it, [field]: value } : it);
        onChange({ ...config, items: updated });
    }
    function updateOption(i: number, oi: number, val: string) {
        const updated = items.map((it, j) => {
            if (j !== i) return it;
            const options = [...it.options];
            options[oi] = val;
            return { ...it, options };
        });
        onChange({ ...config, items: updated });
    }

    return (
        <div className="space-y-3">
            <p className="text-xs text-gray-500">Utilisez __ (double underscore) pour marquer le trou dans la phrase. Exemple : &quot;Un ch__al galope&quot;</p>
            <Button size="sm" onClick={addItem} className="bg-violet-500 hover:bg-violet-600 text-white"><Plus className="w-3 h-3 mr-1" />Ajouter un exercice</Button>
            {items.map((item, i) => (
                <div key={i} className="border rounded-xl p-3 space-y-2">
                    <div className="flex gap-2">
                        <div className="flex-1 space-y-1">
                            <Input value={item.sentence} onChange={e => updateItem(i, "sentence", e.target.value)} placeholder="Phrase avec __ (ex: Un ch__al galope)" className="h-7 text-sm" />
                            <div className="grid grid-cols-2 gap-1">
                                {[0, 1, 2, 3].map(oi => (
                                    <Input key={oi} value={item.options[oi] || ""} onChange={e => updateOption(i, oi, e.target.value)}
                                        placeholder={`Option ${oi + 1}${oi === 0 ? " (correcte)" : ""}`} className={`h-7 text-xs ${oi === 0 ? "border-green-400" : ""}`} />
                                ))}
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                                <Input value={item.answer} onChange={e => updateItem(i, "answer", e.target.value)} placeholder="Réponse correcte (= option 1)" className="h-7 text-xs border-green-400" />
                                <Input value={item.full_word} onChange={e => updateItem(i, "full_word", e.target.value)} placeholder="Mot complet (ex: cheval)" className="h-7 text-xs" />
                            </div>
                        </div>
                        <button onClick={() => removeItem(i)} className="p-1 text-red-400"><Trash2 className="w-3 h-3" /></button>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── 9. Tapis Volant du Temps editor ─────────────────────────────────────────

function TapisTempsEditor({ config, onChange }: { config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void; }) {
    type ItemType = { sentence: string; answer: "past" | "present" | "future"; verb_hint: string };
    const items = (config.items as ItemType[]) || [];

    function addItem() {
        onChange({ ...config, items: [...items, { sentence: "", answer: "present", verb_hint: "" }] });
    }
    function removeItem(i: number) {
        onChange({ ...config, items: items.filter((_, j) => j !== i) });
    }
    function updateItem(i: number, field: string, value: string) {
        const updated = items.map((it, j) => j === i ? { ...it, [field]: value } : it);
        onChange({ ...config, items: updated });
    }

    return (
        <div className="space-y-3">
            <p className="text-xs text-gray-500">Ajoutez des phrases à classer (Passé / Présent / Futur). Indiquez le verbe clé pour aider l&apos;enfant.</p>
            <Button size="sm" onClick={addItem} className="bg-violet-500 hover:bg-violet-600 text-white"><Plus className="w-3 h-3 mr-1" />Ajouter une phrase</Button>
            {items.map((item, i) => (
                <div key={i} className="flex gap-2 items-center bg-gray-50 rounded-lg p-2">
                    <div className="flex-1 space-y-1">
                        <Input value={item.sentence} onChange={e => updateItem(i, "sentence", e.target.value)} placeholder="Ex: Elle a couru vite." className="h-7 text-sm" />
                        <div className="flex gap-2">
                            <Input value={item.verb_hint} onChange={e => updateItem(i, "verb_hint", e.target.value)} placeholder="Verbe clé (ex: a couru)" className="h-6 text-xs flex-1" />
                            <Select value={item.answer} onValueChange={v => updateItem(i, "answer", v)}>
                                <SelectTrigger className="h-6 w-28 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="past">☁️ Passé</SelectItem>
                                    <SelectItem value="present">⛅ Présent</SelectItem>
                                    <SelectItem value="future">🌤️ Futur</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <button onClick={() => removeItem(i)} className="p-1 text-red-400"><Trash2 className="w-3 h-3" /></button>
                </div>
            ))}
        </div>
    );
}

// ─── 10. Conjugueur Fou editor ────────────────────────────────────────────────

function ConjugueurEditor({ config, onChange }: { config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void; }) {
    type ItemType = { pronoun: string; infinitive: string; tense: string; choices: string[]; answer: string };
    const items = (config.items as ItemType[]) || [];

    function addItem() {
        onChange({ ...config, items: [...items, { pronoun: "", infinitive: "", tense: "présent", choices: ["", "", "", ""], answer: "" }] });
    }
    function removeItem(i: number) {
        onChange({ ...config, items: items.filter((_, j) => j !== i) });
    }
    function updateItem(i: number, field: string, value: string) {
        const updated = items.map((it, j) => j === i ? { ...it, [field]: value } : it);
        onChange({ ...config, items: updated });
    }
    function updateChoice(i: number, ci: number, val: string) {
        const updated = items.map((it, j) => {
            if (j !== i) return it;
            const choices = [...it.choices];
            choices[ci] = val;
            return { ...it, choices };
        });
        onChange({ ...config, items: updated });
    }

    return (
        <div className="space-y-3">
            <p className="text-xs text-gray-500">Pronom + Infinitif → l&apos;enfant choisit la bonne forme parmi 4 options. La 1ère option doit être la bonne réponse.</p>
            <Button size="sm" onClick={addItem} className="bg-violet-500 hover:bg-violet-600 text-white"><Plus className="w-3 h-3 mr-1" />Ajouter un exercice</Button>
            {items.map((item, i) => (
                <div key={i} className="border rounded-xl p-3 space-y-2">
                    <div className="flex gap-2">
                        <div className="flex-1 space-y-1">
                            <div className="grid grid-cols-3 gap-1">
                                <Input value={item.pronoun} onChange={e => updateItem(i, "pronoun", e.target.value)} placeholder="Pronom (NOUS)" className="h-7 text-sm uppercase" />
                                <Input value={item.infinitive} onChange={e => updateItem(i, "infinitive", e.target.value)} placeholder="Infinitif (CHANTER)" className="h-7 text-sm uppercase" />
                                <Input value={item.tense} onChange={e => updateItem(i, "tense", e.target.value)} placeholder="Temps (présent)" className="h-7 text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                                {[0, 1, 2, 3].map(ci => (
                                    <Input key={ci} value={item.choices[ci] || ""} onChange={e => updateChoice(i, ci, e.target.value)}
                                        placeholder={`Option ${ci + 1}${ci === 0 ? " ✅" : ""}`} className={`h-7 text-xs ${ci === 0 ? "border-green-400" : ""}`} />
                                ))}
                            </div>
                            <Input value={item.answer} onChange={e => updateItem(i, "answer", e.target.value)} placeholder="Réponse correcte (identique à option 1)" className="h-6 text-xs border-green-400" />
                        </div>
                        <button onClick={() => removeItem(i)} className="p-1 text-red-400"><Trash2 className="w-3 h-3" /></button>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── 11. List Text Editor ────────────────────────────────────────────────────
function ListTextEditor({ config, onChange, field }: { config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void; field: string; }) {
    const list = (config[field] as any[]) || [{ text: "" }, { text: "" }, { text: "" }];
    const items = [...list, ...Array(3)].slice(0, 3).map(it => typeof it === 'string' ? { text: it } : it || { text: "" });

    function update(i: number, val: string) {
        const updated = items.map((it, j) => j === i ? (field === 'words' ? val : { ...it, text: val }) : it);
        onChange({ ...config, [field]: updated });
    }

    return (
        <ThreeLevelWrapper>
            {(i) => (
                <div className="space-y-3">
                    <Label className="text-xs text-gray-500">Contenu (Phrase ou Mot)</Label>
                    <Input value={typeof items[i] === 'string' ? items[i] : items[i].text} onChange={e => update(i, e.target.value)} className="h-9" />
                </div>
            )}
        </ThreeLevelWrapper>
    );
}

// ─── 12. List Items Editor (Grimaces, Exercises, etc) ─────────────────────────
function ListItemsEditor({ config, onChange, slug }: { config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void; slug: string; }) {
    const field = slug === "miroir-grimaces" ? "grimaces" : (slug === "amuz-bouch" ? "exercises" : "items");
    const list = (config[field] as any[]) || [];

    function update(i: number, f: string, v: string) {
        const updated = [...list];
        if (!updated[i]) updated[i] = {};
        if (typeof updated[i] === 'string') updated[i] = { name: updated[i] };
        updated[i] = { ...updated[i], [f]: v };
        onChange({ ...config, [field]: updated });
    }

    return (
        <ThreeLevelWrapper>
            {(i) => (
                <div className="space-y-3">
                    <div>
                        <Label className="text-xs text-gray-500">Nom / Action</Label>
                        <Input value={typeof list[i] === 'string' ? list[i] : (list[i]?.name || list[i]?.word || "")} onChange={e => update(i, "name", e.target.value)} className="h-9" />
                    </div>
                    {slug === "miroir-grimaces" && (
                        <div>
                            <Label className="text-xs text-gray-500">Instruction</Label>
                            <Textarea value={list[i]?.instruction || ""} onChange={e => update(i, "instruction", e.target.value)} className="text-sm h-16" />
                        </div>
                    )}
                </div>
            )}
        </ThreeLevelWrapper>
    );
}

// ─── 13. Prononcio Editor ─────────────────────────────────────────────────────
function PrononcioEditor({ config, onChange }: { config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void; }) {
    const pairs = (config.pairs as any[]) || [{ son1: "S", son2: "CH", words: [] }];
    const ps = [...pairs, ...Array(3)].slice(0, 3).map(p => p || { son1: "", son2: "", words: [] });

    function update(i: number, f: string, v: string) {
        const updated = ps.map((p, j) => j === i ? { ...p, [f]: v } : p);
        onChange({ ...config, pairs: updated });
    }

    return (
        <ThreeLevelWrapper>
            {(i) => (
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs text-gray-500">Son 1</Label>
                            <Input value={ps[i].son1} onChange={e => update(i, "son1", e.target.value)} className="h-8" />
                        </div>
                        <div>
                            <Label className="text-xs text-gray-500">Son 2</Label>
                            <Input value={ps[i].son2} onChange={e => update(i, "son2", e.target.value)} className="h-8" />
                        </div>
                    </div>
                </div>
            )}
        </ThreeLevelWrapper>
    );
}

// ─── 14. Story Editor ─────────────────────────────────────────────────────────
function StoryEditor({ config, onChange }: { config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void; }) {
    const pages = (config.pages as any[]) || [{ text: "", focusWord: "", emoji: "📖" }];

    function update(idx: number, f: string, v: string) {
        const updated = [...pages];
        if (!updated[idx]) updated[idx] = { text: "", focusWord: "", emoji: "📖" };
        updated[idx] = { ...updated[idx], [f]: v };
        onChange({ ...config, pages: updated });
    }

    return (
        <div className="space-y-4">
            {[0, 1, 2].map(i => (
                <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase">Page {i + 1}</p>
                    <Textarea value={pages[i]?.text || ""} onChange={e => update(i, "text", e.target.value)} placeholder="Texte de l'story..." className="text-sm h-20" />
                    <div className="flex gap-2">
                        <Input value={pages[i]?.focusWord || ""} onChange={e => update(i, "focusWord", e.target.value)} placeholder="Mot cible" className="h-8 text-xs flex-1" />
                        <Input value={pages[i]?.emoji || "📖"} onChange={e => update(i, "emoji", e.target.value)} className="h-8 w-12 text-center" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── 15. Grammar Choice Editor ───────────────────────────────────────────────
function GrammarChoiceEditor({ config, onChange }: { config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void; slug: string; }) {
    const items = (config.items as any[]) || (config.rounds as any[]) || [];

    function update(i: number, f: string, v: any) {
        const field = (config.items) ? "items" : "rounds";
        const updated = [...items];
        if (!updated[i]) updated[i] = {};
        updated[i] = { ...updated[i], [f]: v };
        onChange({ ...config, [field]: updated });
    }

    return (
        <ThreeLevelWrapper>
            {(i) => (
                <div className="space-y-3">
                    <Label className="text-xs text-gray-500">Phrase à trous ou Question</Label>
                    <Input value={items[i]?.phrase || items[i]?.question || ""} onChange={e => update(i, items[i]?.phrase ? "phrase" : "question", e.target.value)} className="h-9" />
                </div>
            )}
        </ThreeLevelWrapper>
    );
}

// ─── 16. Prompt Editor ────────────────────────────────────────────────────────
function PromptEditor({ config, onChange, field }: { config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void; field: string; }) {
    const list = (config[field] as any[]) || ["", "", ""];
    const items = [...list, ...Array(3)].slice(0, 3);

    function update(i: number, v: string) {
        const updated = items.map((it, j) => j === i ? v : it);
        onChange({ ...config, [field]: updated });
    }

    return (
        <ThreeLevelWrapper>
            {(i) => (
                <div className="space-y-3">
                    <Label className="text-xs text-gray-500">Prompt / Question</Label>
                    <Textarea value={typeof items[i] === 'string' ? items[i] : (items[i] as any)?.question} onChange={e => update(i, e.target.value)} className="h-20 text-sm" />
                </div>
            )}
        </ThreeLevelWrapper>
    );
}

// ─── 17. List Emoji Editor ────────────────────────────────────────────────────
function ListEmojiEditor({ config, onChange }: { config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void; }) {
    const items = (config.items as any[]) || [{ word: "", emoji: "🍎" }];

    function update(i: number, f: string, v: string) {
        const updated = [...items];
        if (!updated[i]) updated[i] = { word: "", emoji: "🍎" };
        updated[i] = { ...updated[i], [f]: v };
        onChange({ ...config, items: updated });
    }

    return (
        <ThreeLevelWrapper>
            {(i) => (
                <div className="flex gap-2">
                    <Input value={items[i]?.word} onChange={e => update(i, "word", e.target.value)} placeholder="Mot..." className="h-9 flex-1" />
                    <Input value={items[i]?.emoji} onChange={e => update(i, "emoji", e.target.value)} className="h-9 w-12 text-center" />
                </div>
            )}
        </ThreeLevelWrapper>
    );
}

// ─── Main GameEditor Component ────────────────────────────────────────────────

export function GameEditor({
    games,
    therapistId,
    existingConfigs,
    onConfigSaved,
}: {
    games: Game[];
    therapistId: string;
    existingConfigs: CustomConfig[];
    onConfigSaved: () => void;
}) {
    const supabase = createClient();
    const [isOpen, setIsOpen] = useState(false);
    const [editingConfig, setEditingConfig] = useState<CustomConfig | null>(null);
    const [selectedGameId, setSelectedGameId] = useState("");
    const [configName, setConfigName] = useState("");
    const [currentConfig, setCurrentConfig] = useState<Record<string, unknown>>({});
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Only show editable games
    const editableGames = games.filter(g => EDITABLE_SLUGS.includes(g.slug));

    function openNew() {
        setEditingConfig(null);
        const firstGame = editableGames[0];
        setSelectedGameId(firstGame?.id || "");
        setConfigName("");
        setCurrentConfig(JSON.parse(JSON.stringify(firstGame?.config || {})));
        setIsOpen(true);
    }

    function openEdit(cfg: CustomConfig) {
        setEditingConfig(cfg);
        setSelectedGameId(cfg.game_id);
        setConfigName(cfg.name);
        setCurrentConfig(JSON.parse(JSON.stringify(cfg.config)));
        setIsOpen(true);
    }

    function handleGameChange(gameId: string) {
        const game = editableGames.find(g => g.id === gameId);
        setSelectedGameId(gameId);
        setCurrentConfig(JSON.parse(JSON.stringify(game?.config || {})));
    }

    async function handleSave() {
        if (!configName.trim()) { toast.error("Donnez un nom à cette configuration"); return; }
        setSaving(true);

        if (editingConfig) {
            const { error } = await supabase.from("custom_game_configs")
                .update({ name: configName, config: currentConfig, updated_at: new Date().toISOString() })
                .eq("id", editingConfig.id);
            if (error) toast.error("Erreur lors de la sauvegarde");
            else { toast.success("Configuration mise à jour !"); setIsOpen(false); onConfigSaved(); }
        } else {
            const { error } = await supabase.from("custom_game_configs")
                .insert({ therapist_id: therapistId, game_id: selectedGameId, name: configName, config: currentConfig });
            if (error) toast.error("Erreur lors de la sauvegarde");
            else { toast.success("Configuration créée !"); setIsOpen(false); onConfigSaved(); }
        }
        setSaving(false);
    }

    async function handleDelete(id: string) {
        setDeletingId(id);
        const { error } = await supabase.from("custom_game_configs").delete().eq("id", id);
        if (error) toast.error("Erreur lors de la suppression");
        else { toast.success("Configuration supprimée"); onConfigSaved(); }
        setDeletingId(null);
    }

    const selectedGame = editableGames.find(g => g.id === selectedGameId);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-gray-900">Mes configurations personnalisées</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Créez vos propres versions des jeux</p>
                </div>
                <Button onClick={openNew} className="bg-gradient-to-r from-violet-500 to-orange-400 hover:from-violet-600 hover:to-orange-500 text-white">
                    <Plus className="w-4 h-4 mr-2" />Créer un jeu
                </Button>
            </div>

            {/* Existing configs */}
            {existingConfigs.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
                    <Pencil className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Aucune configuration personnalisée</p>
                    <p className="text-sm text-gray-400 mt-1">Créez votre premier jeu personnalisé avec vos propres mots</p>
                    <Button onClick={openNew} variant="outline" className="mt-4"><Plus className="w-4 h-4 mr-2" />Créer ma première configuration</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {existingConfigs.map(cfg => {
                        const game = editableGames.find(g => g.id === cfg.game_id) || games.find(g => g.id === cfg.game_id);

                        // Emoji discovery logic
                        const getEmoji = (name: string) => {
                            const n = name.toLowerCase();
                            if (n.includes("maison")) return "🏠";
                            if (n.includes("son")) return "🔊";
                            if (n.includes("animal") || n.includes("chat") || n.includes("chien")) return "🐶";
                            if (n.includes("scol") || n.includes("école")) return "🏫";
                            if (n.includes("mang") || n.includes("food")) return "🍎";
                            if (n.includes("transp") || n.includes("voiture")) return "🚗";
                            if (n.includes("artic") || n.includes("langue")) return "👅";
                            if (n.includes("gramm") || n.includes("conjug")) return "📝";
                            if (n.includes("phono") || n.includes("rime")) return "👂";
                            return "✨";
                        };

                        return (
                            <div key={cfg.id} className="group relative bg-white border border-gray-100 rounded-[2rem] p-5 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-500/5 transition-all duration-300 overflow-hidden">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-violet-50 opacity-0 group-hover:opacity-100 rounded-bl-full transition-opacity" />

                                <div className="flex items-start justify-between mb-4 relative z-10">
                                    <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                                        {getEmoji(cfg.name)}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => openEdit(cfg)} className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-all">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(cfg.id)} disabled={deletingId === cfg.id}
                                            className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="relative z-10">
                                    <h4 className="font-black text-gray-900 leading-tight mb-1 group-hover:text-violet-600 transition-colors">{cfg.name}</h4>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        <div className="w-1 h-1 rounded-full bg-violet-300" />
                                        {game?.name || "Jeu personnalisé"}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Editor Dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Pencil className="w-5 h-5 text-violet-500" />
                            {editingConfig ? "Modifier la configuration" : "Nouvelle configuration de jeu"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-5 mt-2">
                        {/* Config name */}
                        <div>
                            <Label>Nom de la configuration</Label>
                            <Input value={configName} onChange={e => setConfigName(e.target.value)}
                                placeholder="Ex: Sons du S pour Emma, Memory animaux avancé..." className="mt-1" />
                        </div>

                        {/* Game selection (only for new) */}
                        {!editingConfig && (
                            <div>
                                <Label>Jeu à personnaliser</Label>
                                <Select value={selectedGameId} onValueChange={handleGameChange}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Choisir un jeu..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {editableGames.map(g => (
                                            <SelectItem key={g.id} value={g.id}>
                                                <div className="flex items-center gap-2">
                                                    {GAME_ICONS[g.slug] || <Gamepad2 className="w-4 h-4" />}
                                                    {g.name}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-gray-400 mt-1">Toujours 3 niveaux : Facile, Moyen, Difficile.</p>
                            </div>
                        )}

                        {/* Game-specific editor */}
                        <div className="border-t pt-4">
                            <p className="text-sm font-medium text-gray-700 mb-4">
                                Contenu du jeu
                                {selectedGame && <span className="ml-2 text-xs text-gray-400 font-normal">— {selectedGame.name}</span>}
                            </p>

                            {selectedGame?.slug === "attrape-les-sons" && <AttrapeEditor config={currentConfig} onChange={setCurrentConfig} />}
                            {selectedGame?.slug === "memory-vocabulaire" && <MemoryEditor config={currentConfig} onChange={setCurrentConfig} />}
                            {selectedGame?.slug === "simon-dit" && <SimonEditor config={currentConfig} onChange={setCurrentConfig} />}
                            {selectedGame?.slug === "train-des-syllabes" && <TrainSyllabesEditor config={currentConfig} onChange={setCurrentConfig} />}
                            {selectedGame?.slug === "peche-aux-rimes" && <PecheRimesEditor config={currentConfig} onChange={setCurrentConfig} />}
                            {selectedGame?.slug === "architecte-des-phrases" && <ArchitecteEditor config={currentConfig} onChange={setCurrentConfig} />}
                            {selectedGame?.slug === "supermarche" && <SupermarcheEditor config={currentConfig} onChange={setCurrentConfig} />}
                            {selectedGame?.slug === "mot-troue" && <MotTroueEditor config={currentConfig} onChange={setCurrentConfig} />}
                            {selectedGame?.slug === "tapis-volant-du-temps" && <TapisTempsEditor config={currentConfig} onChange={setCurrentConfig} />}
                            {selectedGame?.slug === "conjugueur-fou" && <ConjugueurEditor config={currentConfig} onChange={setCurrentConfig} />}

                            {/* New Generic Editors */}
                            {["virelangues", "bulles-mots", "lecteur-flash"].includes(selectedGame?.slug || "") &&
                                <ListTextEditor config={currentConfig} onChange={setCurrentConfig} field={selectedGame?.slug === "virelangues" ? "items" : (selectedGame?.slug === "bulles-mots" ? "words" : "words")} />}

                            {["miroir-grimaces", "amuz-bouch", "mimes-actions", "boite-surprises", "devinettes-objets"].includes(selectedGame?.slug || "") &&
                                <ListItemsEditor config={currentConfig} onChange={setCurrentConfig} slug={selectedGame?.slug || ""} />}

                            {["prononcio", "prononcio-s-z", "prononcio-f-v", "prononcio-p-b", "prononcio-t-d", "tri-lettres"].includes(selectedGame?.slug || "") &&
                                <PrononcioEditor config={currentConfig} onChange={setCurrentConfig} />}

                            {["chiffon-cochon", "jean-geant"].includes(selectedGame?.slug || "") &&
                                <StoryEditor config={currentConfig} onChange={setCurrentConfig} />}

                            {["loto-pronoms", "spirale-pronoms", "course-des-accords", "train-des-natures"].includes(selectedGame?.slug || "") &&
                                <GrammarChoiceEditor config={currentConfig} onChange={setCurrentConfig} slug={selectedGame?.slug || ""} />}

                            {["histoires-libres", "langue-au-chat", "qui-est-ce"].includes(selectedGame?.slug || "") &&
                                <PromptEditor config={currentConfig} onChange={setCurrentConfig} field={selectedGame?.slug === "langue-au-chat" ? "questions" : (selectedGame?.slug === "qui-est-ce" ? "rounds" : "prompts")} />}

                            {["imagier-couleurs", "imagier-corps", "imagier-ecole", "imagier-transports", "de-premiers-mots"].includes(selectedGame?.slug || "") &&
                                <ListEmojiEditor config={currentConfig} onChange={setCurrentConfig} />}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2 border-t">
                            <Button onClick={handleSave} disabled={saving}
                                className="flex-1 bg-gradient-to-r from-violet-500 to-orange-400 hover:from-violet-600 hover:to-orange-500 text-white">
                                {saving ? "Sauvegarde..." : <><Save className="w-4 h-4 mr-2" />{editingConfig ? "Mettre à jour" : "Sauvegarder"}</>}
                            </Button>
                            <Button variant="outline" onClick={() => setIsOpen(false)}>Annuler</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
