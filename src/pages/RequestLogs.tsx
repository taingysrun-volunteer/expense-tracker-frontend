import React, { JSX, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ExpenseService from "../api/ExpenseService";
import CategoryService from "../api/CategoryService";
import Toolbar from "../components/Toolbar";
import ConfirmDialog from "../components/ConfirmDialog";
import { commonStyles } from "../styles/commonStyles";
import RequestLogService from "../api/RequestLogService";

interface RequestLog {
    id: string;
    method: string;
    userName: string;
    endpoint: string;
    details: string | null;
    ipAddress: string;
    success: boolean;
    errorMessage: string | null;
    createdAt: string
}

export default function RequestLogs(): JSX.Element {
    const navigate = useNavigate();
    const [logs, setLogs] = useState<RequestLog[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

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
        }

        // Fetch request logs
        fetchRequestLogs();
    }, [navigate]);

    const fetchRequestLogs = async () => {
        try {
            setLoading(true);
            const data = await RequestLogService.getRequestLogs();
            setLogs(data.content || []);
        } catch (err) {
            setError("Failed to fetch request logs.");
        } finally {
            setLoading(false);
        }
    };
    
    const styles = {        
        ...commonStyles,
        container: {
            display: "flex",
            flexDirection: "column" as const,
            height: "100vh",
        },
        content: {
            flex: 1,
            padding: 20,
            overflowY: "auto" as const,
        },
        table: {
            width: "100%",
            borderCollapse: "collapse" as const,
            marginTop: 20,
        },
        th: {
            border: "1px solid #ddd",
            padding: 8,
            backgroundColor: "#f2f2f2",
            textAlign: "left" as const,
        },
        td: {
            border: "1px solid #ddd",
            padding: 8,
        },
        input: {
            padding: 8,
            width: "100%",
            maxWidth: 400,
            marginBottom: 20,
            border: "1px solid #ccc",
            borderRadius: 4,
        },
    };

    return (
        <div style={styles.container}>
             <Toolbar title="Request Logs" backTo="/admin/dashboard" showLogout={false} />

            <div style={styles.content}>

                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p style={{ color: "red" }}>{error}</p>
                ) : (
                    logs.length === 0 ? (
                        <p>No request logs found.</p>
                    ) : null
                )}

                {!loading && !error && (

                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>ID</th>
                                <th style={styles.th}>Method</th>
                                <th style={styles.th}>Endpoint</th>
                                <th style={styles.th}>User Name</th>
                                <th style={styles.th}>Request Body</th>
                                <th style={styles.th}>IP Address</th>
                                <th style={styles.th}>Success</th>
                                <th style={styles.th}>Error Message</th>
                                <th style={styles.th}>Created At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log.id}>
                                    <td style={styles.td}>{log.id}</td>
                                    <td style={styles.td}>{log.method}</td>
                                    <td style={styles.td}>{log.endpoint}</td>
                                    <td style={styles.td}>{log.userName}</td>
                                    <td style={styles.td}>{log.details || "-"}</td>
                                    <td style={styles.td}>{log.ipAddress}</td>
                                    <td style={styles.td}>{log.success ? "Yes" : "No"}</td>
                                    <td style={styles.td}>{log.errorMessage || "-"}</td>
                                    <td style={styles.td}>{new Date(log.createdAt).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}       