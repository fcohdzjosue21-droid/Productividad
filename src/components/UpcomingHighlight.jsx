import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flame, Clock, AlertCircle } from 'lucide-react';

/**
 * UpcomingHighlight
 * Shows a horizontal strip of important (high/medium) upcoming tasks
 * with a countdown: "HOY", "MAÑANA", "en X días", or "VENCIDA"
 */
const UpcomingHighlight = ({ tasks }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const important = useMemo(() => {
        return tasks
            .filter((t) => !t.completed && (t.urgency === 'high' || t.urgency === 'medium') && t.date)
            .map((t) => {
                const taskDate = new Date(t.date + 'T00:00:00');
                const diff = Math.round((taskDate - today) / (1000 * 60 * 60 * 24));
                return { ...t, diff };
            })
            .sort((a, b) => a.diff - b.diff)
            .slice(0, 6); // max 6 cards
    }, [tasks]);

    if (important.length === 0) return null;

    const label = (diff) => {
        if (diff < 0) return { text: 'VENCIDA', color: '#1a1a1a', bg: '#fff1f0', border: '#ffd5d2' };
        if (diff === 0) return { text: 'HOY', color: '#fff', bg: '#0f0e0d', border: '#0f0e0d' };
        if (diff === 1) return { text: 'MAÑANA', color: '#2d2c2a', bg: '#fffff0', border: '#e8e800' };
        return { text: `en ${diff} días`, color: '#6b6a67', bg: '#f2f1ee', border: '#e2e0db' };
    };

    return (
        <div style={{ marginBottom: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Flame size={16} color="var(--ink-50)" />
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-30)' }}>
                    Próximas Importantes
                </span>
            </div>

            {/* Horizontal scroll strip */}
            <div style={{
                display: 'flex',
                gap: '10px',
                overflowX: 'auto',
                paddingBottom: '6px',
                scrollbarWidth: 'none',
            }}>
                {important.map((task, i) => {
                    const badge = label(task.diff);
                    return (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.06 }}
                            style={{
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                padding: '12px 14px',
                                minWidth: '160px',
                                maxWidth: '200px',
                                flexShrink: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                cursor: 'default',
                            }}
                            whileHover={{ y: -3, boxShadow: 'var(--shadow-sm)' }}
                        >
                            {/* Badge */}
                            <span style={{
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                padding: '2px 8px',
                                borderRadius: '99px',
                                background: badge.bg,
                                color: badge.color,
                                border: `1px solid ${badge.border}`,
                                width: 'fit-content',
                                fontFamily: "'JetBrains Mono', monospace",
                            }}>
                                {badge.text}
                            </span>

                            {/* Task text */}
                            <p style={{
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                color: 'var(--ink)',
                                lineHeight: 1.3,
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                margin: 0,
                            }}>
                                {task.text}
                            </p>

                            {/* Date + priority */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: 'auto' }}>
                                {task.urgency === 'high'
                                    ? <Flame size={12} color="var(--ink-50)" />
                                    : <Clock size={12} color="var(--ink-30)" />
                                }
                                <span style={{ fontSize: '0.7rem', color: 'var(--ink-30)', fontFamily: "'JetBrains Mono', monospace" }}>
                                    {task.date.split('-').reverse().join('/')}
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default UpcomingHighlight;
