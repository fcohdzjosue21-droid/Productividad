import React, { useState, useEffect } from 'react';
import TaskContainer from './components/TaskContainer';
import CalendarView from './components/CalendarView';
import './styles/ZenStyles.css';
import { Wind, Moon, Sun, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('zen-tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeView, setActiveView] = useState('tasks'); // 'tasks' or 'calendar'

  useEffect(() => {
    localStorage.setItem('zen-tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Reminder check logic
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const currentDate = now.toISOString().split('T')[0];

      setTasks(prevTasks => {
        let changed = false;
        const newTasks = prevTasks.map(task => {
          if (task.reminderTime === currentTime && task.date === currentDate && !task.notified && !task.completed) {
            changed = true;
            if (Notification.permission === 'granted') {
              new Notification('Recordatorio ZenFlow', {
                body: `Es hora de: ${task.text}`,
                icon: '/vite.svg'
              });
            }
            return { ...task, notified: true };
          }
          return task;
        });
        return changed ? newTasks : prevTasks;
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const requestPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  };

  return (
    <>
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div className="app-container">
        <aside className="sidebar">
          <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>
            <Wind size={32} color="var(--primary-color)" />
            <span>ZenFlow</span>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div
              className={`nav-link ${activeView === 'tasks' ? 'active' : ''}`}
              onClick={() => setActiveView('tasks')}
            >
              <Sun size={20} /> Actividades
            </div>
            <div
              className={`nav-link ${activeView === 'calendar' ? 'active' : ''}`}
              onClick={() => setActiveView('calendar')}
            >
              <CalendarIcon size={20} /> Calendario
            </div>

            <div style={{ marginTop: '2rem' }}>
              <CalendarView tasks={tasks} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
            </div>
          </nav>

          <div className="sidebar-footer" style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', backdropFilter: 'blur(5px)' }}>
            <button
              onClick={requestPermission}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginBottom: '10px', background: 'white', color: 'var(--text-primary)' }}
            >
              <Bell size={18} /> Activar Alertas
            </button>
            <p style={{ fontSize: '0.8rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              "Cada momento es una oportunidad para la paz."
            </p>
          </div>
        </aside>

        <main className="main-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              style={{ height: '100%' }}
            >
              {activeView === 'tasks' ? (
                <TaskContainer tasks={tasks} setTasks={setTasks} selectedDate={selectedDate} />
              ) : (
                <CalendarView tasks={tasks} selectedDate={selectedDate} setSelectedDate={setSelectedDate} large={true} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </>
  );
}

export default App;
