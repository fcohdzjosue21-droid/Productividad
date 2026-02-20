import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Trash2, Calendar as CalendarIcon, CheckCircle, Bell,
    Coffee, Book, Star, Heart, Cloud, Sun, Moon, Wind, MessageSquare
} from 'lucide-react';

const icons = [
    { id: 'wind', Icon: Wind },
    { id: 'coffee', Icon: Coffee },
    { id: 'book', Icon: Book },
    { id: 'star', Icon: Star },
    { id: 'heart', Icon: Heart },
    { id: 'cloud', Icon: Cloud },
    { id: 'sun', Icon: Sun },
    { id: 'moon', Icon: Moon },
    { id: 'chat', Icon: MessageSquare },
];

const TaskContainer = ({ tasks, setTasks, selectedDate }) => {
    const [newTask, setNewTask] = useState('');
    const [urgency, setUrgency] = useState('low');
    const [selectedIcon, setSelectedIcon] = useState('wind');
    const [reminderTime, setReminderTime] = useState('');

    const addTask = () => {
        if (!newTask.trim()) return;
        const task = {
            id: Date.now(),
            text: newTask,
            urgency,
            icon: selectedIcon,
            completed: false,
            date: selectedDate || new Date().toISOString().split('T')[0],
            reminderTime: reminderTime || null,
            notified: false
        };
        setTasks([...tasks, task]);
        setNewTask('');
        setReminderTime('');

        // Play subtle sound if possible
        try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
            audio.volume = 0.2;
            audio.play();
        } catch (e) { }
    };

    const removeTask = (id) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    const toggleComplete = (id) => {
        const newTasks = tasks.map(t => {
            if (t.id === id) {
                if (!t.completed) {
                    // Play success sound
                    try {
                        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
                        audio.volume = 0.3;
                        audio.play();
                    } catch (e) { }
                }
                return { ...t, completed: !t.completed };
            }
            return t;
        });
        setTasks(newTasks);
    };

    // Sort tasks: Incomplete first, then by urgency (high > medium > low), then by date
    const filteredTasks = tasks
        .filter(t => selectedDate ? t.date === selectedDate : true)
        .sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            const priority = { high: 0, medium: 1, low: 2 };
            if (priority[a.urgency] !== priority[b.urgency]) return priority[a.urgency] - priority[b.urgency];
            return b.id - a.id;
        });

    return (
        <div className="task-manager">
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {selectedDate ? `Actividades para el ${selectedDate.split('-').reverse().join('/')}` : 'Mi Flujo Zen'}
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>Organiza tus pensamientos con serenidad.</p>
            </header>

            <div className="input-section" style={{ background: 'rgba(255,255,255,0.3)', padding: '1.5rem', borderRadius: '20px', marginBottom: '2rem' }}>
                <input
                    type="text"
                    className="task-input"
                    placeholder="Escribe algo que quieras realizar..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTask()}
                />

                <div style={{ display: 'flex', gap: '15px', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="icon-picker" style={{ margin: 0 }}>
                        {icons.map(({ id, Icon }) => (
                            <div
                                key={id}
                                className={`icon-option ${selectedIcon === id ? 'selected' : ''}`}
                                onClick={() => setSelectedIcon(id)}
                            >
                                <Icon size={18} />
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.5)', padding: '4px 12px', borderRadius: '12px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Recordatorio:</span>
                        <input
                            type="time"
                            className="task-input"
                            style={{ width: 'auto', margin: 0, padding: '4px', border: 'none', background: 'none' }}
                            value={reminderTime}
                            onChange={(e) => setReminderTime(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <select
                        value={urgency}
                        onChange={(e) => setUrgency(e.target.value)}
                        className="task-input"
                        style={{ width: 'auto', marginBottom: 0 }}
                    >
                        <option value="low">Prioridad: Suave</option>
                        <option value="medium">Prioridad: Media</option>
                        <option value="high">Prioridad: Alta</option>
                    </select>
                    <button className="btn btn-primary" onClick={addTask} style={{ marginLeft: 'auto' }}>
                        <Plus size={20} /> Crear Actividad
                    </button>
                </div>
            </div>

            <div className="task-list">
                <AnimatePresence mode="popLayout">
                    {filteredTasks.map((task) => {
                        const TaskIcon = icons.find(i => i.id === task.icon)?.Icon || Wind;
                        return (
                            <motion.div
                                key={task.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={`task-card urgency-${task.urgency} ${task.urgency === 'high' && !task.completed ? 'pulse-slow' : ''}`}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
                                    <CheckCircle
                                        size={28}
                                        color={task.completed ? 'var(--primary-color)' : '#cbd5e0'}
                                        style={{ cursor: 'pointer', flexShrink: 0 }}
                                        onClick={() => toggleComplete(task.id)}
                                    />
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <TaskIcon size={18} color="var(--text-secondary)" />
                                            <span style={{
                                                textDecoration: task.completed ? 'line-through' : 'none',
                                                color: task.completed ? 'var(--text-secondary)' : 'inherit',
                                                fontSize: '1.1rem',
                                                fontWeight: '500'
                                            }}>
                                                {task.text}
                                            </span>
                                        </div>
                                        <div className="task-meta">
                                            <span className={`priority-tag priority-${task.urgency}`}>{task.urgency}</span>
                                            <span>{task.date}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeTask(task.id)}
                                    style={{ background: 'none', border: 'none', color: '#feb2b2', cursor: 'pointer', padding: '10px' }}
                                >
                                    <Trash2 size={20} />
                                </button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                {filteredTasks.length === 0 && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '3rem', fontStyle: 'italic' }}
                    >
                        No hay actividades pendientes aquí. Respira profundo y disfruta el momento.
                    </motion.p>
                )}
            </div>
        </div>
    );
};

export default TaskContainer;
