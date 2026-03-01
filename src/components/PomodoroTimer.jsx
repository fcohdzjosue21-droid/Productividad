import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';

const PomodoroTimer = () => {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState('work'); // 'work' or 'break'

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(() => { });

            // Switch mode
            if (mode === 'work') {
                setMode('break');
                setTimeLeft(5 * 60);
            } else {
                setMode('work');
                setTimeLeft(25 * 60);
            }
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, mode]);

    const toggle = () => setIsActive(!isActive);
    const reset = () => {
        setIsActive(false);
        setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    return (
        <div className="pomodoro-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '5px' }}>
                {mode === 'work' ? <Brain size={16} color="var(--accent)" /> : <Coffee size={16} color="var(--accent)" />}
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-50)' }}>
                    {mode === 'work' ? 'Enfoque' : 'Descanso'}
                </span>
            </div>
            <div className="pomodoro-timer">{formatTime(timeLeft)}</div>
            <div className="pomodoro-controls">
                <button className="btn btn-ghost" onClick={toggle} style={{ padding: '8px' }}>
                    {isActive ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <button className="btn btn-ghost" onClick={reset} style={{ padding: '8px' }}>
                    <RotateCcw size={18} />
                </button>
            </div>
        </div>
    );
};

export default PomodoroTimer;
