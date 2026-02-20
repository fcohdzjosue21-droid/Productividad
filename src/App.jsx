import React, { useState, useEffect } from 'react';
import TaskContainer from './components/TaskContainer';
import CalendarView from './components/CalendarView';
import './styles/ZenStyles.css';
import { Wind, Moon, Sun } from 'lucide-react';

function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('zen-tasks');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('zen-tasks', JSON.stringify(tasks));
  }, [tasks]);

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', fontWeight: 'bold' }}>
          <Wind size={32} color="var(--primary-color)" />
          <span>ZenFlow</span>
        </div>

        <nav style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <CalendarView tasks={tasks} />
          </div>
        </nav>

        <div className="sidebar-footer" style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(255,255,255,0.3)', borderRadius: '12px' }}>
          <p style={{ fontSize: '0.8rem', textAlign: 'center' }}>"La paz comienza con una mente organizada."</p>
        </div>
      </aside>

      <main className="main-content">
        <div style={{ position: 'absolute', top: '2rem', right: '2.5rem', display: 'flex', gap: '1rem' }}>
          <div style={{ padding: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }}>
            <Sun size={20} color="#f6e05e" />
          </div>
        </div>
        <TaskContainer tasks={tasks} setTasks={setTasks} />
      </main>
    </div>
  );
}

export default App;
