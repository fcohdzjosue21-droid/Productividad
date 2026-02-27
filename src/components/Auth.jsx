import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { BookOpen, Mail, Lock, ArrowRight, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import '../styles/ZenStyles.css';

export default function Auth({ onAuthSuccess = () => { } }) {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);
        setSuccessMsg(null);

        try {
            if (isLogin) {
                const { error, data } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                onAuthSuccess(data.user);
            } else {
                const { error, data } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                if (data?.session) {
                    onAuthSuccess(data.user);
                } else {
                    setSuccessMsg('Revisa tu correo para verificar tu cuenta.');
                }
            }
        } catch (error) {
            console.error('Auth error:', error.message);
            setErrorMsg(error.message === 'Invalid login credentials' ? 'Credenciales inválidas.' : error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100%' }}>
            {/* Subtle background geometry */}
            <div className="bg-blobs">
                <div className="blob blob-1" />
                <div className="blob blob-2" />
                <div className="blob blob-3" />
            </div>

            <motion.div
                className="auth-card"
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
            >
                {/* Logo mark */}
                <div className="auth-logo-mark">
                    <BookOpen size={26} color="#fff" />
                </div>

                <h1 className="auth-title">ZenFlow</h1>
                <p className="auth-subtitle">
                    {isLogin
                        ? 'Tu agenda personal, siempre contigo.'
                        : 'Organiza tu mente. Fluye con claridad.'}
                </p>

                {/* Error */}
                {errorMsg && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            width: '100%', padding: '12px 16px',
                            background: '#fff1f0', color: '#c0392b',
                            borderRadius: '10px', marginBottom: '1rem',
                            fontSize: '0.875rem', textAlign: 'center',
                            border: '1px solid #ffd5d2'
                        }}
                    >
                        {errorMsg}
                    </motion.div>
                )}

                {/* Success */}
                {successMsg && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            width: '100%', padding: '12px 16px',
                            background: '#f0fff4', color: '#27ae60',
                            borderRadius: '10px', marginBottom: '1rem',
                            fontSize: '0.875rem', textAlign: 'center',
                            border: '1px solid #c3f0cc'
                        }}
                    >
                        {successMsg}
                    </motion.div>
                )}

                <form onSubmit={handleAuth} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Email */}
                    <div style={{ position: 'relative' }}>
                        <Mail size={16} style={{
                            position: 'absolute', top: '50%', left: '14px',
                            transform: 'translateY(-50%)', color: 'var(--ink-30)', pointerEvents: 'none'
                        }} />
                        <input
                            type="email"
                            placeholder="correo@ejemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="task-input"
                            style={{ margin: 0, paddingLeft: '42px' }}
                        />
                    </div>

                    {/* Password */}
                    <div style={{ position: 'relative' }}>
                        <Lock size={16} style={{
                            position: 'absolute', top: '50%', left: '14px',
                            transform: 'translateY(-50%)', color: 'var(--ink-30)', pointerEvents: 'none'
                        }} />
                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="task-input"
                            style={{ margin: 0, paddingLeft: '42px' }}
                        />
                    </div>

                    <motion.button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ width: '100%', justifyContent: 'center', marginTop: '8px', padding: '13px' }}
                        whileTap={{ scale: 0.97 }}
                    >
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="spinning" style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%' }} />
                                Cargando...
                            </span>
                        ) : isLogin ? (
                            <><ArrowRight size={18} /> Iniciar Sesión</>
                        ) : (
                            <><UserPlus size={18} /> Crear Cuenta</>
                        )}
                    </motion.button>
                </form>

                <button
                    onClick={() => { setIsLogin(!isLogin); setErrorMsg(null); setSuccessMsg(null); }}
                    style={{
                        marginTop: '1.5rem', background: 'none', border: 'none',
                        color: 'var(--ink-50)', cursor: 'pointer',
                        fontSize: '0.85rem', fontFamily: 'Inter, sans-serif',
                        textDecoration: 'underline', textDecorationColor: 'var(--border)',
                        transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--ink)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--ink-50)'}
                >
                    {isLogin ? '¿Sin cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
                </button>
            </motion.div>
        </div>
    );
}
