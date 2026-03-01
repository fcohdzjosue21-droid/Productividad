import React, { useState, useEffect } from 'react';
import TaskContainer from './components/TaskContainer';
import CalendarView from './components/CalendarView';
import Auth from './components/Auth';
import NotificationToast from './components/NotificationToast';
import PomodoroTimer from './components/PomodoroTimer';
import StatsView from './components/StatsView';
import { supabase } from './lib/supabaseClient';
import './styles/ZenStyles.css';
import { BookOpen, LayoutList, Calendar as CalendarIcon, CloudSync, CloudOff, LogOut, Bell, RefreshCw, Palette, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced', 'syncing', 'error'
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeView, setActiveView] = useState('tasks'); // 'tasks' or 'calendar'
  const [activeNotification, setActiveNotification] = useState(null);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('zen-theme') || 'zen');
  const [focusTask, setFocusTask] = useState(null);

  useEffect(() => {
    window.enterFocusMode = (id) => {
      const task = tasks.find(t => t.id === id);
      if (task) setFocusTask(task);
    };
  }, [tasks]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('zen-theme', theme);
  }, [theme]);

  // Phase 1: Mood & Daily Quote
  const dailyPhrases = [
    "Un paso a la vez.",
    "La constancia es la clave del éxito.",
    "Respira profundo y disfruta el momento.",
    "Hoy es un gran día para avanzar.",
    "El progreso lento sigue siendo progreso.",
    "Tu única competencia eres tú mismo.",
    "Haz de hoy tu obra maestra."
  ];
  const [dailyQuote] = useState(dailyPhrases[new Date().getDay() % dailyPhrases.length]);

  const todayStr = new Date().toISOString().split('T')[0];
  const [mood, setMood] = useState(() => {
    const saved = localStorage.getItem('zen-mood-data');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === todayStr) return parsed.mood;
    }
    return null;
  });

  useEffect(() => {
    if (mood) {
      localStorage.setItem('zen-mood-data', JSON.stringify({ date: todayStr, mood }));
    }
  }, [mood, todayStr]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch tasks on mount OR when user changes
  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) {
        setTasks([]);
        return;
      }
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
        setActiveNotification(`No se pudo conectar con la nube: ${err.message || 'Error desconocido'}`);
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
  }, [user]);

  // Save to LocalStorage as fallback
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('zen-tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  // ── Helper: show notification via Service Worker (works on mobile PWA) ──
  const showMobileNotification = async (title, body) => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Route through SW — this works on Android & iOS PWA
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        body,
        tag: `zenflow-${Date.now()}`,
      });
      return;
    }
    // Fallback: desktop browser native notification
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.svg' });
    }
  };

  // ── Reminder check logic ──────────────────────────────────
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

            // 1. Notification (SW for mobile, native for desktop)
            showMobileNotification('📋 ZenFlow — Recordatorio', `Es hora de: ${task.text}`);

            // 2. In-App Toast
            setActiveNotification(task.text);

            // 3. Sound
            try {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
              audio.volume = 0.5;
              audio.play().catch(() => { });
            } catch (e) { /* silent */ }

            return { ...task, notified: true };
          }
          return task;
        });
        return changed ? newTasks : prevTasks;
      });
    };

    const interval = setInterval(checkReminders, 30000); // Check every 30s
    checkReminders();
    return () => clearInterval(interval);
  }, []);

  // ── Request notification permission ──────────────────────
  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setTimeout(() => {
        showMobileNotification('✅ ZenFlow', '¡Notificaciones activas! Te avisaremos puntualmente.');
      }, 500);
    }
  };

  return (
    <>
      <div className="bg-blobs">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      {!user ? (
        <Auth onAuthSuccess={setUser} />
      ) : (
        <div className="app-container">
          <aside className="sidebar">
            {/* Logo */}
            <div className="logo">
              <div className="logo-icon">
                <BookOpen size={20} color="#fff" />
              </div>
              <div>
                <div className="logo-text">ZenFlow</div>
                <div className="logo-subtitle">Agenda Digital</div>
              </div>
            </div>

            {/* Sync badge */}
            <div
              className={`sync-badge${syncStatus === 'error' ? ' error' : ''}`}
              onClick={() => window.refreshZenTasks && window.refreshZenTasks()}
              title="Estado de sincronización"
            >
              {syncStatus === 'synced' && <CloudSync size={13} />}
              {syncStatus === 'syncing' && <RefreshCw size={13} className="spinning" />}
              {syncStatus === 'error' && <CloudOff size={13} />}
              {syncStatus === 'synced' ? 'Sincronizado' : syncStatus === 'syncing' ? 'Sincronizando…' : 'Error · Reintentar'}
            </div>

            {/* Navigation */}
            <nav>
              <div
                className={`nav-link ${activeView === 'tasks' ? 'active' : ''}`}
                onClick={() => setActiveView('tasks')}
              >
                <LayoutList size={18} /> Actividades
              </div>
              <div
                className={`nav-link ${activeView === 'calendar' ? 'active' : ''}`}
                onClick={() => setActiveView('calendar')}
              >
                <CalendarIcon size={18} /> Calendario
              </div>
              <div
                className={`nav-link ${activeView === 'stats' ? 'active' : ''}`}
                onClick={() => setActiveView('stats')}
              >
                <BarChart2 size={18} /> Estadísticas
              </div>
            </nav>

            {/* Pomodoro Timer */}
            <div style={{ padding: '0 0 1.5rem 0' }}>
              <PomodoroTimer />
            </div>

            {/* Footer */}
            <div className="sidebar-footer">
              <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                <button
                  onClick={() => setTheme('zen')}
                  className={`btn btn-ghost ${theme === 'zen' ? 'active' : ''}`}
                  style={{ flex: 1, padding: '5px', fontSize: '0.7rem' }}
                  title="Tema Zen"
                >
                  Zen
                </button>
                <button
                  onClick={() => setTheme('forest')}
                  className={`btn btn-ghost ${theme === 'forest' ? 'active' : ''}`}
                  style={{ flex: 1, padding: '5px', fontSize: '0.7rem' }}
                  title="Tema Bosque"
                >
                  Bosque
                </button>
                <button
                  onClick={() => setTheme('sunset')}
                  className={`btn btn-ghost ${theme === 'sunset' ? 'active' : ''}`}
                  style={{ flex: 1, padding: '5px', fontSize: '0.7rem' }}
                  title="Tema Atardecer"
                >
                  Ocaso
                </button>
                <button
                  onClick={() => setTheme('deep-night')}
                  className={`btn btn-ghost ${theme === 'deep-night' ? 'active' : ''}`}
                  style={{ flex: 1, padding: '5px', fontSize: '0.7rem' }}
                  title="Tema Noche"
                >
                  Noche
                </button>
              </div>
              <button
                onClick={requestPermission}
                className="btn btn-ghost"
                style={{ width: '100%', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)', background: 'transparent', fontSize: '0.82rem' }}
              >
                <Bell size={15} /> Activar Alertas
              </button>
              <button
                onClick={() => supabase.auth.signOut()}
                className="btn btn-ghost"
                style={{ width: '100%', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)', background: 'transparent', fontSize: '0.82rem' }}
              >
                <LogOut size={15} /> Cerrar Sesión
              </button>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '10px' }}>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: '8px', fontWeight: 600 }}>¿Cómo te sientes hoy?</p>
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                  {['😄', '😐', '😢'].map(m => (
                    <span
                      key={m}
                      onClick={() => setMood(m)}
                      style={{
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        opacity: mood === m ? 1 : 0.4,
                        transform: mood === m ? 'scale(1.2)' : 'scale(1)',
                        transition: 'all 0.2s'
                      }}
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
              <p className="sidebar-quote">"{dailyQuote}"</p>
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
                style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}
              >
                {loading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <div className="floating">Cargando tu agenda…</div>
                  </div>
                ) : activeView === 'tasks' ? (
                  <TaskContainer
                    tasks={tasks}
                    setTasks={setTasks}
                    selectedDate={selectedDate}
                    syncStatus={syncStatus}
                    setSyncStatus={setSyncStatus}
                    user={user}
                  />
                ) : activeView === 'calendar' ? (
                  <CalendarView tasks={tasks} selectedDate={selectedDate} setSelectedDate={setSelectedDate} large={true} />
                ) : (
                  <StatsView tasks={tasks} />
                )}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Nav para mobile */}
          <nav className="mobile-nav">
            <div
              className={`mobile-nav-item ${activeView === 'tasks' ? 'active' : ''}`}
              onClick={() => setActiveView('tasks')}
            >
              <LayoutList size={22} />
              <span>Actividades</span>
            </div>
            <div
              className={`mobile-nav-item ${activeView === 'calendar' ? 'active' : ''}`}
              onClick={() => setActiveView('calendar')}
            >
              <CalendarIcon size={22} />
              <span>Calendario</span>
            </div>
            <div
              className={`mobile-nav-item ${activeView === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveView('stats')}
            >
              <BarChart2 size={22} />
              <span>Stats</span>
            </div>
          </nav>
        </div>
      )}

      <NotificationToast
        message={activeNotification}
        onClose={() => setActiveNotification(null)}
      />

      {focusTask && (
        <div className="focus-overlay">
          <div className="focus-exit-btn" onClick={() => setFocusTask(null)}>
            <LogOut size={32} />
          </div>
          <div className="focus-task-card">
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '3rem', marginBottom: '1rem' }}>
              Enfoque Total
            </h2>
            <p style={{ color: 'var(--ink-50)', marginBottom: '2rem', fontSize: '1.2rem' }}>
              Sin distracciones. Solo tú y tu próxima meta.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', justifyContent: 'center', background: 'var(--surface-2)', padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
              <CheckCircle size={40} color="var(--accent)" />
              <span style={{ fontSize: '2rem', fontWeight: 600 }}>{focusTask.text}</span>
            </div>

            <div style={{ marginTop: '3rem' }}>
              <PomodoroTimer />
            </div>
            <button
              className="btn btn-primary"
              style={{ marginTop: '2rem' }}
              onClick={() => {
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
                audio.play();
                setFocusTask(null);
              }}
            >
              Finalizar Sesión de Enfoque
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
