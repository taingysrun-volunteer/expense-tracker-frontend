import React, { JSX, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../api/AuthService";

type RegisterForm = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
};

export default function Register(): JSX.Element {
    const navigate = useNavigate();
    const [form, setForm] = useState<RegisterForm>({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validate = (): string | null => {
        if (!form.firstName?.trim()) return "First name is required.";
        if (!form.lastName?.trim()) return "Last name is required.";
        if (!form.email) return "Email is required.";

        // Email validation
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(form.email)) return "Enter a valid email.";

        if (!form.password) return "Password is required.";
        if (form.password.length < 6) return "Password must be at least 6 characters.";

        if (!form.confirmPassword) return "Please confirm your password.";
        if (form.password !== form.confirmPassword) return "Passwords do not match.";

        return null;
    };

    const handleChange =
        (key: keyof RegisterForm) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
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
            await AuthService.register({
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                password: form.password,
            });

            // Registration successful - redirect to verification page
            navigate("/register/verify", { state: { email: form.email } });
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.wrapper}>
            <h1 style={styles.appTitle}>Expense Tracker</h1>

            <form onSubmit={handleSubmit} style={styles.form} noValidate>
                <h1 style={styles.title}>Create Account</h1>

                {error && <div style={styles.error}>{error}</div>}

                <div style={styles.row}>
                    <label style={{ ...styles.label, flex: 1 }}>
                        First Name
                        <input
                            type="text"
                            value={form.firstName}
                            onChange={handleChange("firstName")}
                            style={styles.input}
                            placeholder="John"
                            autoComplete="given-name"
                            required
                        />
                    </label>

                    <label style={{ ...styles.label, flex: 1 }}>
                        Last Name
                        <input
                            type="text"
                            value={form.lastName}
                            onChange={handleChange("lastName")}
                            style={styles.input}
                            placeholder="Doe"
                            autoComplete="family-name"
                            required
                        />
                    </label>
                </div>

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
                        autoComplete="new-password"
                        required
                    />
                </label>

                <label style={styles.label}>
                    Confirm Password
                    <input
                        type="password"
                        value={form.confirmPassword}
                        onChange={handleChange("confirmPassword")}
                        style={styles.input}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        required
                    />
                </label>

                <button type="submit" style={styles.button} disabled={loading}>
                    {loading ? "Creating Account..." : "Create Account"}
                </button>

                <div style={styles.footer}>
                    <span>Already have an account?</span>
                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        style={styles.linkButton}
                    >
                        Sign in
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
        width: 420,
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
    row: {
        display: "flex",
        gap: 12,
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
        marginTop: 6,
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
