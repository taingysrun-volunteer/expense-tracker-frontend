import React, { JSX, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../api/AuthService";
import { LoginRequest } from "../models/Auth";


export default function Login(): JSX.Element {
    const navigate = useNavigate();
    const [form, setForm] = useState<LoginRequest>({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validate = (): string | null => {
        if (!form.email) return "Email is required.";
        // simple email check
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(form.email)) return "Enter a valid email.";
        if (!form.password) return "Password is required.";
        if (form.password.length < 6) return "Password must be at least 6 characters.";
        return null;
    };

    const handleChange =
        (key: keyof LoginRequest) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.currentTarget.value;
            setForm((s) => ({ ...s, [key]: value }));
        };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        try {
            // adjust endpoint as needed
            const res = await AuthService.login({ email: form.email, password: form.password });

            if (!res.token) {
                const message = "Login failed";
                throw new Error(message);
            }

            const data = res;
            // expected shape: { token: string, user?: { ... } }
            if (data.token) {
                const storage = sessionStorage;
                storage.setItem("authToken", data.token);
                // optionally store user info
                if (data.user) storage.setItem("user", JSON.stringify(data.user));
                
                // Route based on user role
                const userRole = data.user?.role?.toUpperCase();
                if (userRole === "ADMIN") {
                    navigate("/admin/dashboard");
                } else if (userRole === "USER") {
                    navigate("/user/dashboard");
                } else {
                    // Fallback for unknown roles
                    navigate("/");
                }
            } else {
                throw new Error("No token received from server.");
            }
        } catch (err: any) {
            setError(err?.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.wrapper}>
            <h1 style={styles.appTitle}>Expense Tracker</h1>
            <form onSubmit={handleSubmit} style={styles.form} noValidate>
                <h1 style={styles.title}>Sign in</h1>

                {error && <div style={styles.error}>{error}</div>}

                <label style={styles.label}>
                    Email
                    <input
                        type="email"
                        value={form.email}
                        onChange={handleChange("email")}
                        style={styles.input}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                    />
                </label>

                <label style={styles.label}>
                    Password
                    <input
                        type="password"
                        value={form.password}
                        onChange={handleChange("password")}
                        style={styles.input}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        required
                    />
                </label>

                <button type="submit" style={styles.button} disabled={loading}>
                    {loading ? "Signing in..." : "Sign in"}
                </button>

                <div style={styles.footer}>
                    <span>Don't have an account?</span>
                    <button
                        type="button"
                        onClick={() => navigate("/register")}
                        style={styles.linkButton}
                    >
                        Create one
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
    label: {
        display: "flex",
        flexDirection: "column",
        fontSize: 13,
        gap: 8,
    },
    inline: {
        flexDirection: "row",
        alignItems: "center",
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