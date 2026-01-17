import React, { JSX, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserService from "../api/UserService";
import Toolbar from "../components/Toolbar";
import { commonStyles } from "../styles/commonStyles";
import { User } from "../models/User";

interface EditForm {
    firstName: string;
    lastName: string;
    email: string;
}

export default function UserProfile(): JSX.Element {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<EditForm>({
        firstName: "",
        lastName: "",
        email: "",
    });
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
            setEditForm({
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
            });
        }

        fetchUserProfile();
    }, [navigate]);

    const fetchUserProfile = async () => {
        setLoading(true);
        setError(null);
        try {
            const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
            if (userStr) {
                const userData = JSON.parse(userStr);
                const response = await UserService.getUserById(userData.id);
                setUser(response);
                setEditForm({
                    firstName: response.firstName,
                    lastName: response.lastName,
                    email: response.email,
                });
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || "Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!editForm.firstName.trim()) {
            errors.firstName = "First name is required";
        }
        if (!editForm.lastName.trim()) {
            errors.lastName = "Last name is required";
        }
        if (!editForm.email.trim()) {
            errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
            errors.email = "Invalid email format";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveChanges = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setError(null);
            setSuccessMessage(null);
            if (!user) return;

            const updatedUser = await UserService.updateUser(user.id, {
                firstName: editForm.firstName,
                lastName: editForm.lastName,
                email: editForm.email,
            });

            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
            sessionStorage.setItem("user", JSON.stringify(updatedUser));
            setIsEditing(false);
            setSuccessMessage("Profile updated successfully");
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || "Failed to update profile");
        }
    };

    const handleCancel = () => {
        if (user) {
            setEditForm({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            });
        }
        setIsEditing(false);
        setValidationErrors({});
    };

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("user");
        navigate("/login");
    };

    if (loading) {
        return <div style={styles.loading}>Loading...</div>;
    }

    if (!user) {
        return <div style={styles.loading}>User not found</div>;
    }

    return (
        <div style={styles.container}>
            <Toolbar title="User Profile" backTo="/user/dashboard" onLogout={handleLogout} />

            <div style={styles.content}>
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h1 style={styles.title}>Profile Information</h1>
                        {!isEditing && (
                            <button style={styles.editButton} onClick={() => setIsEditing(true)}>
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {error && (
                        <div style={styles.error}>
                            <span>{error}</span>
                            <button
                                style={styles.closeError}
                                onClick={() => setError(null)}
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {successMessage && (
                        <div style={styles.success}>
                            <span>{successMessage}</span>
                            <button
                                style={styles.closeError}
                                onClick={() => setSuccessMessage(null)}
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {isEditing ? (
                        <div style={styles.formContainer}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>First Name</label>
                                <input
                                    type="text"
                                    style={{
                                        ...styles.input,
                                        borderColor: validationErrors.firstName ? "#ef4444" : "#d1d5db",
                                    }}
                                    value={editForm.firstName}
                                    onChange={(e) =>
                                        setEditForm({
                                            ...editForm,
                                            firstName: e.target.value,
                                        })
                                    }
                                    onFocus={() =>
                                        setValidationErrors({
                                            ...validationErrors,
                                            firstName: "",
                                        })
                                    }
                                />
                                {validationErrors.firstName && (
                                    <span style={styles.errorMessage}>{validationErrors.firstName}</span>
                                )}
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Last Name</label>
                                <input
                                    type="text"
                                    style={{
                                        ...styles.input,
                                        borderColor: validationErrors.lastName ? "#ef4444" : "#d1d5db",
                                    }}
                                    value={editForm.lastName}
                                    onChange={(e) =>
                                        setEditForm({
                                            ...editForm,
                                            lastName: e.target.value,
                                        })
                                    }
                                    onFocus={() =>
                                        setValidationErrors({
                                            ...validationErrors,
                                            lastName: "",
                                        })
                                    }
                                />
                                {validationErrors.lastName && (
                                    <span style={styles.errorMessage}>{validationErrors.lastName}</span>
                                )}
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Email</label>
                                <input
                                    type="email"
                                    style={{
                                        ...styles.input,
                                        borderColor: validationErrors.email ? "#ef4444" : "#d1d5db",
                                    }}
                                    value={editForm.email}
                                    onChange={(e) =>
                                        setEditForm({
                                            ...editForm,
                                            email: e.target.value,
                                        })
                                    }
                                    onFocus={() =>
                                        setValidationErrors({
                                            ...validationErrors,
                                            email: "",
                                        })
                                    }
                                />
                                {validationErrors.email && (
                                    <span style={styles.errorMessage}>{validationErrors.email}</span>
                                )}
                            </div>

                            <div style={styles.formActions}>
                                <button
                                    style={styles.cancelButton}
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </button>
                                <button
                                    style={styles.submitButton}
                                    onClick={handleSaveChanges}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={styles.profileInfo}>
                            <div style={styles.infoRow}>
                                <div style={styles.infoField}>
                                    <label style={styles.infoLabel}>First Name</label>
                                    <p style={styles.infoValue}>{user.firstName}</p>
                                </div>
                                <div style={styles.infoField}>
                                    <label style={styles.infoLabel}>Last Name</label>
                                    <p style={styles.infoValue}>{user.lastName}</p>
                                </div>
                            </div>

                            <div style={styles.infoRow}>
                                <div style={styles.infoField}>
                                    <label style={styles.infoLabel}>Email</label>
                                    <p style={styles.infoValue}>{user.email}</p>
                                </div>
                                <div style={styles.infoField}>
                                    <label style={styles.infoLabel}>Role</label>
                                    <p style={styles.infoValue}>
                                        <span style={styles.roleBadge}>{user.role}</span>
                                    </p>
                                </div>
                            </div>

                            {user.createdAt && (
                                <div style={styles.infoRow}>
                                    <div style={styles.infoField}>
                                        <label style={styles.infoLabel}>Member Since</label>
                                        <p style={styles.infoValue}>
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    ...commonStyles,
    card: {
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(15,23,42,0.08)",
        padding: 32,
    },
    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 600,
        color: "#1f2937",
        margin: 0,
    },
    editButton: {
        padding: "10px 20px",
        borderRadius: 6,
        border: "none",
        background: "#3b82f6",
        color: "#fff",
        cursor: "pointer",
        fontSize: 14,
        fontWeight: 500,
    },
    formContainer: {
        marginTop: 24,
    },
    formGroup: {
        marginBottom: 24,
    },
    label: {
        display: "block",
        marginBottom: 8,
        fontSize: 14,
        fontWeight: 500,
        color: "#374151",
    },
    input: {
        width: "100%",
        padding: "10px 12px",
        borderRadius: 6,
        border: "1px solid #d1d5db",
        fontSize: 14,
        fontFamily: "inherit",
        boxSizing: "border-box",
    },
    errorMessage: {
        display: "block",
        marginTop: 4,
        fontSize: 13,
        color: "#ef4444",
    },
    formActions: {
        display: "flex",
        gap: 12,
        marginTop: 32,
    },
    cancelButton: {
        padding: "10px 20px",
        borderRadius: 6,
        border: "1px solid #d1d5db",
        background: "#fff",
        color: "#374151",
        cursor: "pointer",
        fontSize: 14,
        fontWeight: 500,
    },
    submitButton: {
        padding: "10px 20px",
        borderRadius: 6,
        border: "none",
        background: "#2563eb",
        color: "#fff",
        cursor: "pointer",
        fontSize: 14,
        fontWeight: 500,
    },
    profileInfo: {
        marginTop: 24,
    },
    infoRow: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 32,
        marginBottom: 32,
    },
    infoField: {
        paddingBottom: 16,
        borderBottom: "1px solid #e5e7eb",
    },
    infoLabel: {
        display: "block",
        fontSize: 12,
        fontWeight: 600,
        color: "#6b7280",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        marginBottom: 8,
    },
    infoValue: {
        fontSize: 16,
        color: "#1f2937",
        margin: 0,
    },
    roleBadge: {
        display: "inline-block",
        padding: "4px 12px",
        borderRadius: 4,
        background: "#dbeafe",
        color: "#1e40af",
        fontSize: 13,
        fontWeight: 500,
        textTransform: "capitalize",
    },
    success: {
        background: "#dcfce7",
        color: "#15803d",
        padding: "12px 16px",
        borderRadius: 8,
        marginBottom: 24,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    closeError: {
        background: "transparent",
        border: "none",
        color: "#15803d",
        cursor: "pointer",
        fontSize: 20,
        padding: 0,
        width: 24,
        height: 24,
    },
    loading: {
        textAlign: "center",
        padding: 40,
        fontSize: 16,
        color: "#6b7280",
    },
    container: {
        minHeight: "100vh",
        background: "#f5f7fb",
    },
    content: {
        padding: 32,
        maxWidth: 1400,
        margin: "0 auto",
    },
    error: {
        background: "#fee2e2",
        color: "#b91c1c",
        padding: "12px 16px",
        borderRadius: 8,
        marginBottom: 24,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
};
