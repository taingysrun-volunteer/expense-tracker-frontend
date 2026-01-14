import React, { JSX, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoryService from "../api/CategoryService";
import Toolbar from "../components/Toolbar";
import ConfirmDialog from "../components/ConfirmDialog";
import { commonStyles } from "../styles/commonStyles";
import { Category, CreateCategoryRequest } from "../models/Category";


export default function CategoryManagement(): JSX.Element {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
    const [showEditCategoryDialog, setShowEditCategoryDialog] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [editCategoryForm, setEditCategoryForm] = useState<Partial<Category>>({});
    const [newCategoryForm, setNewCategoryForm] = useState<CreateCategoryRequest>({
        name: "",
        description: "",
        isActive: true,
    });
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [totalElements, setTotalElements] = useState(0);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

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

        fetchCategories();
    }, [navigate]);

    const fetchCategories = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await CategoryService.getAllCategories();
            setCategories(response.content || []);
            setTotalElements(response.totalElements || 0);
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || "Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    const openDeleteDialog = (category: Category) => {
        setCategoryToDelete(category);
        setShowDeleteDialog(true);
    };

    const handleDeleteCategory = async () => {
        if (!categoryToDelete) return;

        try {
            await CategoryService.deleteCategory(categoryToDelete.id);
            setCategories(categories.filter(category => category.id !== categoryToDelete.id));
            setTotalElements(prev => prev - 1);
            setShowDeleteDialog(false);
            setCategoryToDelete(null);
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || "Failed to delete category");
            setShowDeleteDialog(false);
            setCategoryToDelete(null);
        }
    };

    const validateEditCategory = (): boolean => {
        const errors: Record<string, string> = {};

        if (!editCategoryForm.name?.trim()) {
            errors.name = "Category name is required";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleUpdateCategory = async () => {
        if (!selectedCategory) return;

        if (!validateEditCategory()) {
            return;
        }

        try {
            const response = await CategoryService.updateCategory(selectedCategory.id, editCategoryForm);
            setCategories(categories.map(category =>
                category.id === selectedCategory.id ? { ...category, ...response } : category
            ));
            setShowEditCategoryDialog(false);
            setSelectedCategory(null);
            setEditCategoryForm({});
            setValidationErrors({});
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || "Failed to update category");
        }
    };

    const validateAddCategory = (): boolean => {
        const errors: Record<string, string> = {};

        if (!newCategoryForm.name?.trim()) {
            errors.name = "Category name is required";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleAddCategory = async () => {
        if (!validateAddCategory()) {
            return;
        }

        try {
            const response = await CategoryService.createCategory(newCategoryForm);
            setCategories([...categories, response]);
            setShowAddCategoryDialog(false);
            setNewCategoryForm({
                name: "",
                description: "",
                isActive: true,
            });
            setValidationErrors({});
            setTotalElements(prev => prev + 1);
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || "Failed to create category");
        }
    };

    const openEditCategoryDialog = (category: Category) => {
        setSelectedCategory(category);
        setEditCategoryForm({
            name: category.name,
            description: category.description || "",
            isActive: category.isActive,
        });
        setShowEditCategoryDialog(true);
    };

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    return (
        <div style={styles.container}>
            <Toolbar title="Category Management" backTo="/admin/dashboard" showLogout={false} />

            <div style={styles.content}>
                {error && (
                    <div style={styles.error}>
                        {error}
                        <button onClick={() => setError(null)} style={styles.closeError}>×</button>
                    </div>
                )}

                <div style={styles.toolbar}>
                    <button onClick={() => setShowAddCategoryDialog(true)} style={styles.addButton}>
                        + Add Category
                    </button>
                </div>

                {loading ? (
                    <div style={styles.loading}>Loading categories...</div>
                ) : (
                    <>
                        <div style={styles.stats}>
                            <div style={styles.statItem}>
                                <span style={styles.statValue}>{totalElements}</span>
                                <span style={styles.statLabel}>Total Categories</span>
                            </div>
                        </div>

                        <div style={styles.tableWrapper}>
                            <table style={styles.table}>
                                <thead>
                                    <tr style={styles.tableHeaderRow}>
                                        <th style={styles.tableHeader}>Name</th>
                                        <th style={styles.tableHeader}>Description</th>
                                        <th style={styles.tableHeader}>Status</th>
                                        <th style={styles.tableHeader}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCategories.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} style={styles.noData}>
                                                No categories found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredCategories.map((category) => (
                                            <tr key={category.id} style={styles.tableRow}>
                                                <td style={styles.tableCell}>{category.name}</td>
                                                <td style={styles.tableCell}>
                                                    {category.description || "-"}
                                                </td>
                                                <td style={styles.tableCell}>
                                                    <span style={{
                                                        ...styles.statusBadge,
                                                        ...(category.isActive ? styles.statusActive : styles.statusInactive)
                                                    }}>
                                                        {category.isActive ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td style={styles.tableCell}>
                                                    <div style={styles.actionButtons}>
                                                        <button
                                                            onClick={() => openEditCategoryDialog(category)}
                                                            style={styles.editActionButton}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => openDeleteDialog(category)}
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
                    </>
                )}
            </div>

            {/* Edit Category Dialog */}
            {showEditCategoryDialog && selectedCategory && (
                <div style={styles.overlay} onClick={() => setShowEditCategoryDialog(false)}>
                    <div style={styles.dialog} onClick={(e) => e.stopPropagation()}>
                        <h2 style={styles.dialogTitle}>Edit Category</h2>
                        <div style={styles.dialogField}>
                            <label style={styles.dialogLabel}>Name:</label>
                            <input
                                type="text"
                                value={editCategoryForm.name || ""}
                                onChange={(e) => setEditCategoryForm({ ...editCategoryForm, name: e.target.value })}
                                style={{
                                    ...styles.dialogInput,
                                    ...(validationErrors.name ? styles.inputError : {})
                                }}
                                placeholder="Food"
                            />
                            {validationErrors.name && (
                                <span style={styles.errorText}>{validationErrors.name}</span>
                            )}
                        </div>
                        <div style={styles.dialogField}>
                            <label style={styles.dialogLabel}>Description (Optional):</label>
                            <textarea
                                value={editCategoryForm.description || ""}
                                onChange={(e) => setEditCategoryForm({ ...editCategoryForm, description: e.target.value })}
                                style={styles.dialogTextarea}
                                placeholder="Category description..."
                                rows={3}
                            />
                        </div>
                        <div style={styles.dialogField}>
                            <label style={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={editCategoryForm.isActive ?? true}
                                    onChange={(e) => setEditCategoryForm({ ...editCategoryForm, isActive: e.target.checked })}
                                    style={styles.checkbox}
                                />
                                Active
                            </label>
                        </div>
                        <div style={styles.dialogActions}>
                            <button
                                onClick={() => {
                                    setShowEditCategoryDialog(false);
                                    setSelectedCategory(null);
                                    setEditCategoryForm({});
                                    setValidationErrors({});
                                }}
                                style={styles.cancelButton}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateCategory}
                                style={styles.saveButton}
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Category Dialog */}
            {showAddCategoryDialog && (
                <div style={styles.overlay} onClick={() => setShowAddCategoryDialog(false)}>
                    <div style={styles.dialog} onClick={(e) => e.stopPropagation()}>
                        <h2 style={styles.dialogTitle}>Add New Category</h2>
                        <div style={styles.dialogField}>
                            <label style={styles.dialogLabel}>Name:</label>
                            <input
                                type="text"
                                value={newCategoryForm.name}
                                onChange={(e) => setNewCategoryForm({ ...newCategoryForm, name: e.target.value })}
                                style={{
                                    ...styles.dialogInput,
                                    ...(validationErrors.name ? styles.inputError : {})
                                }}
                                placeholder="Food"
                            />
                            {validationErrors.name && (
                                <span style={styles.errorText}>{validationErrors.name}</span>
                            )}
                        </div>
                        <div style={styles.dialogField}>
                            <label style={styles.dialogLabel}>Description (Optional):</label>
                            <textarea
                                value={newCategoryForm.description}
                                onChange={(e) => setNewCategoryForm({ ...newCategoryForm, description: e.target.value })}
                                style={styles.dialogTextarea}
                                placeholder="Category description..."
                                rows={3}
                            />
                        </div>
                        <div style={styles.dialogField}>
                            <label style={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={newCategoryForm.isActive}
                                    onChange={(e) => setNewCategoryForm({ ...newCategoryForm, isActive: e.target.checked })}
                                    style={styles.checkbox}
                                />
                                Active
                            </label>
                        </div>
                        <div style={styles.dialogActions}>
                            <button
                                onClick={() => {
                                    setShowAddCategoryDialog(false);
                                    setNewCategoryForm({
                                        name: "",
                                        description: "",
                                        isActive: true,
                                    });
                                    setValidationErrors({});
                                }}
                                style={styles.cancelButton}
                            >
                                Cancel
                            </button>
                            <button onClick={handleAddCategory} style={styles.saveButton}>
                                Create Category
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showDeleteDialog && categoryToDelete !== null}
                title="Delete Category"
                message={`Are you sure you want to delete the category "${categoryToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDeleteCategory}
                onCancel={() => {
                    setShowDeleteDialog(false);
                    setCategoryToDelete(null);
                }}
                confirmButtonStyle={styles.deleteConfirmButton}
            />
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    ...commonStyles,
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
    closeError: {
        background: "transparent",
        border: "none",
        color: "#b91c1c",
        cursor: "pointer",
        fontSize: 20,
        padding: 0,
        width: 24,
        height: 24,
    },
    toolbar: {
        display: "flex",
        gap: 12,
        marginBottom: 24,
    },
    searchInput: {
        flex: 1,
        padding: "10px 16px",
        borderRadius: 6,
        border: "1px solid #d1d5db",
        fontSize: 14,
    },
    refreshButton: {
        padding: "10px 20px",
        borderRadius: 6,
        border: "none",
        background: "#111827",
        color: "#fff",
        cursor: "pointer",
        fontSize: 14,
        fontWeight: 500,
    },
    addButton: {
        padding: "10px 20px",
        borderRadius: 6,
        border: "none",
        background: "#2563eb",
        color: "#fff",
        cursor: "pointer",
        fontSize: 14,
        fontWeight: 500,
    },
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
    loading: {
        textAlign: "center",
        padding: 40,
        fontSize: 16,
        color: "#6b7280",
    },
    tableWrapper: {
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(15,23,42,0.08)",
        overflow: "hidden",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
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
    statusBadge: {
        padding: "4px 12px",
        borderRadius: 4,
        fontSize: 13,
        fontWeight: 500,
        border: "1px solid",
    },
    statusActive: {
        background: "#d1fae5",
        color: "#065f46",
        borderColor: "#6ee7b7",
    },
    statusInactive: {
        background: "#fee2e2",
        color: "#991b1b",
        borderColor: "#fca5a5",
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
    deleteButton: {
        padding: "6px 12px",
        borderRadius: 4,
        border: "none",
        background: "#fee2e2",
        color: "#b91c1c",
        cursor: "pointer",
        fontSize: 13,
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
    paginationInfo: {
        fontSize: 14,
        color: "#6b7280",
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
    paginationButtons: {
        display: "flex",
        gap: 4,
        alignItems: "center",
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
    ellipsis: {
        padding: "0 8px",
        color: "#9ca3af",
        fontSize: 14,
    },
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
    },
    dialog: {
        background: "#fff",
        borderRadius: 8,
        padding: 32,
        width: 500,
        maxWidth: "90%",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
    },
    dialogTitle: {
        margin: 0,
        marginBottom: 16,
        fontSize: 20,
        color: "#111827",
    },
    dialogField: {
        marginBottom: 16,
    },
    dialogLabel: {
        display: "block",
        marginBottom: 8,
        fontSize: 14,
        fontWeight: 500,
        color: "#374151",
    },
    dialogInput: {
        width: "100%",
        padding: "10px 12px",
        borderRadius: 6,
        border: "1px solid #d1d5db",
        fontSize: 14,
        boxSizing: "border-box",
    },
    dialogTextarea: {
        width: "100%",
        padding: "10px 12px",
        borderRadius: 6,
        border: "1px solid #d1d5db",
        fontSize: 14,
        boxSizing: "border-box",
        fontFamily: "inherit",
        resize: "vertical",
    },
    inputError: {
        borderColor: "#dc2626",
        background: "#fef2f2",
    },
    errorText: {
        display: "block",
        marginTop: 4,
        fontSize: 12,
        color: "#dc2626",
    },
    checkboxLabel: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 14,
        color: "#374151",
        cursor: "pointer",
    },
    checkbox: {
        width: 18,
        height: 18,
        cursor: "pointer",
    },
    dialogActions: {
        display: "flex",
        gap: 12,
        marginTop: 24,
        justifyContent: "flex-end",
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
    deleteConfirmButton: {
        padding: "10px 20px",
        borderRadius: 6,
        border: "none",
        background: "#dc2626",
        color: "#fff",
        cursor: "pointer",
        fontSize: 14,
        fontWeight: 500,
    },
    dialogText: {
        fontSize: 14,
        color: "#374151",
        lineHeight: 1.6,
        margin: "0 0 16px 0",
    },
};
