"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";

interface GameResult {
  score: number;
  starsEarned: number;
  accuracy: number;
  itemsCompleted: number;
  itemsTotal: number;
  mistakes: Array<{ item: string; expected: string; got: string }>;
  durationSeconds: number;
}

interface Shape {
  id: string;
  type: "circle" | "square" | "triangle";
  color: string;
  size: "small" | "big";
  label: string;
}

interface SimonLevel {
  level: number;
  name: string;
  instructions: Array<{ text: string; targets: string[] }>;
}

interface SimonConfig {
  levels: SimonLevel[];
}

const SHAPES: Shape[] = [
  { id: "red-circle", type: "circle", color: "#ef4444", size: "big", label: "Cercle rouge" },
  { id: "blue-square", type: "square", color: "#3b82f6", size: "big", label: "Carre bleu" },
  { id: "yellow-triangle", type: "triangle", color: "#eab308", size: "big", label: "Triangle jaune" },
  { id: "big-red-circle", type: "circle", color: "#ef4444", size: "big", label: "Grand cercle rouge" },
  { id: "red-square", type: "square", color: "#ef4444", size: "big", label: "Carre rouge" },
  { id: "small-yellow-triangle", type: "triangle", color: "#eab308", size: "small", label: "Petit triangle jaune" },
];

function ShapeComponent({ shape, onClick, highlighted, disabled }: {
  shape: Shape;
  onClick: () => void;
  highlighted: boolean;
  disabled: boolean;
}) {
  const size = shape.size === "small" ? "w-16 h-16" : "w-20 h-20";
  
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.9 }}
      className={`${size} flex items-center justify-center transition-all ${
        highlighted ? "ring-4 ring-green-400 ring-offset-2" : ""
      } ${disabled ? "opacity-50" : "cursor-pointer hover:scale-105"}`}
    >
      {shape.type === "circle" && (
        <div className={`${size} rounded-full`} style={{ backgroundColor: shape.color }} />
      )}
      {shape.type === "square" && (
        <div className={`${size} rounded-lg`} style={{ backgroundColor: shape.color }} />
      )}
      {shape.type === "triangle" && (
        <svg viewBox="0 0 100 100" className={size}>
          <polygon points="50,10 90,90 10,90" fill={shape.color} />
        </svg>
      )}
    </motion.button>
  );
}

export function SimonDit({
  config,
  difficulty,
  onComplete,
}: {
  config: Record<string, unknown>;
  difficulty: number;
  onComplete: (result: GameResult) => void;
}) {
  const gameConfig = config as unknown as SimonConfig;
  const levelIndex = Math.min(difficulty - 1, gameConfig.levels.length - 1);
  const level = gameConfig.levels[levelIndex];

  const instructions = useMemo(() => level.instructions, [level]);
  const [currentInstruction, setCurrentInstruction] = useState(0);
  const [selectedShapes, setSelectedShapes] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState<Array<{ item: string; expected: string; got: string }>>([]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [showInstruction, setShowInstruction] = useState(true);

  const current = instructions[currentInstruction];
  const isSimonSays = currentInstruction % 2 === 0; // alternating simon says
  const totalInstructions = instructions.length;

  // Available shapes for this level  
  const availableShapes = useMemo(() => {
    const shapeIds = new Set<string>();
    instructions.forEach((inst) => inst.targets.forEach((t) => shapeIds.add(t)));
    return SHAPES.filter((s) => shapeIds.has(s.id) || ["red-circle", "blue-square", "yellow-triangle"].includes(s.id));
  }, [instructions]);

  function handleShapeClick(shapeId: string) {
    if (feedback) return;

    const newSelected = [...selectedShapes, shapeId];
    setSelectedShapes(newSelected);

    // Check if we have enough selections
    if (newSelected.length >= current.targets.length) {
      // Check accuracy
      const isCorrect = current.targets.every((t, i) => newSelected[i] === t) ||
        (current.targets.length === newSelected.length &&
          current.targets.every((t) => newSelected.includes(t)));

      if (isCorrect) {
        setFeedback("correct");
        setScore((s) => s + 1);
      } else {
        setFeedback("wrong");
        setMistakes((m) => [
          ...m,
          {
            item: current.text,
            expected: current.targets.join(", "),
            got: newSelected.join(", "),
          },
        ]);
      }

      setTimeout(() => {
        setFeedback(null);
        setSelectedShapes([]);
        setShowInstruction(true);

        if (currentInstruction + 1 >= totalInstructions) {
          const finalScore = score + (isCorrect ? 1 : 0);
          const accuracy = Math.round((finalScore / totalInstructions) * 100);
          const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;
          onComplete({
            score: finalScore,
            starsEarned: stars,
            accuracy,
            itemsCompleted: totalInstructions,
            itemsTotal: totalInstructions,
            mistakes: isCorrect ? mistakes : [...mistakes, {
              item: current.text,
              expected: current.targets.join(", "),
              got: newSelected.join(", "),
            }],
            durationSeconds: 0,
          });
        } else {
          setCurrentInstruction((i) => i + 1);
        }
      }, 1000);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Progress */}
      <div className="flex gap-1 mb-6">
        {instructions.map((_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full ${
              i < currentInstruction
                ? "bg-green-400"
                : i === currentInstruction
                ? "bg-violet-400"
                : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* Level */}
      <div className="text-center mb-4">
        <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
          {level.name}
        </span>
      </div>

      {/* Instruction */}
      <motion.div
        key={currentInstruction}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`text-center p-6 rounded-2xl mb-6 ${
          feedback === "correct"
            ? "bg-green-100 border-2 border-green-300"
            : feedback === "wrong"
            ? "bg-red-100 border-2 border-red-300"
            : "bg-white border-2 border-violet-200"
        }`}
      >
        <p className="text-lg font-bold text-gray-900">
          {isSimonSays && <span className="text-violet-600">Simon dit : </span>}
          {current.text}
        </p>
        {!isSimonSays && (
          <p className="text-xs text-amber-600 mt-1">
            Attention ! Simon n&apos;a pas dit...
          </p>
        )}
        <p className="text-xs text-gray-400 mt-2">
          Touche {current.targets.length} forme{current.targets.length > 1 ? "s" : ""}
        </p>
      </motion.div>

      {/* Shapes grid */}
      <div className="flex flex-wrap justify-center gap-6">
        {availableShapes.map((shape) => (
          <ShapeComponent
            key={shape.id}
            shape={shape}
            onClick={() => handleShapeClick(shape.id)}
            highlighted={selectedShapes.includes(shape.id)}
            disabled={feedback !== null}
          />
        ))}
      </div>

      <div className="text-center mt-6 text-sm text-gray-400">
        {currentInstruction + 1} / {totalInstructions}
      </div>
    </div>
  );
}
