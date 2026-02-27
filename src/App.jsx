import React, { useState, useEffect } from 'react';
import TaskContainer from './components/TaskContainer';
import CalendarView from './components/CalendarView';
import Auth from './components/Auth';
import NotificationToast from './components/NotificationToast';
import { supabase } from './lib/supabaseClient';
import './styles/ZenStyles.css';
import { BookOpen, LayoutList, Calendar as CalendarIcon, CloudSync, CloudOff, LogOut, Bell, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced', 'syncing', 'error'
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeView, setActiveView] = useState('tasks'); // 'tasks' or 'calendar'
  const [activeNotification, setActiveNotification] = useState(null);
  const [user, setUser] = useState(null);

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
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
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
              <p className="sidebar-quote">"Cada momento es una oportunidad para la paz."</p>
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
                ) : (
                  <CalendarView tasks={tasks} selectedDate={selectedDate} setSelectedDate={setSelectedDate} large={true} />
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
          </nav>
        </div>
      )}

      <NotificationToast
        message={activeNotification}
        onClose={() => setActiveNotification(null)}
      />
    </>
  );
}

export default App;
