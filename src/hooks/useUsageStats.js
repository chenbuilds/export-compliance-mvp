import { useState, useEffect } from 'react';

const STORAGE_KEY = 'export_shield_stats';

export const useUsageStats = () => {
    const [stats, setStats] = useState({
        licenseChecks: 0,
        entityScreening: 0,
        forcedLabor: 0,
        docs: 0
    });

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed && typeof parsed === 'object') {
                    setStats(parsed);
                }
            } catch (e) {
                console.warn('Failed to parse usage stats', e);
                // Optional: clear bad data
                localStorage.removeItem(STORAGE_KEY);
            }
        }
    }, []);

    const increment = (key) => {
        setStats(prev => {
            const next = { ...prev, [key]: (prev[key] || 0) + 1 };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    };

    return { stats, increment };
};
