import React, { JSX, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Toolbar from "../components/Toolbar";
import { User } from "../models/User";


export default function AdminDashboard(): JSX.Element {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Check if user is authenticated and has admin role
        const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
        const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");

        if (!token) {
            navigate("/login");
            return;
        }

        if (userStr) {
            const userData = JSON.parse(userStr);
            if (userData.role?.toUpperCase() !== "ADMIN") {
                navigate("/user/dashboard");
                return;
            }
            setUser(userData);
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("user");
        navigate("/login");
    };

    if (!user) {
        return <div style={styles.loading}>Loading...</div>;
    }

    return (
        <div style={styles.container}>
            <Toolbar title="Admin Dashboard" onLogout={handleLogout} />

            <div style={styles.content}>
                <div style={styles.welcomeCard}>
                    <h2 style={styles.welcomeTitle}>
                        Welcome, {user.firstName} {user.lastName}
                    </h2>
                    <p style={styles.welcomeText}>Email: {user.email}</p>
                    <p style={styles.welcomeText}>Role: {user.role}</p>
                </div>

                <div style={styles.grid}>
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>User Management</h3>
                        <p style={styles.cardText}>Manage all users in the system</p>
                        <button
                            style={styles.cardButton}
                            onClick={() => navigate("/admin/users")}
                        >
                            View Users
                        </button>
                    </div>

                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Category Management</h3>
                        <p style={styles.cardText}>Manage expense categories</p>
                        <button
                            style={styles.cardButton}
                            onClick={() => navigate("/admin/categories")}
                        >
                            View Categories
                        </button>
                    </div>

                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Expense Reports</h3>
                        <p style={styles.cardText}>View expense analytics and insights</p>
                        <button
                            style={styles.cardButton}
                            onClick={() => navigate("/admin/reports")}
                        >
                            View Reports
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        minHeight: "100vh",
        background: "#f5f7fb",
    },
    content: {
        padding: 32,
        maxWidth: 1200,
        margin: "0 auto",
    },
    welcomeCard: {
        background: "#fff",
        padding: 24,
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(15,23,42,0.08)",
        marginBottom: 32,
    },
    welcomeTitle: {
        margin: 0,
        marginBottom: 12,
        fontSize: 20,
        color: "#111827",
    },
    welcomeText: {
        margin: "4px 0",
        fontSize: 14,
        color: "#6b7280",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: 24,
    },
    card: {
        background: "#fff",
        padding: 24,
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(15,23,42,0.08)",
        display: "flex",
        flexDirection: "column",
    },
    cardTitle: {
        margin: 0,
        marginBottom: 8,
        fontSize: 18,
        color: "#111827",
    },
    cardText: {
        margin: 0,
        marginBottom: 16,
        fontSize: 14,
        color: "#6b7280",
        flexGrow: 1,
    },
    cardButton: {
        padding: "10px 16px",
        borderRadius: 6,
        border: "none",
        background: "#111827",
        color: "#fff",
        cursor: "pointer",
        fontSize: 14,
        fontWeight: 500,
    },
    loading: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18,
        color: "#6b7280",
    },
};
