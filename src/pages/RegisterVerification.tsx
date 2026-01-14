import React, { JSX, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthService from '../api/AuthService';

export default function RegisterVerification(): JSX.Element {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await AuthService.verifyOtp(email, otp);

            if (!response.token) {
                throw new Error('Invalid OTP');
            }

            const data = response;
            if (data.token) {
                const storage = sessionStorage;
                storage.setItem('authToken', data.token);
                if (data.user) storage.setItem('user', JSON.stringify(data.user));
                
                // Route based on user role
                const userRole = data.user?.role?.toUpperCase();
                if (userRole === 'ADMIN') {
                    navigate('/admin/dashboard');
                } else if (userRole === 'USER') {
                    navigate('/user/dashboard');
                } else {
                    // Fallback for unknown roles
                    navigate('/');
                }
            } else {
                throw new Error('No token received from server.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setResendLoading(true);
        setError('');
        setResendSuccess('');

        try {
            await AuthService.resendOtp(email);
            setResendSuccess('OTP resent successfully');
            setOtp('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to resend OTP');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div style={styles.wrapper}>
            <h1 style={styles.appTitle}>Expense Tracker</h1>
            <form onSubmit={handleVerify} style={styles.form} noValidate>
                <h1 style={styles.title}>Verify Email</h1>
                <p style={styles.subtitle}>
                    OTP sent to <span style={styles.emailHighlight}>{email}</span>
                </p>

                {error && <div style={styles.error}>{error}</div>}

                {resendSuccess && <div style={styles.success}>{resendSuccess}</div>}

                <label style={styles.label}>
                    OTP
                    <input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        style={styles.input}
                        disabled={loading}
                        required
                    />
                </label>

                <button type="submit" style={styles.button} disabled={loading}>
                    {loading ? "Verifying..." : "Verify"}
                </button>

                <div style={styles.footer}>
                    <span>Didn't receive OTP?</span>
                    <button
                        type="button"
                        onClick={handleResendOtp}
                        style={styles.linkButton}
                        disabled={resendLoading}
                    >
                        {resendLoading ? 'Resending...' : 'Resend'}
                    </button>
                </div>
            </form>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    wrapper: {
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f7fb",
    },
    appTitle: {
        margin: 0,
        marginBottom: 50,
        fontSize: 36,
        color: "#111827",
    },
    form: {
        width: 360,
        padding: 24,
        borderRadius: 8,
        boxShadow: "0 6px 18px rgba(15,23,42,0.08)",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        gap: 12,
    },
    title: {
        margin: 0,
        marginBottom: 4,
        fontSize: 20,
        textAlign: "center",
    },
    subtitle: {
        margin: 0,
        marginBottom: 12,
        fontSize: 13,
        textAlign: "center",
        color: "#6b7280",
    },
    emailHighlight: {
        fontWeight: "600",
        color: "#111827",
    },
    label: {
        display: "flex",
        flexDirection: "column",
        fontSize: 13,
        gap: 8,
    },
    input: {
        height: 40,
        padding: "8px 10px",
        borderRadius: 6,
        border: "1px solid #d1d5db",
        fontSize: 14,
    },
    button: {
        height: 44,
        borderRadius: 6,
        border: "none",
        background: "#111827",
        color: "#fff",
        cursor: "pointer",
        fontSize: 15,
        marginTop: 12,
    },
    error: {
        background: "#fee2e2",
        color: "#b91c1c",
        padding: "8px 10px",
        borderRadius: 6,
        fontSize: 13,
    },
    success: {
        background: "#dcfce7",
        color: "#166534",
        padding: "8px 10px",
        borderRadius: 6,
        fontSize: 13,
    },
    footer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        marginTop: 6,
        fontSize: 13,
        color: "#374151",
    },
    linkButton: {
        background: "transparent",
        border: "none",
        color: "#2563eb",
        cursor: "pointer",
        padding: 0,
        fontSize: 13,
        textDecoration: "underline",
    },
};