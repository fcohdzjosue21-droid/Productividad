import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Calendar as CalendarIcon, CheckCircle } from 'lucide-react';

const TaskContainer = ({ tasks, setTasks, onDateSelect }) => {
    const [newTask, setNewTask] = useState('');
    const [urgency, setUrgency] = useState('low');

    const addTask = () => {
        if (!newTask.trim()) return;
        const task = {
            id: Date.now(),
            text: newTask,
            urgency,
            completed: false,
            date: new Date().toISOString().split('T')[0]
        };
        setTasks([...tasks, task]);
        setNewTask('');
    };

    const removeTask = (id) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    const toggleComplete = (id) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    return (
        <div className="task-manager">
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>Mis Actividades</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Organiza tu día con calma.</p>
            </header>

            <div className="input-section" style={{ marginBottom: '2rem' }}>
                <input
                    type="text"
                    className="task-input"
                    placeholder="¿Qué tienes en mente hoy?"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTask()}
                />
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <select
                        value={urgency}
                        onChange={(e) => setUrgency(e.target.value)}
                        className="task-input"
                        style={{ width: 'auto', marginBottom: 0 }}
                    >
                        <option value="low">Suave</option>
                        <option value="medium">Media</option>
                        <option value="high">Alta Urgencia</option>
                    </select>
                    <button className="btn btn-primary" onClick={addTask}>
                        <Plus size={20} /> Añadir
                    </button>
                </div>
            </div>

            <div className="task-list">
                <AnimatePresence>
                    {tasks.map((task) => (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`task-card urgency-${task.urgency} ${task.urgency === 'high' ? 'pulse-slow' : ''}`}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <CheckCircle
                                    size={24}
                                    color={task.completed ? 'var(--primary-color)' : '#cbd5e0'}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => toggleComplete(task.id)}
                                />
                                <span style={{
                                    textDecoration: task.completed ? 'line-through' : 'none',
                                    color: task.completed ? 'var(--text-secondary)' : 'inherit'
                                }}>
                                    {task.text}
                                </span>
                            </div>
                            <button
                                onClick={() => removeTask(task.id)}
                                style={{ background: 'none', border: 'none', color: '#feb2b2', cursor: 'pointer' }}
                            >
                                <Trash2 size={20} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default TaskContainer;
