import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, CheckCircle2 } from 'lucide-react';

const StatsView = ({ tasks }) => {
    // Process data for the last 7 days
    const stats = useMemo(() => {
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });

        const counts = last7Days.reduce((acc, date) => {
            acc[date] = tasks.filter(t => t.date === date && t.completed).length;
            return acc;
        }, {});

        const max = Math.max(...Object.values(counts), 1);

        return {
            days: last7Days.map(date => ({
                date,
                label: new Date(date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short' }),
                count: counts[date],
                height: (counts[date] / max) * 100
            })),
            totalCompleted: tasks.filter(t => t.completed).length,
            average: (tasks.filter(t => t.completed).length / (tasks.length || 1) * 100).toFixed(0)
        };
    }, [tasks]);

    return (
        <div style={{ padding: '20px' }}>
            <h1 className="page-title">Estadísticas <em>Zen</em></h1>
            <p className="page-subtitle">Tu camino hacia la productividad consciente.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--ink-50)', fontSize: '0.8rem', marginBottom: '10px' }}>
                        <CheckCircle2 size={16} /> TOTAL COMPLETADO
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.totalCompleted}</div>
                </div>
                <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--ink-50)', fontSize: '0.8rem', marginBottom: '10px' }}>
                        <TrendingUp size={16} /> EFICIENCIA
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.average}%</div>
                </div>
            </div>

            <div style={{ background: 'var(--surface)', padding: '30px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--ink-50)', fontSize: '0.9rem', marginBottom: '30px' }}>
                    <BarChart2 size={18} /> ACTIVIDAD ÚLTIMOS 7 DÍAS
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '200px', paddingBottom: '30px', position: 'relative' }}>
                    {/* Grid lines */}
                    <div style={{ position: 'absolute', inset: '0 0 30px 0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
                        {[0, 1, 2, 3].map(i => (
                            <div key={i} style={{ borderTop: '1px dashed var(--border)', width: '100%' }} />
                        ))}
                    </div>

                    {stats.days.map((day, i) => (
                        <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', zIndex: 1 }}>
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${day.height}%` }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                style={{
                                    width: '30px',
                                    background: 'var(--accent)',
                                    borderRadius: '4px 4px 0 0',
                                    minHeight: day.count > 0 ? '4px' : '0',
                                    position: 'relative'
                                }}
                            >
                                {day.count > 0 && (
                                    <div style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem', fontWeight: 700 }}>
                                        {day.count}
                                    </div>
                                )}
                            </motion.div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--ink-30)', fontWeight: 600 }}>{day.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ fontStyle: 'italic', color: 'var(--ink-30)', textAlign: 'center', fontSize: '0.9rem' }}>
                "La medición es el primer paso para la mejora continua."
            </div>
        </div>
    );
};

export default StatsView;
