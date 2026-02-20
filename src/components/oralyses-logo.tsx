import React from "react";

interface OralysesLogoProps {
    size?: number;
    className?: string;
}

export function OralysesLogo({ size = 36, className = "" }: OralysesLogoProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 220 220"
            width={size}
            height={size}
            className={className}
        >
            <defs>
                <linearGradient id="g-vio" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#CC9AFF" />
                    <stop offset="55%" stopColor="#8A30DC" />
                    <stop offset="100%" stopColor="#4E10A0" />
                </linearGradient>
                <linearGradient id="g-ora" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFE098" />
                    <stop offset="100%" stopColor="#F05C18" />
                </linearGradient>
                <linearGradient id="g-lav" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#E4C8FF" />
                    <stop offset="100%" stopColor="#A858E8" />
                </linearGradient>
                <linearGradient id="g-pea" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FFE8B8" />
                    <stop offset="100%" stopColor="#F8A858" />
                </linearGradient>
                <filter id="sh-main" x="-35%" y="-35%" width="170%" height="170%">
                    <feDropShadow
                        dx="0"
                        dy="16"
                        stdDeviation="28"
                        floodColor="#4E10A0"
                        floodOpacity="0.32"
                    />
                </filter>
                <filter id="sh-ora" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow
                        dx="0"
                        dy="10"
                        stdDeviation="18"
                        floodColor="#F05C18"
                        floodOpacity="0.35"
                    />
                </filter>
                <filter id="sh-lav" x="-40%" y="-40%" width="180%" height="180%">
                    <feDropShadow
                        dx="0"
                        dy="8"
                        stdDeviation="14"
                        floodColor="#8A30DC"
                        floodOpacity="0.20"
                    />
                </filter>
            </defs>

            {/* Blob lavande */}
            <path
                d="M 48 44 C 22 30, 8 56, 16 82 C 24 108, 56 112, 70 94 C 84 76, 76 54, 48 44 Z"
                fill="url(#g-lav)"
                opacity="0.52"
                filter="url(#sh-lav)"
            />
            {/* Blob principal violet */}
            <path
                d="M 112 14 C 164 6, 212 46, 210 100 C 208 156, 176 194, 134 208 C 92 222, 40 204, 18 164 C -4 124, 8 68, 42 42 C 64 24, 82 20, 112 14 Z"
                fill="url(#g-vio)"
                filter="url(#sh-main)"
            />
            {/* Blob orange */}
            <path
                d="M 162 128 C 184 114, 218 126, 218 154 C 218 180, 198 206, 174 208 C 150 210, 132 192, 136 170 C 140 150, 146 140, 162 128 Z"
                fill="url(#g-ora)"
                filter="url(#sh-ora)"
            />
            {/* Petite bulle pêche */}
            <path
                d="M 60 172 C 46 162, 34 174, 40 188 C 46 202, 68 204, 74 190 C 79 178, 72 180, 60 172 Z"
                fill="url(#g-pea)"
                opacity="0.78"
            />
            {/* Highlight blanc - blob principal */}
            <path
                d="M 88 28 C 114 18, 156 36, 166 64 C 170 76, 160 84, 150 74 C 136 54, 108 44, 88 54 C 72 62, 68 44, 88 28 Z"
                fill="white"
                opacity="0.16"
            />
            {/* Highlight blanc - blob orange */}
            <path
                d="M 168 134 C 180 126, 198 136, 198 152 C 198 160, 190 160, 184 152 C 178 142, 172 138, 168 134 Z"
                fill="white"
                opacity="0.22"
            />
            {/* Highlight blanc - petite bulle */}
            <path
                d="M 50 176 C 44 172, 40 180, 46 186 C 48 189, 54 188, 54 184 C 54 180, 53 178, 50 176 Z"
                fill="white"
                opacity="0.3"
            />
        </svg>
    );
}
