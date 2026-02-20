import React, { useState, useEffect } from 'react';
import TaskContainer from './components/TaskContainer';
import CalendarView from './components/CalendarView';
import './styles/ZenStyles.css';
import { Wind, Moon, Sun, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('zen-tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    localStorage.setItem('zen-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const requestPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          <Wind size={32} color="var(--primary-color)" />
          <span>ZenFlow</span>
        </div>

        <nav style={{ marginTop: '1rem' }}>
          <CalendarView tasks={tasks} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
        </nav>

        <div className="sidebar-footer" style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(255,255,255,0.3)', borderRadius: '12px' }}>
          <button
            onClick={requestPermission}
            className="btn"
            style={{ width: '100%', justifyContent: 'center', background: 'white', marginBottom: '10px' }}
          >
            <Bell size={18} /> Notificaciones
          </button>
          <p style={{ fontSize: '0.8rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            "Respira. Todo fluye en su momento."
          </p>
        </div>
      </aside>

      <main className="main-content">
        <div style={{ position: 'absolute', top: '2rem', right: '2.5rem', display: 'flex', gap: '1rem', zIndex: 10 }}>
          <motion.div
            whileHover={{ scale: 1.1 }}
            style={{ padding: '10px', borderRadius: '50%', background: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}
          >
            <Moon size={20} color="var(--text-secondary)" />
          </motion.div>
        </div>
        <TaskContainer tasks={tasks} setTasks={setTasks} selectedDate={selectedDate} />
      </main>
    </div>
  );
}

export default App;
