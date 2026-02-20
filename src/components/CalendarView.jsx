import React from 'react';
import { motion } from 'framer-motion';

const CalendarView = ({ tasks }) => {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const currentDay = today.getDate();

    const getTasksForDay = (day) => {
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return tasks.filter(t => t.date === dateStr);
    };

    return (
        <div className="calendar-container">
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Calendario Zen</h3>
            <div className="calendar-grid">
                {[...Array(daysInMonth)].map((_, i) => {
                    const day = i + 1;
                    const dayTasks = getTasksForDay(day);
                    const isToday = day === currentDay;

                    return (
                        <motion.div
                            key={day}
                            whileHover={{ scale: 1.1 }}
                            className={`calendar-day ${isToday ? 'active' : ''}`}
                        >
                            <span style={{ fontWeight: isToday ? 'bold' : 'normal' }}>{day}</span>
                            {dayTasks.length > 0 && (
                                <div style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    background: 'var(--accent-color)',
                                    position: 'absolute',
                                    bottom: '8px'
                                }} />
                            )}
                        </motion.div>
                    );
                })}
            </div>
            <div style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <p>• Puntos indican actividades programadas.</p>
            </div>
        </div>
    );
};

export default CalendarView;
