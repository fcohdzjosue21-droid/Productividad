import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Trash2, Calendar as CalendarIcon, CheckCircle, Bell,
    Coffee, Book, Star, Heart, Cloud, Sun, Moon, Wind, MessageSquare,
    Save
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

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

const categoriesList = ['General', 'Estudio', 'Trabajo', 'Personal', 'Salud'];

const TaskContainer = ({ tasks, setTasks, selectedDate, syncStatus, setSyncStatus, user }) => {
    const [subtasks, setSubtasks] = useState({}); // {taskId: [subtasks]}
    const [newTask, setNewTask] = useState('');
    const [urgency, setUrgency] = useState('low');
    const [category, setCategory] = useState('General');
    const [isMainObjective, setIsMainObjective] = useState(false);
    const [selectedIcon, setSelectedIcon] = useState('wind');
    const [reminderTime, setReminderTime] = useState('');

    const [taskDate, setTaskDate] = useState(selectedDate || new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if (selectedDate) setTaskDate(selectedDate);
    }, [selectedDate]);

    // Filters MVP
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('Todas');
    const [showOnlyEssential, setShowOnlyEssential] = useState(false);

    // Gamification MVP System
    const [points, setPoints] = useState(() => parseInt(localStorage.getItem('zen-points') || '0', 10));
    const [streak, setStreak] = useState(() => parseInt(localStorage.getItem('zen-streak') || '0', 10));

    useEffect(() => {
        localStorage.setItem('zen-points', points.toString());
    }, [points]);

    useEffect(() => {
        localStorage.setItem('zen-streak', streak.toString());
    }, [streak]);

    // Simple Leveling system: every 100 points is a level.
    const currentLevel = Math.floor(points / 100) + 1;
    const pointsToNextLevel = 100 - (points % 100);

    const getLevelTitle = (level) => {
        if (level < 3) return "Principiante";
        if (level < 7) return "Constante";
        if (level < 12) return "Productivo";
        return "Experto Zen";
    };

    const addTask = async () => {
        if (!newTask.trim()) return;
        setSyncStatus('syncing');
        const task = {
            id: Date.now(),
            text: newTask,
            urgency,
            category,
            isMainObjective,
            icon: selectedIcon,
            completed: false,
            date: taskDate,
            reminderTime: reminderTime || null,
            notified: false,
            user_id: user?.id
        };

        try {
            const { error } = await supabase.from('tasks').insert([task]);
            if (error) throw error;
            setTasks([...tasks, task]);
            setSyncStatus('synced');

            setNewTask('');
            setReminderTime('');
            setIsMainObjective(false);

            // Play subtle sound
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
            audio.volume = 0.2;
            audio.play();
        } catch (e) {
            console.error("Error adding task:", e);
            setSyncStatus('error');
        }
    };

    const fetchSubtasks = async (taskId) => {
        try {
            const { data, error } = await supabase
                .from('subtasks')
                .select('*')
                .eq('task_id', taskId);
            if (error) throw error;
            setSubtasks(prev => ({ ...prev, [taskId]: data }));
        } catch (e) {
            console.error("Error fetching subtasks:", e);
        }
    };

    const addSubtask = async (taskId, text) => {
        if (!text.trim()) return;
        try {
            const newSubtask = { task_id: taskId, text, completed: false };
            const { data, error } = await supabase
                .from('subtasks')
                .insert([newSubtask])
                .select();
            if (error) throw error;
            setSubtasks(prev => ({
                ...prev,
                [taskId]: [...(prev[taskId] || []), data[0]]
            }));
        } catch (e) {
            console.error("Error adding subtask:", e);
        }
    };

    const toggleSubtask = async (taskId, subtaskId, completed) => {
        try {
            const { error } = await supabase
                .from('subtasks')
                .update({ completed: !completed })
                .eq('id', subtaskId);
            if (error) throw error;
            setSubtasks(prev => ({
                ...prev,
                [taskId]: prev[taskId].map(st => st.id === subtaskId ? { ...st, completed: !completed } : st)
            }));
        } catch (e) {
            console.error("Error toggling subtask:", e);
        }
    };

    useEffect(() => {
        if (tasks.length > 0) {
            tasks.forEach(task => {
                if (!subtasks[task.id]) fetchSubtasks(task.id);
            });
        }
    }, [tasks]);

    const removeTask = async (id) => {
        setSyncStatus('syncing');
        try {
            const { error } = await supabase.from('tasks').delete().eq('id', id);
            if (error) throw error;
            setTasks(tasks.filter(t => t.id !== id));
            setSyncStatus('synced');
        } catch (e) {
            console.error("Error removing task:", e);
            setSyncStatus('error');
        }
    };

    const toggleComplete = async (id) => {
        setSyncStatus('syncing');
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        try {
            const { error } = await supabase
                .from('tasks')
                .update({ completed: !task.completed })
                .eq('id', id);

            if (error) throw error;

            const newTasks = tasks.map(t => {
                if (t.id === id) {
                    if (!t.completed) {
                        // Rewarding task completion
                        const reward = t.isMainObjective ? 50 : 10;
                        setPoints(prev => prev + reward);

                        try {
                            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
                            audio.volume = 0.3;
                            audio.play();
                        } catch (e) { }
                    } else {
                        // Penalizing if unchecked
                        const penalty = t.isMainObjective ? 50 : 10;
                        setPoints(prev => Math.max(0, prev - penalty));
                    }
                    return { ...t, completed: !t.completed };
                }
                return t;
            });
            setTasks(newTasks);
            setSyncStatus('synced');
        } catch (e) {
            console.error("Error toggling task:", e);
            setSyncStatus('error');
        }
    };

    // Sort tasks: Incomplete first, then by urgency (high > medium > low), then by date
    const filteredTasks = tasks
        .filter(t => selectedDate ? t.date === selectedDate : true)
        .filter(t => filterCategory === 'Todas' ? true : t.category === filterCategory)
        .filter(t => searchQuery ? t.text.toLowerCase().includes(searchQuery.toLowerCase()) : true)
        .filter(t => showOnlyEssential ? (t.urgency === 'high' || t.isMainObjective) : true)
        .sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            const priority = { high: 0, medium: 1, low: 2 };
            if (priority[a.urgency] !== priority[b.urgency]) return priority[a.urgency] - priority[b.urgency];
            return b.id - a.id;
        });
    const currentDayTasks = tasks.filter(t => t.date === (selectedDate || new Date().toISOString().split('T')[0]));
    const totalCount = currentDayTasks.length;
    const completedCount = currentDayTasks.filter(t => t.completed).length;
    const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    // Victory effect & Streak calculation
    useEffect(() => {
        if (totalCount > 0 && progressPercent === 100) {
            // Only reward streak once per day, pseudo-logic for MVP
            const lastStreakDate = localStorage.getItem('zen-last-streak-date');
            const todayStr = new Date().toISOString().split('T')[0];

            if (lastStreakDate !== todayStr) {
                setStreak(prev => prev + 1);
                localStorage.setItem('zen-last-streak-date', todayStr);
            }

            try {
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
                audio.volume = 0.4;
                audio.play();
            } catch (e) { }
        }
    }, [progressPercent, totalCount]);

    // Virtual Pet State Logic
    const getPetEmoji = () => {
        if (streak >= 3) return '🔥🦊'; // On fire!
        if (progressPercent === 100) return '🎉🦊'; // Happy!
        if (progressPercent > 50) return '🦊'; // Neutral active
        if (totalCount === 0) return '💤🦊'; // Sleeping / no tasks
        return '🥺🦊'; // Needs attention
    };
    const getPetMessage = () => {
        if (streak >= 3) return `¡Estás imparable! Racha de ${streak} días.`;
        if (progressPercent === 100) return '¡Día perfecto, buen trabajo!';
        if (progressPercent > 50) return '¡Ya casi lo logramos!';
        if (totalCount === 0) return 'No hay planes para hoy. A descansar...';
        return '¡Vamos, tú puedes con esto!';
    };

    return (
        <div className="task-manager">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                    <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2.2rem', fontWeight: '400', color: 'var(--ink)', letterSpacing: '-0.03em' }}>
                        {selectedDate ? `Agenda del ${selectedDate.split('-').reverse().join('/')}` : 'Mi Agenda'}
                    </h1>
                    <p style={{ color: 'var(--ink-50)', fontSize: '0.9rem', marginTop: '4px' }}>Organiza tus actividades con claridad.</p>
                </div>

                {/* Gamification Dashboard (Points, Level, Pet) */}
                <div style={{ background: 'var(--surface)', padding: '12px 20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))', animation: progressPercent === 100 ? 'float 3s ease-in-out infinite' : 'none' }}>
                        {getPetEmoji()}
                    </div>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <span>Lvl {currentLevel}: {getLevelTitle(currentLevel)}</span>
                            <span title="Faltan puntos para el siguiente nivel" style={{ color: 'var(--ink-50)' }}>+{pointsToNextLevel}</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--ink)', fontWeight: 500, margin: '2px 0 4px 0' }}>{getPetMessage()}</p>
                        <div style={{ display: 'flex', gap: '10px', fontSize: '0.75rem', color: 'var(--ink-80)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>⭐ {points} pts</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: streak > 0 ? '#ef4444' : 'inherit' }}>🔥 {streak} días</span>
                        </div>
                    </div>
                </div>
            </header>

            <div style={{ marginBottom: '1.5rem' }}>
                {/* Progress Bar */}
                {totalCount > 0 && (
                    <div style={{ marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--ink-50)', marginBottom: '8px', fontWeight: 600 }}>
                            <span>Progreso del Día</span>
                            <span>{completedCount} / {totalCount} ({progressPercent}%)</span>
                        </div>
                        <div style={{ height: '8px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${progressPercent}%`, background: progressPercent === 100 ? '#4CAF50' : 'var(--accent)', transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                        </div>
                    </div>
                )}
            </div>

            <div className="input-section" style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xs)' }}>
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

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface-2)', padding: '4px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--ink-50)', fontWeight: 500 }} title="Fecha de la actividad">Fecha:</span>
                        <input
                            type="date"
                            className="task-input"
                            style={{ width: 'auto', margin: 0, padding: '4px', border: 'none', background: 'none', fontSize: '0.85rem' }}
                            value={taskDate}
                            onChange={(e) => setTaskDate(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface-2)', padding: '4px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--ink-50)', fontWeight: 500 }} title="Hora recordatorio">Hora:</span>
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
                    <select value={category} onChange={e => setCategory(e.target.value)} className="task-input" style={{ width: 'auto', marginBottom: 0 }}>
                        {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    <button
                        className={`btn ${isMainObjective ? 'btn-primary' : 'btn-ghost'}`}
                        style={{ padding: '8px', minWidth: '40px', display: 'flex', justifyContent: 'center' }}
                        title="Marcar como Objetivo Principal del Día"
                        onClick={() => setIsMainObjective(!isMainObjective)}
                    >
                        👑
                    </button>

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

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
                <input
                    type="text"
                    placeholder="🔍 Buscar tarea..."
                    className="task-input"
                    style={{ width: '200px', marginBottom: 0, padding: '8px 12px' }}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />

                <div style={{ display: 'flex', gap: '10px' }}>
                    <select
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                        className="task-input"
                        style={{ width: 'auto', marginBottom: 0, padding: '8px 12px' }}
                    >
                        <option value="Todas">Categorías (Todas)</option>
                        {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    <button
                        className={`btn ${showOnlyEssential ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setShowOnlyEssential(!showOnlyEssential)}
                        style={{ padding: '8px 16px' }}
                    >
                        ✨ Solo lo esencial
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
                                style={{ flexDirection: 'column', alignItems: 'stretch' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', width: '100%' }}>
                                    <CheckCircle
                                        size={28}
                                        color={task.completed ? 'var(--ink-30)' : 'var(--ink)'}
                                        style={{ cursor: 'pointer', flexShrink: 0 }}
                                        onClick={() => toggleComplete(task.id)}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <TaskIcon size={18} color="var(--ink-30)" />
                                            <span style={{
                                                textDecoration: task.completed ? 'line-through' : 'none',
                                                color: task.completed ? 'var(--ink-30)' : 'var(--ink)',
                                                fontSize: '1.1rem',
                                                fontWeight: '500'
                                            }}>
                                                {task.text}
                                            </span>
                                        </div>
                                        <div className="task-meta">
                                            <span className={`priority-tag priority-${task.urgency}`}>{task.urgency}</span>
                                            {task.category && task.category !== 'General' && (
                                                <span className="priority-tag" style={{ background: 'var(--surface-2)', color: 'var(--ink-50)' }}>
                                                    {task.category}
                                                </span>
                                            )}
                                            {task.isMainObjective && <span title="Objetivo Principal del Día" style={{ fontSize: '1rem' }}>👑</span>}
                                            <span style={{ marginLeft: 'auto' }}>{task.date}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeTask(task.id)}
                                        style={{ background: 'none', border: 'none', color: 'var(--ink-30)', cursor: 'pointer', padding: '10px', transition: 'color 0.2s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--ink)'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--ink-30)'}
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>

                                {/* Subtasks UI */}
                                <div style={{ marginTop: '15px', paddingLeft: '43px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                                    {subtasks[task.id]?.map(st => (
                                        <div key={st.id} className="subtask-item">
                                            <input
                                                type="checkbox"
                                                checked={st.completed}
                                                onChange={() => toggleSubtask(task.id, st.id, st.completed)}
                                                style={{ cursor: 'pointer' }}
                                            />
                                            <span className={`subtask-text ${st.completed ? 'completed' : ''}`}>
                                                {st.text}
                                            </span>
                                        </div>
                                    ))}
                                    <input
                                        type="text"
                                        placeholder="+ Añadir subtarea..."
                                        className="subtask-input"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                addSubtask(task.id, e.target.value);
                                                e.target.value = '';
                                            }
                                        }}
                                    />
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                {filteredTasks.length === 0 && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ textAlign: 'center', color: 'var(--ink-30)', marginTop: '3rem', fontFamily: "'DM Serif Display', serif", fontStyle: 'italic', fontSize: '1.1rem' }}
                    >
                        No hay actividades pendientes aquí. Respira profundo y disfruta el momento.
                    </motion.p>
                )}
            </div>
        </div>
    );
};

export default TaskContainer;
