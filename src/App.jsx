import React, { useState, useEffect } from 'react';
import TaskContainer from './components/TaskContainer';
import CalendarView from './components/CalendarView';
import NotificationToast from './components/NotificationToast';
import { supabase } from './lib/supabaseClient';
import './styles/ZenStyles.css';
import { Wind, Moon, Sun, Bell, Calendar as CalendarIcon, CloudSync, CloudOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced', 'syncing', 'error'
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeView, setActiveView] = useState('tasks'); // 'tasks' or 'calendar'
  const [activeNotification, setActiveNotification] = useState(null);

  // Fetch tasks on mount
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setSyncStatus('syncing');
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .order('id', { ascending: false });

        if (error) throw error;
        setTasks(data || []);
        setSyncStatus('synced');
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setSyncStatus('error');
        // Fallback to local storage if supabase fails
        const saved = localStorage.getItem('zen-tasks');
        if (saved) setTasks(JSON.parse(saved));
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
    // Expose for retry
    window.refreshZenTasks = fetchTasks;
  }, []);

  // Save to LocalStorage as fallback
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('zen-tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  // Reminder check logic
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const currentDate = now.toISOString().split('T')[0];

      setTasks(prevTasks => {
        let changed = false;
        const newTasks = prevTasks.map(task => {
          if (task.reminderTime === currentTime && task.date === currentDate && !task.notified && !task.completed) {
            changed = true;

            // 1. Browser Notification
            if (Notification.permission === 'granted') {
              new Notification('Recordatorio ZenFlow', {
                body: `Es hora de: ${task.text}`,
                icon: '/vite.svg'
              });
            }

            // 2. In-App Notification (Toast)
            setActiveNotification(task.text);

            // 3. Sound
            try {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
              audio.volume = 0.4;
              audio.play();
            } catch (e) { console.error("Error playing sound", e); }

            return { ...task, notified: true };
          }
          return task;
        });
        return changed ? newTasks : prevTasks;
      });
    };

    const interval = setInterval(checkReminders, 10000); // Check every 10 seconds
    checkReminders(); // Initial check

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

          <div
            onClick={() => window.refreshZenTasks && window.refreshZenTasks()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.8rem',
              padding: '6px 12px',
              borderRadius: '20px',
              background: syncStatus === 'error' ? '#fed2d2' : 'rgba(255,255,255,0.4)',
              color: syncStatus === 'error' ? '#c53030' : 'var(--text-secondary)',
              marginBottom: '1.5rem',
              width: 'fit-content',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            className={syncStatus === 'syncing' ? 'pulse-slow' : ''}
          >
            {syncStatus === 'synced' ? <CloudSync size={14} /> : syncStatus === 'syncing' ? <CloudSync size={14} className="spinning" /> : <CloudOff size={14} />}
            {syncStatus === 'synced' ? 'Sincronizado' : syncStatus === 'syncing' ? 'Sincronizando...' : 'Error (Reintentar)'}
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
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <div className="floating">Respirando...</div>
                </div>
              ) : activeView === 'tasks' ? (
                <TaskContainer
                  tasks={tasks}
                  setTasks={setTasks}
                  selectedDate={selectedDate}
                  syncStatus={syncStatus}
                  setSyncStatus={setSyncStatus}
                />
              ) : (
                <CalendarView tasks={tasks} selectedDate={selectedDate} setSelectedDate={setSelectedDate} large={true} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <NotificationToast
        message={activeNotification}
        onClose={() => setActiveNotification(null)}
      />
    </>
  );
}

export default App;
