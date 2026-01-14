import React, { JSX, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserService from "../api/UserService";
import Toolbar from "../components/Toolbar";
import ConfirmDialog from "../components/ConfirmDialog";
import { commonStyles } from "../styles/commonStyles";

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    createdAt?: string;
}

interface NewUserForm {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
}

export default function UserManagement(): JSX.Element {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState<string>("ALL");
    const [showAddUserDialog, setShowAddUserDialog] = useState(false);
    const [showEditUserDialog, setShowEditUserDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [editUserForm, setEditUserForm] = useState<Partial<User>>({});
    const [newUserForm, setNewUserForm] = useState<NewUserForm>({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "USER",
    });
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
    const [userToResetPassword, setUserToResetPassword] = useState<User | null>(null);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

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

        // Fetch users
        fetchUsers();
    }, [navigate]);

    useEffect(() => {
        // Fetch users when page changes
        fetchUsers();
    }, [currentPage, pageSize]);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await UserService.getAllUsers(currentPage, pageSize);
            setUsers(response.content || []);
            setTotalPages(response.totalPages || 0);
            setTotalElements(response.totalElements || 0);
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || "Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(0); // Reset to first page when page size changes
    };

    const openDeleteDialog = (user: User) => {
        setUserToDelete(user);
        setShowDeleteDialog(true);
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;

        try {
            await UserService.deleteUser(userToDelete.id);
            await fetchUsers();
            setShowDeleteDialog(false);
            setUserToDelete(null);
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || "Failed to delete user");
            setShowDeleteDialog(false);
            setUserToDelete(null);
        }
    };

    const validateEditUser = (): boolean => {
        const errors: Record<string, string> = {};

        if (!editUserForm.firstName?.trim()) {
            errors.firstName = "First name is required";
        }

        if (!editUserForm.lastName?.trim()) {
            errors.lastName = "Last name is required";
        }

        if (!editUserForm.email?.trim()) {
            errors.email = "Email is required";
        } else {
            const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRe.test(editUserForm.email)) {
                errors.email = "Enter a valid email";
            }
        }

        if (!editUserForm.role) {
            errors.role = "Role is required";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleUpdateUser = async () => {
        if (!selectedUser) return;

        if (!validateEditUser()) {
            return;
        }

        try {
            const response = await UserService.updateUser(selectedUser.id, editUserForm);
            setUsers(users.map(user =>
                user.id === selectedUser.id ? { ...user, ...response } : user
            ));
            setShowEditUserDialog(false);
            setSelectedUser(null);
            setEditUserForm({});
            setValidationErrors({});
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || "Failed to update user");
        }
    };

    const validateAddUser = (): boolean => {
        const errors: Record<string, string> = {};

        if (!newUserForm.firstName?.trim()) {
            errors.firstName = "First name is required";
        }

        if (!newUserForm.lastName?.trim()) {
            errors.lastName = "Last name is required";
        }

        if (!newUserForm.email?.trim()) {
            errors.email = "Email is required";
        } else {
            const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRe.test(newUserForm.email)) {
                errors.email = "Enter a valid email";
            }
        }

        if (!newUserForm.password) {
            errors.password = "Password is required";
        } else if (newUserForm.password.length < 6) {
            errors.password = "Password must be at least 6 characters";
        }

        if (!newUserForm.role) {
            errors.role = "Role is required";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleAddUser = async () => {
        if (!validateAddUser()) {
            return;
        }

        try {
            const response = await UserService.createUser(newUserForm);
            setUsers([...users, response]);
            setShowAddUserDialog(false);
            setNewUserForm({
                firstName: "",
                lastName: "",
                email: "",
                password: "",
                role: "USER",
            });
            setValidationErrors({});
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || "Failed to create user");
        }
    };

    const openEditUserDialog = (user: User) => {
        setSelectedUser(user);
        setEditUserForm({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
        });
        setShowEditUserDialog(true);
    };

    const openResetPasswordDialog = (user: User) => {
        setUserToResetPassword(user);
        setNewPassword("");
        setConfirmPassword("");
        setShowResetPasswordDialog(true);
    };

    const validateResetPassword = (): boolean => {
        const errors: Record<string, string> = {};

        if (!newPassword) {
            errors.newPassword = "New password is required";
        } else if (newPassword.length < 6) {
            errors.newPassword = "Password must be at least 6 characters";
        }

        if (!confirmPassword) {
            errors.confirmPassword = "Please confirm the password";
        } else if (newPassword !== confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleResetPassword = async () => {
        if (!userToResetPassword) return;

        if (!validateResetPassword()) {
            return;
        }

        try {
            await UserService.resetPassword(userToResetPassword.id, newPassword);
            setShowResetPasswordDialog(false);
            setUserToResetPassword(null);
            setNewPassword("");
            setConfirmPassword("");
            setValidationErrors({});
            setError(null);
            alert("Password has been reset successfully");
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || "Failed to reset password");
            setShowResetPasswordDialog(false);
            setUserToResetPassword(null);
            setNewPassword("");
            setConfirmPassword("");
            setValidationErrors({});
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = filterRole === "ALL" || user.role === filterRole;

        return matchesSearch && matchesRole;
    });

    return (
        <div style={styles.container}>
            <Toolbar title="User Management" backTo="/admin/dashboard" showLogout={false} />

            <div style={styles.content}>
                {error && (
                    <div style={styles.error}>
                        {error}
                        <button onClick={() => setError(null)} style={styles.closeError}>×</button>
                    </div>
                )}

                <div style={styles.toolbar}>
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.searchInput}
                    />

                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        style={styles.filterSelect}
                    >
                        <option value="ALL">All Roles</option>
                        <option value="ADMIN">Admin</option>
                        <option value="USER">User</option>
                    </select>

                    <button onClick={() => setShowAddUserDialog(true)} style={styles.addButton}>
                        + Add User
                    </button>
                </div>

                {loading ? (
                    <div style={styles.loading}>Loading users...</div>
                ) : (
                    <>
                        <div style={styles.stats}>
                            <div style={styles.statItem}>
                                <span style={styles.statValue}>{users.length}</span>
                                <span style={styles.statLabel}>Total Users</span>
                            </div>
                            <div style={styles.statItem}>
                                <span style={styles.statValue}>
                                    {users.filter(u => u.role === "ADMIN").length}
                                </span>
                                <span style={styles.statLabel}>Admins</span>
                            </div>
                            <div style={styles.statItem}>
                                <span style={styles.statValue}>
                                    {users.filter(u => u.role === "USER").length}
                                </span>
                                <span style={styles.statLabel}>Regular Users</span>
                            </div>
                        </div>

                        <div style={styles.tableWrapper}>
                            <table style={styles.table}>
                                <thead>
                                    <tr style={styles.tableHeaderRow}>
                                        <th style={styles.tableHeader}>Name</th>
                                        <th style={styles.tableHeader}>Email</th>
                                        <th style={styles.tableHeader}>Role</th>
                                        <th style={styles.tableHeader}>Created</th>
                                        <th style={styles.tableHeader}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} style={styles.noData}>
                                                No users found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <tr key={user.id} style={styles.tableRow}>
                                                <td style={styles.tableCell}>
                                                    {user.firstName} {user.lastName}
                                                </td>
                                                <td style={styles.tableCell}>{user.email}</td>
                                                <td style={styles.tableCell}>
                                                    <span style={{
                                                        ...styles.roleBadge,
                                                        ...(user.role === "ADMIN" ? styles.roleAdmin : styles.roleUser)
                                                    }}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td style={styles.tableCell}>
                                                    {user.createdAt || "N/A"}
                                                </td>
                                                <td style={styles.tableCell}>
                                                    <div style={styles.actionButtons}>
                                                        <button
                                                            onClick={() => openEditUserDialog(user)}
                                                            style={styles.editActionButton}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => openResetPasswordDialog(user)}
                                                            style={styles.resetPasswordButton}
                                                        >
                                                            Reset Password
                                                        </button>
                                                        <button
                                                            onClick={() => openDeleteDialog(user)}
                                                            style={styles.deleteButton}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        <div style={styles.paginationContainer}>
                            <div style={styles.paginationInfo}>
                                Showing {users.length > 0 ? (currentPage * pageSize) + 1 : 0} to{" "}
                                {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} users
                            </div>

                            <div style={styles.paginationControls}>
                                <select
                                    value={pageSize}
                                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                    style={styles.pageSizeSelect}
                                >
                                    <option value={5}>5 per page</option>
                                    <option value={10}>10 per page</option>
                                    <option value={20}>20 per page</option>
                                    <option value={50}>50 per page</option>
                                </select>

                                <div style={styles.paginationButtons}>
                                    <button
                                        onClick={() => handlePageChange(0)}
                                        disabled={currentPage === 0}
                                        style={{
                                            ...styles.paginationButton,
                                            ...(currentPage === 0 ? styles.paginationButtonDisabled : {})
                                        }}
                                    >
                                        «
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 0}
                                        style={{
                                            ...styles.paginationButton,
                                            ...(currentPage === 0 ? styles.paginationButtonDisabled : {})
                                        }}
                                    >
                                        ‹
                                    </button>

                                    {Array.from({ length: totalPages }, (_, i) => i)
                                        .filter(page => {
                                            // Show first, last, current, and 2 pages around current
                                            return (
                                                page === 0 ||
                                                page === totalPages - 1 ||
                                                Math.abs(page - currentPage) <= 2
                                            );
                                        })
                                        .map((page, index, array) => {
                                            // Add ellipsis if there's a gap
                                            const showEllipsis = index > 0 && page - array[index - 1] > 1;
                                            return (
                                                <React.Fragment key={page}>
                                                    {showEllipsis && <span style={styles.ellipsis}>...</span>}
                                                    <button
                                                        onClick={() => handlePageChange(page)}
                                                        style={{
                                                            ...styles.paginationButton,
                                                            ...(page === currentPage ? styles.paginationButtonActive : {})
                                                        }}
                                                    >
                                                        {page + 1}
                                                    </button>
                                                </React.Fragment>
                                            );
                                        })
                                    }

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage >= totalPages - 1}
                                        style={{
                                            ...styles.paginationButton,
                                            ...(currentPage >= totalPages - 1 ? styles.paginationButtonDisabled : {})
                                        }}
                                    >
                                        ›
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(totalPages - 1)}
                                        disabled={currentPage >= totalPages - 1}
                                        style={{
                                            ...styles.paginationButton,
                                            ...(currentPage >= totalPages - 1 ? styles.paginationButtonDisabled : {})
                                        }}
                                    >
                                        »
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Edit User Dialog */}
            {showEditUserDialog && selectedUser && (
                <div style={styles.overlay} onClick={() => setShowEditUserDialog(false)}>
                    <div style={styles.dialog} onClick={(e) => e.stopPropagation()}>
                        <h2 style={styles.dialogTitle}>Edit User</h2>
                        <div style={styles.dialogField}>
                            <label style={styles.dialogLabel}>First Name:</label>
                            <input
                                type="text"
                                value={editUserForm.firstName || ""}
                                onChange={(e) => setEditUserForm({ ...editUserForm, firstName: e.target.value })}
                                style={{
                                    ...styles.dialogInput,
                                    ...(validationErrors.firstName ? styles.inputError : {})
                                }}
                                placeholder="John"
                            />
                            {validationErrors.firstName && (
                                <span style={styles.errorText}>{validationErrors.firstName}</span>
                            )}
                        </div>
                        <div style={styles.dialogField}>
                            <label style={styles.dialogLabel}>Last Name:</label>
                            <input
                                type="text"
                                value={editUserForm.lastName || ""}
                                onChange={(e) => setEditUserForm({ ...editUserForm, lastName: e.target.value })}
                                style={{
                                    ...styles.dialogInput,
                                    ...(validationErrors.lastName ? styles.inputError : {})
                                }}
                                placeholder="Doe"
                            />
                            {validationErrors.lastName && (
                                <span style={styles.errorText}>{validationErrors.lastName}</span>
                            )}
                        </div>
                        <div style={styles.dialogField}>
                            <label style={styles.dialogLabel}>Email:</label>
                            <input
                                type="email"
                                value={editUserForm.email || ""}
                                onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                                style={{
                                    ...styles.dialogInput,
                                    ...(validationErrors.email ? styles.inputError : {})
                                }}
                                placeholder="john.doe@example.com"
                            />
                            {validationErrors.email && (
                                <span style={styles.errorText}>{validationErrors.email}</span>
                            )}
                        </div>
                        <div style={styles.dialogField}>
                            <label style={styles.dialogLabel}>Role:</label>
                            <select
                                value={editUserForm.role || "USER"}
                                onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value })}
                                style={{
                                    ...styles.dialogSelect,
                                    ...(validationErrors.role ? styles.inputError : {})
                                }}
                            >
                                <option value="USER">User</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                            {validationErrors.role && (
                                <span style={styles.errorText}>{validationErrors.role}</span>
                            )}
                        </div>
                        <div style={styles.dialogActions}>
                            <button
                                onClick={() => {
                                    setShowEditUserDialog(false);
                                    setSelectedUser(null);
                                    setEditUserForm({});
                                    setValidationErrors({});
                                }}
                                style={styles.cancelButton}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateUser}
                                style={styles.saveButton}
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add User Dialog */}
            {showAddUserDialog && (
                <div style={styles.overlay} onClick={() => setShowAddUserDialog(false)}>
                    <div style={styles.dialog} onClick={(e) => e.stopPropagation()}>
                        <h2 style={styles.dialogTitle}>Add New User</h2>
                        <div style={styles.dialogField}>
                            <label style={styles.dialogLabel}>First Name:</label>
                            <input
                                type="text"
                                value={newUserForm.firstName}
                                onChange={(e) => setNewUserForm({ ...newUserForm, firstName: e.target.value })}
                                style={{
                                    ...styles.dialogInput,
                                    ...(validationErrors.firstName ? styles.inputError : {})
                                }}
                                placeholder="John"
                            />
                            {validationErrors.firstName && (
                                <span style={styles.errorText}>{validationErrors.firstName}</span>
                            )}
                        </div>
                        <div style={styles.dialogField}>
                            <label style={styles.dialogLabel}>Last Name:</label>
                            <input
                                type="text"
                                value={newUserForm.lastName}
                                onChange={(e) => setNewUserForm({ ...newUserForm, lastName: e.target.value })}
                                style={{
                                    ...styles.dialogInput,
                                    ...(validationErrors.lastName ? styles.inputError : {})
                                }}
                                placeholder="Doe"
                            />
                            {validationErrors.lastName && (
                                <span style={styles.errorText}>{validationErrors.lastName}</span>
                            )}
                        </div>
                        <div style={styles.dialogField}>
                            <label style={styles.dialogLabel}>Email:</label>
                            <input
                                type="email"
                                value={newUserForm.email}
                                onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                                style={{
                                    ...styles.dialogInput,
                                    ...(validationErrors.email ? styles.inputError : {})
                                }}
                                placeholder="john.doe@example.com"
                            />
                            {validationErrors.email && (
                                <span style={styles.errorText}>{validationErrors.email}</span>
                            )}
                        </div>
                        <div style={styles.dialogField}>
                            <label style={styles.dialogLabel}>Password:</label>
                            <input
                                type="password"
                                value={newUserForm.password}
                                onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                                style={{
                                    ...styles.dialogInput,
                                    ...(validationErrors.password ? styles.inputError : {})
                                }}
                                placeholder="••••••••"
                            />
                            {validationErrors.password && (
                                <span style={styles.errorText}>{validationErrors.password}</span>
                            )}
                        </div>
                        <div style={styles.dialogField}>
                            <label style={styles.dialogLabel}>Role:</label>
                            <select
                                value={newUserForm.role}
                                onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                                style={{
                                    ...styles.dialogSelect,
                                    ...(validationErrors.role ? styles.inputError : {})
                                }}
                            >
                                <option value="USER">User</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                            {validationErrors.role && (
                                <span style={styles.errorText}>{validationErrors.role}</span>
                            )}
                        </div>
                        <div style={styles.dialogActions}>
                            <button
                                onClick={() => {
                                    setShowAddUserDialog(false);
                                    setNewUserForm({
                                        firstName: "",
                                        lastName: "",
                                        email: "",
                                        password: "",
                                        role: "USER",
                                    });
                                    setValidationErrors({});
                                }}
                                style={styles.cancelButton}
                            >
                                Cancel
                            </button>
                            <button onClick={handleAddUser} style={styles.saveButton}>
                                Create User
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reset Password Dialog */}
            {showResetPasswordDialog && userToResetPassword && (
                <div style={styles.overlay} onClick={() => setShowResetPasswordDialog(false)}>
                    <div style={styles.dialog} onClick={(e) => e.stopPropagation()}>
                        <h2 style={styles.dialogTitle}>Reset Password</h2>
                        <p style={styles.resetPasswordInfo}>
                            Resetting password for: <strong>{userToResetPassword.firstName} {userToResetPassword.lastName}</strong>
                        </p>
                        <div style={styles.dialogField}>
                            <label style={styles.dialogLabel}>New Password:</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                style={{
                                    ...styles.dialogInput,
                                    ...(validationErrors.newPassword ? styles.inputError : {})
                                }}
                                placeholder="Enter new password"
                            />
                            {validationErrors.newPassword && (
                                <span style={styles.errorText}>{validationErrors.newPassword}</span>
                            )}
                        </div>
                        <div style={{...styles.dialogField, marginTop: 16}}>
                            <label style={styles.dialogLabel}>Confirm Password:</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                style={{
                                    ...styles.dialogInput,
                                    ...(validationErrors.confirmPassword ? styles.inputError : {})
                                }}
                                placeholder="Confirm new password"
                            />
                            {validationErrors.confirmPassword && (
                                <span style={styles.errorText}>{validationErrors.confirmPassword}</span>
                            )}
                        </div>
                        <div style={styles.dialogActions}>
                            <button
                                onClick={() => {
                                    setShowResetPasswordDialog(false);
                                    setUserToResetPassword(null);
                                    setNewPassword("");
                                    setConfirmPassword("");
                                    setValidationErrors({});
                                }}
                                style={styles.cancelButton}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleResetPassword}
                                style={styles.saveButton}
                            >
                                Reset Password
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showDeleteDialog && userToDelete !== null}
                title="Delete User"
                message={`Are you sure you want to delete user "${userToDelete?.firstName} ${userToDelete?.lastName}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDeleteUser}
                onCancel={() => {
                    setShowDeleteDialog(false);
                    setUserToDelete(null);
                }}
                confirmButtonStyle={styles.deleteConfirmButton}
            />
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    ...commonStyles,
    stats: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 24,
        marginBottom: 24,
    },
    statItem: {
        background: "#fff",
        padding: 20,
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(15,23,42,0.08)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    statValue: {
        fontSize: 32,
        fontWeight: 700,
        color: "#111827",
    },
    statLabel: {
        fontSize: 14,
        color: "#6b7280",
        marginTop: 4,
    },
    tableHeaderRow: {
        background: "#f9fafb",
    },
    tableHeader: {
        padding: "12px 16px",
        textAlign: "left",
        fontSize: 13,
        fontWeight: 600,
        color: "#374151",
        borderBottom: "2px solid #e5e7eb",
    },
    tableRow: {
        borderBottom: "1px solid #e5e7eb",
    },
    tableCell: {
        padding: "16px",
        fontSize: 14,
        color: "#111827",
    },
    noData: {
        padding: 40,
        textAlign: "center",
        color: "#6b7280",
    },
    roleBadge: {
        padding: "4px 12px",
        borderRadius: 4,
        fontSize: 13,
        fontWeight: 500,
        border: "1px solid",
    },
    roleAdmin: {
        background: "#fef3c7",
        color: "#92400e",
        borderColor: "#fcd34d",
    },
    roleUser: {
        background: "#dbeafe",
        color: "#1e40af",
        borderColor: "#93c5fd",
    },
    actionButtons: {
        display: "flex",
        gap: 8,
    },
    editActionButton: {
        padding: "6px 12px",
        borderRadius: 4,
        border: "none",
        background: "#dbeafe",
        color: "#1e40af",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 500,
    },
    inputError: {
        borderColor: "#dc2626",
        background: "#fef2f2",
    },
    saveButton: {
        padding: "10px 20px",
        borderRadius: 6,
        border: "none",
        background: "#2563eb",
        color: "#fff",
        cursor: "pointer",
        fontSize: 14,
        fontWeight: 500,
    },
    paginationContainer: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 20px",
        background: "#fff",
        borderTop: "1px solid #e5e7eb",
        borderRadius: "0 0 8px 8px",
    },
    paginationControls: {
        display: "flex",
        alignItems: "center",
        gap: 16,
    },
    pageSizeSelect: {
        padding: "6px 10px",
        borderRadius: 4,
        border: "1px solid #d1d5db",
        fontSize: 13,
        background: "#fff",
        cursor: "pointer",
    },
    paginationButton: {
        padding: "6px 12px",
        borderRadius: 4,
        border: "1px solid #d1d5db",
        background: "#fff",
        color: "#374151",
        cursor: "pointer",
        fontSize: 14,
        minWidth: 36,
        textAlign: "center",
    },
    paginationButtonActive: {
        background: "#2563eb",
        color: "#fff",
        borderColor: "#2563eb",
    },
    paginationButtonDisabled: {
        cursor: "not-allowed",
        opacity: 0.5,
        background: "#f9fafb",
    },
    resetPasswordButton: {
        padding: "6px 12px",
        borderRadius: 4,
        border: "none",
        background: "#fef3c7",
        color: "#92400e",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 500,
    },
    resetPasswordInfo: {
        marginBottom: 16,
        padding: 12,
        background: "#f0f9ff",
        borderRadius: 6,
        color: "#1e40af",
        fontSize: 14,
    },
};
