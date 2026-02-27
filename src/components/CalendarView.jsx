import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarView = ({ tasks, selectedDate, setSelectedDate, large = false }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

    const getTasksForDay = (day) => {
        const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return tasks.filter(t => t.date === dateStr);
    };

    const isSameDay = (day, date1) => {
        if (!date1) return false;
        const d = new Date(date1);
        return d.getDate() === day && d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
    };

    if (large) {
        return (
            <div className="calendar-large">
                <div className="calendar-header">
                    <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2.2rem', fontWeight: '400', color: 'var(--ink)', letterSpacing: '-0.03em' }}>
                        Calendario
                    </h1>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <h3 style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--ink-50)', fontSize: '1rem', margin: 0, fontWeight: '600', letterSpacing: '0.02em' }}>
                            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </h3>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <button className="calendar-nav-btn" onClick={prevMonth}><ChevronLeft size={24} /></button>
                            <button className="calendar-nav-btn" onClick={nextMonth}><ChevronRight size={24} /></button>
                        </div>
                    </div>
                </div>

                <div className="calendar-grid-large">
                    {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map(d => (
                        <div key={d} style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--text-secondary)', paddingBottom: '10px' }}>{d}</div>
                    ))}
                    {/* Empty cells for padding */}
                    {[...Array(firstDayOfMonth)].map((_, i) => <div key={`empty-${i}`} />)}

                    {[...Array(daysInMonth)].map((_, i) => {
                        const day = i + 1;
                        const dayTasks = getTasksForDay(day);
                        const active = isSameDay(day, selectedDate);

                        return (
                            <motion.div
                                key={day}
                                whileHover={{ y: -5, background: 'var(--surface-2)' }}
                                onClick={() => {
                                    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                    setSelectedDate(dateStr === selectedDate ? null : dateStr);
                                }}
                                className={`calendar-day-large ${active ? 'active' : ''}`}
                            >
                                <span className="day-number">{day}</span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', overflow: 'hidden' }}>
                                    {dayTasks.map((t, idx) => (
                                        <div key={idx} className="mini-task-pill" style={{
                                            background: t.urgency === 'high' ? 'var(--ink)' : t.urgency === 'medium' ? 'var(--ink-50)' : 'var(--border-strong)',
                                            color: 'var(--bg)',
                                            opacity: t.completed ? 0.5 : 1
                                        }}>
                                            {t.text}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <div style={{ display: 'flex', gap: '5px' }}>
                    <button className="calendar-nav-btn" onClick={prevMonth}><ChevronLeft size={18} /></button>
                    <button className="calendar-nav-btn" onClick={nextMonth}><ChevronRight size={18} /></button>
                </div>
            </div>

            <div className="calendar-grid">
                {/* Empty cells for padding */}
                {[...Array(firstDayOfMonth)].map((_, i) => <div key={`empty-${i}`} />)}

                {[...Array(daysInMonth)].map((_, i) => {
                    const day = i + 1;
                    const dayTasks = getTasksForDay(day);
                    const active = isSameDay(day, selectedDate);

                    return (
                        <motion.div
                            key={day}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                setSelectedDate(dateStr === selectedDate ? null : dateStr);
                            }}
                            className={`calendar-day ${active ? 'active' : ''}`}
                        >
                            <span style={{ fontWeight: active ? 'bold' : 'normal' }}>{day}</span>
                            <div style={{ display: 'flex', gap: '2px', position: 'absolute', bottom: '4px' }}>
                                {dayTasks.slice(0, 3).map((t, idx) => (
                                    <div key={idx} style={{
                                        width: '4px',
                                        height: '4px',
                                        borderRadius: '50%',
                                        background: t.urgency === 'high' ? 'var(--urgency-high)' : t.urgency === 'medium' ? 'var(--urgency-medium)' : 'var(--urgency-low)'
                                    }} />
                                ))}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarView;
