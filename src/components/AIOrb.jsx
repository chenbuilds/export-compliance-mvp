import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const AIOrb = ({ mode = 'hero', mood = 'idle' }) => {
    // Mode: 'hero' (Centered large) | 'widget' (Bottom right small)
    // Mood: 'idle' | 'thinking' | 'success' | 'warning'

    // 1. Mouse Follow Logic (Hero Mode Only)
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth spring physics for cursor follow
    const springConfig = { damping: 25, stiffness: 150 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    useEffect(() => {
        if (mode !== 'hero') return;

        const handleMouseMove = (e) => {
            // Calculate offset from center (0,0)
            const { innerWidth, innerHeight } = window;
            const x = e.clientX - innerWidth / 2;
            const y = e.clientY - innerHeight / 2;

            // Move orb 10% of distance
            mouseX.set(x * 0.1);
            mouseY.set(y * 0.1);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mode, mouseX, mouseY]);

    // 2. Dynamic Styles based on Mood
    const getGradient = () => {
        switch (mood) {
            case 'success':
                return 'conic-gradient(from 180deg at 50% 50%, #34d399, #10b981, #059669, #34d399)'; // Emerald
            case 'warning':
                return 'conic-gradient(from 180deg at 50% 50%, #fcd34d, #f59e0b, #b45309, #fcd34d)'; // Amber/Orange
            case 'thinking':
                return 'conic-gradient(from 180deg at 50% 50%, #818cf8, #6366f1, #4f46e5, #818cf8)'; // Indigo Pulse
            default: // idle - Lavender/Aqua/Blue mix
                return 'conic-gradient(from 180deg at 50% 50%, #a78bfa, #2dd4bf, #3b82f6, #a78bfa)';
        }
    };

    // 3. Animation Variants
    const breathingVariants = {
        idle: {
            scale: [1, 1.05, 1],
            opacity: [0.7, 0.8, 0.7],
            rotate: [0, 360],
            transition: {
                scale: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 20, repeat: Infinity, ease: "linear" }
            }
        },
        thinking: {
            scale: [0.95, 1.1, 0.95],
            opacity: [0.8, 1, 0.8],
            rotate: [0, -360],
            transition: {
                scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 5, repeat: Infinity, ease: "linear" }
            }
        },
        widget: {
            scale: [1, 1.05, 1],
            transition: { duration: 4, repeat: Infinity }
        }
    };

    return (
        <motion.div
            layout // Magic Motion: Automatically animates position changes between 'hero' and 'widget' modes
            layoutId="ai-orb-container"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed z-0 pointer-events-none flex items-center justify-center
                ${mode === 'hero'
                    ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] blur-[100px]'
                    : 'bottom-8 right-8 w-16 h-16 blur-[20px] z-50'
                }`}
            style={{
                x: mode === 'hero' ? springX : 0,
                y: mode === 'hero' ? springY : 0,
            }}
        >
            {/* The Orb Core */}
            <motion.div
                className="w-full h-full rounded-full opacity-70 mix-blend-screen"
                style={{ background: getGradient() }}
                animate={mood === 'thinking' ? 'thinking' : 'idle'}
                variants={breathingVariants}
            />

            {/* Outer Glow Configurable */}
            <div className={`absolute inset-0 rounded-full ${mode === 'hero' ? 'blur-3xl' : 'blur-lg'} -z-10 bg-indigo-500/20`} />
        </motion.div>
    );
};

export default AIOrb;
