import React, { JSX, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ExpenseService from "../api/ExpenseService";
import CategoryService from "../api/CategoryService";
import Toolbar from "../components/Toolbar";
import ConfirmDialog from "../components/ConfirmDialog";
import { commonStyles } from "../styles/commonStyles";

interface Expense {
    id: string;
    title: string;
    amount: number;
    description: string;
    expenseDate: string;
    categoryId: string;
    categoryName?: string;
    userId: string;
}

interface Category {
    id: string;
    name: string;
}

interface NewExpenseForm {
    title: string;
    amount: string;
    description: string;
    expenseDate: string;
    categoryId: string;
}

export default function UserExpenseManagement(): JSX.Element {
    const navigate = useNavigate();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddExpenseDialog, setShowAddExpenseDialog] = useState(false);
    const [showEditExpenseDialog, setShowEditExpenseDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
    const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
    const [editExpenseForm, setEditExpenseForm] = useState<Partial<Expense>>({});
    const [newExpenseForm, setNewExpenseForm] = useState<NewExpenseForm>({
        title: "",
        amount: "",
        description: "",
        expenseDate: new Date().toISOString().split('T')[0],
        categoryId: "",
    });
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

        if (!token) {
            navigate("/login");
            return;
        }

        fetchExpenses();
        fetchCategories();
    }, [navigate, currentPage, pageSize]);

    const fetchExpenses = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await ExpenseService.getAllExpenses(currentPage, pageSize);
            setExpenses(response.content || []);
            setTotalPages(response.totalPages || 0);
            setTotalElements(response.totalElements || 0);
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || "Failed to load expenses");
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await CategoryService.getAllCategories();
            setCategories(response.content || []);
        } catch (err: any) {
            console.error("Failed to load categories:", err);
        }
    };

    const openDeleteDialog = (expense: Expense) => {
        setExpenseToDelete(expense);
        setShowDeleteDialog(true);
    };

    const handleDeleteExpense = async () => {
        if (!expenseToDelete) return;

        try {
            await ExpenseService.deleteExpense(expenseToDelete.id);
            await fetchExpenses();
            setShowDeleteDialog(false);
            setExpenseToDelete(null);
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || "Failed to delete expense");
            setShowDeleteDialog(false);
            setExpenseToDelete(null);
        }
    };

    const validateEditExpense = (): boolean => {
        const errors: Record<string, string> = {};

        if (!editExpenseForm.title?.trim()) {
            errors.title = "Title is required";
        }

        if (!editExpenseForm.amount || editExpenseForm.amount <= 0) {
            errors.amount = "Amount must be greater than 0";
        }

        if (!editExpenseForm.description?.trim()) {
            errors.description = "Description is required";
        }

        if (!editExpenseForm.expenseDate) {
            errors.expenseDate = "Date is required";
        }

        if (!editExpenseForm.categoryId) {
            errors.categoryId = "Category is required";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleUpdateExpense = async () => {
        if (!selectedExpense) return;

        if (!validateEditExpense()) {
            return;
        }

        try {
            await ExpenseService.updateExpense(selectedExpense.id, {
                title: editExpenseForm.title,
                amount: editExpenseForm.amount,
                description: editExpenseForm.description,
                expenseDate: editExpenseForm.expenseDate,
                categoryId: editExpenseForm.categoryId,
            });
            await fetchExpenses();
            setShowEditExpenseDialog(false);
            setSelectedExpense(null);
            setEditExpenseForm({});
            setValidationErrors({});
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || "Failed to update expense");
        }
    };

    const validateAddExpense = (): boolean => {
        const errors: Record<string, string> = {};

        if (!newExpenseForm.title?.trim()) {
            errors.title = "Title is required";
        }

        const amount = parseFloat(newExpenseForm.amount);
        if (!newExpenseForm.amount || isNaN(amount) || amount <= 0) {
            errors.amount = "Amount must be a valid number greater than 0";
        }

        if (!newExpenseForm.expenseDate) {
            errors.expenseDate = "Date is required";
        }

        if (!newExpenseForm.categoryId) {
            errors.categoryId = "Category is required";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleAddExpense = async () => {
        if (!validateAddExpense()) {
            return;
        }

        try {
            await ExpenseService.createExpense({
                title: newExpenseForm.title,
                amount: parseFloat(newExpenseForm.amount),
                description: newExpenseForm.description,
                expenseDate: newExpenseForm.expenseDate,
                categoryId: newExpenseForm.categoryId,
            });
            await fetchExpenses();
            setShowAddExpenseDialog(false);
            setNewExpenseForm({
                title: "",
                amount: "",
                description: "",
                expenseDate: new Date().toISOString().split('T')[0],
                categoryId: "",
            });
            setValidationErrors({});
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || "Failed to create expense");
        }
    };

    const openEditExpenseDialog = (expense: Expense) => {
        setSelectedExpense(expense);
        setEditExpenseForm({
            title: expense.title,
            amount: expense.amount,
            description: expense.description,
            expenseDate: expense.expenseDate,
            categoryId: expense.categoryId,
        });
        setShowEditExpenseDialog(true);
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPageSize(Number(e.target.value));
        setCurrentPage(0);
    };

    const renderPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 0; i < totalPages; i++) {
                pageNumbers.push(
                    <button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        style={{
                            ...styles.paginationButton,
                            ...(currentPage === i ? styles.paginationButtonActive : {}),
                        }}
                    >
                        {i + 1}
                    </button>
                );
            }
        } else {
            if (currentPage < 3) {
                for (let i = 0; i < 4; i++) {
                    pageNumbers.push(
                        <button
                            key={i}
                            onClick={() => handlePageChange(i)}
                            style={{
                                ...styles.paginationButton,
                                ...(currentPage === i ? styles.paginationButtonActive : {}),
                            }}
                        >
                            {i + 1}
                        </button>
                    );
                }
                pageNumbers.push(<span key="ellipsis" style={styles.ellipsis}>...</span>);
                pageNumbers.push(
                    <button
                        key={totalPages - 1}
                        onClick={() => handlePageChange(totalPages - 1)}
                        style={styles.paginationButton}
                    >
                        {totalPages}
                    </button>
                );
            } else if (currentPage >= totalPages - 3) {
                pageNumbers.push(
                    <button
                        key={0}
                        onClick={() => handlePageChange(0)}
                        style={styles.paginationButton}
                    >
                        1
                    </button>
                );
                pageNumbers.push(<span key="ellipsis" style={styles.ellipsis}>...</span>);
                for (let i = totalPages - 4; i < totalPages; i++) {
                    pageNumbers.push(
                        <button
                            key={i}
                            onClick={() => handlePageChange(i)}
                            style={{
                                ...styles.paginationButton,
                                ...(currentPage === i ? styles.paginationButtonActive : {}),
                            }}
                        >
                            {i + 1}
                        </button>
                    );
                }
            } else {
                pageNumbers.push(
                    <button
                        key={0}
                        onClick={() => handlePageChange(0)}
                        style={styles.paginationButton}
                    >
                        1
                    </button>
                );
                pageNumbers.push(<span key="ellipsis1" style={styles.ellipsis}>...</span>);
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pageNumbers.push(
                        <button
                            key={i}
                            onClick={() => handlePageChange(i)}
                            style={{
                                ...styles.paginationButton,
                                ...(currentPage === i ? styles.paginationButtonActive : {}),
                            }}
                        >
                            {i + 1}
                        </button>
                    );
                }
                pageNumbers.push(<span key="ellipsis2" style={styles.ellipsis}>...</span>);
                pageNumbers.push(
                    <button
                        key={totalPages - 1}
                        onClick={() => handlePageChange(totalPages - 1)}
                        style={styles.paginationButton}
                    >
                        {totalPages}
                    </button>
                );
            }
        }

        return pageNumbers;
    };

    const formatCurrency = (amount: number) => {
        return `$${amount.toFixed(2)}`;
    };

    return (
        <div style={styles.container}>
            <Toolbar title="My Expenses" backTo="/user/dashboard" showLogout={false} />

            <div style={styles.content}>
                {error && (
                    <div style={styles.error}>
                        {error}
                        <button onClick={() => setError(null)} style={styles.closeError}>×</button>
                    </div>
                )}

                <div style={styles.toolbar}>
                    <button onClick={() => setShowAddExpenseDialog(true)} style={styles.addButton}>
                        + Add Expense
                    </button>
                </div>

                {loading ? (
                    <div style={styles.loading}>Loading expenses...</div>
                ) : (
                    <>
                        <div style={styles.stats}>
                            <div style={styles.statItem}>
                                <span style={styles.statValue}>{totalElements}</span>
                                <span style={styles.statLabel}>Total Expenses</span>
                            </div>
                        </div>

                        <div style={styles.tableWrapper}>
                            <table style={styles.table}>
                                <thead>
                                    <tr style={styles.tableHeaderRow}>
                                        <th style={styles.tableHeader}>Date</th>
                                        <th style={styles.tableHeader}>Title</th>
                                        <th style={styles.tableHeader}>Description</th>
                                        <th style={styles.tableHeader}>Amount</th>
                                        <th style={styles.tableHeader}>Category</th>
                                        <th style={styles.tableHeader}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} style={styles.noData}>
                                                No expenses found
                                            </td>
                                        </tr>
                                    ) : (
                                        expenses.map((expense) => (
                                            <tr key={expense.id} style={styles.tableRow}>
                                                <td style={styles.tableCell}>{expense.expenseDate}</td>
                                                <td style={styles.tableCell}>{expense.title}</td>
                                                <td style={styles.tableCell}>{expense.description}</td>
                                                <td style={styles.tableCell}>
                                                    <span style={styles.amountText}>
                                                        {formatCurrency(expense.amount)}
                                                    </span>
                                                </td>
                                                <td style={styles.tableCell}>{expense.categoryName || "-"}</td>
                                                <td style={styles.tableCell}>
                                                    <div style={styles.actionButtons}>
                                                        <button
                                                            onClick={() => openEditExpenseDialog(expense)}
                                                            style={styles.editActionButton}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => openDeleteDialog(expense)}
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

                            {totalPages > 0 && (
                                <div style={styles.paginationContainer}>
                                    <div style={styles.paginationInfo}>
                                        Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} expenses
                                    </div>
                                    <div style={styles.paginationControls}>
                                        <select
                                            value={pageSize}
                                            onChange={handlePageSizeChange}
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
                                                    ...(currentPage === 0 ? styles.paginationButtonDisabled : {}),
                                                }}
                                            >
                                                First
                                            </button>
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 0}
                                                style={{
                                                    ...styles.paginationButton,
                                                    ...(currentPage === 0 ? styles.paginationButtonDisabled : {}),
                                                }}
                                            >
                                                Previous
                                            </button>
                                            {renderPageNumbers()}
                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage >= totalPages - 1}
                                                style={{
                                                    ...styles.paginationButton,
                                                    ...(currentPage >= totalPages - 1 ? styles.paginationButtonDisabled : {}),
                                                }}
                                            >
                                                Next
                                            </button>
                                            <button
                                                onClick={() => handlePageChange(totalPages - 1)}
                                                disabled={currentPage >= totalPages - 1}
                                                style={{
                                                    ...styles.paginationButton,
                                                    ...(currentPage >= totalPages - 1 ? styles.paginationButtonDisabled : {}),
                                                }}
                                            >
                                                Last
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Edit Expense Dialog */}
            {showEditExpenseDialog && selectedExpense && (
                <div style={styles.overlay} onClick={() => setShowEditExpenseDialog(false)}>
                    <div style={styles.dialog} onClick={(e) => e.stopPropagation()}>
                        <h2 style={styles.dialogTitle}>Edit Expense</h2>
                        <div style={styles.dialogField}>
                            <label style={styles.dialogLabel}>Title:</label>
                            <input
                                type="text"
                                value={editExpenseForm.title || ""}
                                onChange={(e) => setEditExpenseForm({ ...editExpenseForm, title: e.target.value })}
                                style={{
                                    ...styles.dialogInput,
                                    ...(validationErrors.title ? styles.inputError : {})
                                }}
                                placeholder="Expense title"
                            />
                            {validationErrors.title && (
                                <span style={styles.errorText}>{validationErrors.title}</span>
                            )}
                        </div>
                        <div style={styles.dialogField}>
                            <label style={styles.dialogLabel}>Amount:</label>
                            <input
                                type="number"
                                step="0.01"
                                value={editExpenseForm.amount || ""}
                                onChange={(e) => setEditExpenseForm({ ...editExpenseForm, amount: parseFloat(e.target.value) })}
                                style={{
                                    ...styles.dialogInput,
                                    ...(validationErrors.amount ? styles.inputError : {})
                                }}
                                placeholder="0.00"
                            />
                            {validationErrors.amount && (
                                <span style={styles.errorText}>{validationErrors.amount}</span>
                            )}
                        </div>
                        <div style={styles.dialogField}>
                            <label style={styles.dialogLabel}>Description:</label>
                            <input
                                type="text"
                                value={editExpenseForm.description || ""}
                                onChange={(e) => setEditExpenseForm({ ...editExpenseForm, description: e.target.value })}
                                style={{
                                    ...styles.dialogInput,
                                    ...(validationErrors.description ? styles.inputError : {})
                                }}
                                placeholder="Expense description"
                            />
                            {validationErrors.description && (
                                <span style={styles.errorText}>{validationErrors.description}</span>
                            )}
                        </div>
                        <div style={styles.dialogField}>
                            <label style={styles.dialogLabel}>Date:</label>
                            <input
                                type="date"
                                value={editExpenseForm.expenseDate || ""}
                                onChange={(e) => setEditExpenseForm({ ...editExpenseForm, expenseDate: e.target.value })}
                                style={{
                                    ...styles.dialogInput,
                                    ...(validationErrors.expenseDate ? styles.inputError : {})
                                }}
                            />
                            {validationErrors.expenseDate && (
                                <span style={styles.errorText}>{validationErrors.expenseDate}</span>
                            )}
                        </div>
                        <div style={styles.dialogField}>
                            <label style={styles.dialogLabel}>Category:</label>
                            <select
                                value={editExpenseForm.categoryId || ""}
                                onChange={(e) => setEditExpenseForm({ ...editExpenseForm, categoryId: e.target.value })}
                                style={{
                                    ...styles.dialogInput,
                                    ...(validationErrors.categoryId ? styles.inputError : {})
                                }}
                            >
                                <option value="">Select category</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            {validationErrors.categoryId && (
                                <span style={styles.errorText}>{validationErrors.categoryId}</span>
                            )}
                        </div>
                        <div style={styles.dialogActions}>
                            <button
                                onClick={() => {
                                    setShowEditExpenseDialog(false);
                                    setSelectedExpense(null);
                                    setEditExpenseForm({});
                                    setValidationErrors({});
                                }}
                                style={styles.cancelButton}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateExpense}
                                style={styles.saveButton}
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Expense Dialog */}
            {showAddExpenseDialog && (
                <div style={styles.overlay} onClick={() => setShowAddExpenseDialog(false)}>
                    <div style={styles.dialog} onClick={(e) => e.stopPropagation()}>
                        <h2 style={styles.dialogTitle}>Add New Expense</h2>
                        <div style={styles.dialogField}>
                            <label style={styles.dialogLabel}>Title:</label>
                            <input
                                type="text"
                                value={newExpenseForm.title}
                                onChange={(e) => setNewExpenseForm({ ...newExpenseForm, title: e.target.value })}
                                style={{
                                    ...styles.dialogInput,
                                    ...(validationErrors.title ? styles.inputError : {})
                                }}
                                placeholder="Expense title"
                            />
                            {validationErrors.title && (
                                <span style={styles.errorText}>{validationErrors.title}</span>
                            )}
                        </div>
                        <div style={styles.dialogField}>
                            <label style={styles.dialogLabel}>Amount:</label>
                            <input
                                type="number"
                                step="0.01"
                                value={newExpenseForm.amount}
                                onChange={(e) => setNewExpenseForm({ ...newExpenseForm, amount: e.target.value })}
                                style={{
                                    ...styles.dialogInput,
                                    ...(validationErrors.amount ? styles.inputError : {})
                                }}
                                placeholder="0.00"
                            />
                            {validationErrors.amount && (
                                <span style={styles.errorText}>{validationErrors.amount}</span>
                            )}
                        </div>
                        <div style={styles.dialogField}>
                            <label style={styles.dialogLabel}>Description:</label>
                            <input
                                type="text"
                                value={newExpenseForm.description}
                                onChange={(e) => setNewExpenseForm({ ...newExpenseForm, description: e.target.value })}
                                style={{
                                    ...styles.dialogInput,
                                    ...(validationErrors.description ? styles.inputError : {})
                                }}
                                placeholder="Expense description"
                            />
                            {validationErrors.description && (
                                <span style={styles.errorText}>{validationErrors.description}</span>
                            )}
                        </div>
                        <div style={styles.dialogField}>
                            <label style={styles.dialogLabel}>Date:</label>
                            <input
                                type="date"
                                value={newExpenseForm.expenseDate}
                                onChange={(e) => setNewExpenseForm({ ...newExpenseForm, expenseDate: e.target.value })}
                                style={{
                                    ...styles.dialogInput,
                                    ...(validationErrors.expenseDate ? styles.inputError : {})
                                }}
                            />
                            {validationErrors.expenseDate && (
                                <span style={styles.errorText}>{validationErrors.expenseDate}</span>
                            )}
                        </div>
                        <div style={styles.dialogField}>
                            <label style={styles.dialogLabel}>Category:</label>
                            <select
                                value={newExpenseForm.categoryId}
                                onChange={(e) => setNewExpenseForm({ ...newExpenseForm, categoryId: e.target.value })}
                                style={{
                                    ...styles.dialogInput,
                                    ...(validationErrors.categoryId ? styles.inputError : {})
                                }}
                            >
                                <option value="">Select category</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            {validationErrors.categoryId && (
                                <span style={styles.errorText}>{validationErrors.categoryId}</span>
                            )}
                        </div>
                        <div style={styles.dialogActions}>
                            <button
                                onClick={() => {
                                    setShowAddExpenseDialog(false);
                                    setNewExpenseForm({
                                        title: "",
                                        amount: "",
                                        description: "",
                                        expenseDate: new Date().toISOString().split('T')[0],
                                        categoryId: "",
                                    });
                                    setValidationErrors({});
                                }}
                                style={styles.cancelButton}
                            >
                                Cancel
                            </button>
                            <button onClick={handleAddExpense} style={styles.saveButton}>
                                Create Expense
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showDeleteDialog && expenseToDelete !== null}
                title="Delete Expense"
                message={`Are you sure you want to delete the expense "${expenseToDelete?.description}" (${expenseToDelete ? formatCurrency(expenseToDelete.amount) : ''})? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDeleteExpense}
                onCancel={() => {
                    setShowDeleteDialog(false);
                    setExpenseToDelete(null);
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
    amountText: {
        fontWeight: 600,
        color: "#059669",
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
