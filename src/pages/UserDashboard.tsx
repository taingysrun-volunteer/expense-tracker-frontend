import React, { JSX, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Toolbar from "../components/Toolbar";
import UserExpenseReport from "./UserExpenseReport";

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
}

export default function UserDashboard(): JSX.Element {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
        const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");

        if (!token) {
            navigate("/login");
            return;
        }

        if (userStr) {
            const userData = JSON.parse(userStr);
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
            <Toolbar title="Expense Tracker" onLogout={handleLogout} />

            <div style={styles.content}>
                 <h1 style={styles.welcomeTitle}>
                    Welcome back, {user.firstName} {user.lastName}
                </h1>

                <UserExpenseReport />

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
    welcomeTitle: {
        margin: 0,
        marginBottom: 24,
        fontSize: 24,
        color: "#111827",
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
