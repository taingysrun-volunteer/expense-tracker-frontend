import React, { JSX } from 'react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmButtonStyle?: React.CSSProperties;
}

export default function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    confirmButtonStyle
}: ConfirmDialogProps): JSX.Element | null {
    if (!isOpen) return null;

    return (
        <div style={styles.overlay} onClick={onCancel}>
            <div style={styles.dialog} onClick={(e) => e.stopPropagation()}>
                <h2 style={styles.title}>{title}</h2>
                <p style={styles.message}>{message}</p>
                <div style={styles.actions}>
                    <button onClick={onCancel} style={styles.cancelButton}>
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        style={confirmButtonStyle || styles.confirmButton}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    dialog: {
        background: '#fff',
        borderRadius: 8,
        padding: 24,
        maxWidth: 400,
        width: '90%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    },
    title: {
        margin: 0,
        marginBottom: 12,
        fontSize: 18,
        fontWeight: 600,
        color: '#111827',
    },
    message: {
        margin: 0,
        marginBottom: 24,
        fontSize: 14,
        color: '#6b7280',
        lineHeight: 1.5,
    },
    actions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 12,
    },
    cancelButton: {
        padding: '10px 20px',
        borderRadius: 6,
        border: '1px solid #d1d5db',
        background: '#fff',
        color: '#374151',
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: 500,
    },
    confirmButton: {
        padding: '10px 20px',
        borderRadius: 6,
        border: 'none',
        background: '#ef4444',
        color: '#fff',
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: 500,
    },
};
