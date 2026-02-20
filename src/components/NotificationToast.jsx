import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Wind } from 'lucide-react';

const NotificationToast = ({ message, onClose }) => {
    return (
        <AnimatePresence>
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: 50, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, y: 20, x: '-50%' }}
                    style={{
                        position: 'fixed',
                        bottom: '40px',
                        left: '50%',
                        zIndex: 1000,
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        padding: '16px 24px',
                        borderRadius: '20px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        border: '1px solid var(--primary-color)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        minWidth: '300px'
                    }}
                >
                    <div style={{
                        background: 'var(--primary-color)',
                        padding: '10px',
                        borderRadius: '12px',
                        color: '#234e52'
                    }}>
                        <Bell size={24} />
                    </div>

                    <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>Recordatorio Zen</h4>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{message}</p>
                    </div>

                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            padding: '5px'
                        }}
                    >
                        <X size={20} />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NotificationToast;
