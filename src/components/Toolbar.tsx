import React, { JSX, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface ToolbarProps {
    title: string;
    onLogout?: () => void;
    showLogout?: boolean;
    backTo?: string;
    actions?: ReactNode;
}

export default function Toolbar({ title, onLogout, showLogout = true, backTo, actions }: ToolbarProps): JSX.Element {
    const navigate = useNavigate();

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        } else {
            // Default logout behavior
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('user');
            navigate('/login');
        }
    };

    return (
        <header style={styles.header}>
            {backTo ? (
                <div style={styles.headerLeft}>
                    <button onClick={() => navigate(backTo)} style={styles.backButton}>
                        ← Back to Dashboard
                    </button>
                    <h1 style={styles.title}>{title}</h1>
                </div>
            ) : (
                <h1 style={styles.title}>{title}</h1>
            )}
            <div style={styles.headerRight}>
                {actions}
                {showLogout && (
                    <button onClick={handleLogout} style={styles.logoutButton}>
                        Logout
                    </button>
                )}
            </div>
        </header>
    );
}

const styles: Record<string, React.CSSProperties> = {
    header: {
        background: '#fff',
        padding: '20px 32px',
        boxShadow: '0 2px 8px rgba(15,23,42,0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: 16,
    },
    headerRight: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
    },
    title: {
        margin: 0,
        fontSize: 24,
        color: '#111827',
    },
    backButton: {
        padding: '8px 16px',
        borderRadius: 6,
        border: '1px solid #d1d5db',
        background: '#fff',
        color: '#374151',
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: 500,
    },
    logoutButton: {
        padding: '10px 20px',
        borderRadius: 6,
        border: '1px solid #d1d5db',
        background: '#fff',
        color: '#374151',
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: 500,
    },
};
