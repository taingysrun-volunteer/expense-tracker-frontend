import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import CategoryManagement from "./CategoryManagement";
import CategoryService from "../api/CategoryService";
import { Category, GetAllCategoriesResponse } from "../models/Category";

// Mock services and hooks
jest.mock("../api/CategoryService");
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

jest.mock("../components/Toolbar", () => {
    return function MockToolbar({ title, backTo, showLogout }: any) {
        return (
            <div data-testid="toolbar">
                <h1>{title}</h1>
                {backTo && <button onClick={() => window.history.back()}>Back</button>}
            </div>
        );
    };
});

jest.mock("../components/ConfirmDialog", () => {
    return function MockConfirmDialog({ isOpen, onConfirm, onCancel }: any) {
        if (!isOpen) return null;
        return (
            <div data-testid="confirm-dialog">
                <button onClick={onConfirm} data-testid="confirm-btn">Confirm</button>
                <button onClick={onCancel} data-testid="cancel-btn">Cancel</button>
            </div>
        );
    };
});

const mockCategories: Category[] = [
    {
        id: "1",
        name: "Food",
        description: "Food and dining expenses",
        isActive: true,
        createdAt: "2025-01-01",
    },
    {
        id: "2",
        name: "Transportation",
        description: "Travel and transport",
        isActive: true,
        createdAt: "2025-01-02",
    },
    {
        id: "3",
        name: "Utilities",
        description: "Electric, water, gas",
        isActive: false,
        createdAt: "2025-01-03",
    },
];

const mockAdminUser = {
    id: "1",
    firstName: "Admin",
    lastName: "User",
    email: "admin@example.com",
    role: "ADMIN",
};

const mockRegularUser = {
    id: "2",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    role: "USER",
};

describe("CategoryManagement Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        sessionStorage.clear();
        mockNavigate.mockClear();
        (CategoryService.getAllCategories as jest.Mock).mockClear();
        (CategoryService.createCategory as jest.Mock).mockClear();
        (CategoryService.updateCategory as jest.Mock).mockClear();
        (CategoryService.deleteCategory as jest.Mock).mockClear();
    });

    describe("Authentication & Authorization", () => {
        test("should redirect to login if no auth token exists", () => {
            (CategoryService.getAllCategories as jest.Mock).mockResolvedValue({
                content: [],
                totalElements: 0,
            });

            render(
                <BrowserRouter>
                    <CategoryManagement />
                </BrowserRouter>
            );

            expect(mockNavigate).toHaveBeenCalledWith("/login");
        });

        test("should redirect to user dashboard if user is not admin", () => {
            localStorage.setItem("authToken", "test-token");
            localStorage.setItem("user", JSON.stringify(mockRegularUser));

            render(
                <BrowserRouter>
                    <CategoryManagement />
                </BrowserRouter>
            );

            expect(mockNavigate).toHaveBeenCalledWith("/user/dashboard");
        });

        test("should allow access if user is admin", async () => {
            localStorage.setItem("authToken", "test-token");
            localStorage.setItem("user", JSON.stringify(mockAdminUser));

            (CategoryService.getAllCategories as jest.Mock).mockResolvedValue({
                content: mockCategories,
                totalElements: 3,
            });

            render(
                <BrowserRouter>
                    <CategoryManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(mockNavigate).not.toHaveBeenCalledWith("/login");
                expect(mockNavigate).not.toHaveBeenCalledWith("/user/dashboard");
            });
        });
    });

    describe("Initial Load", () => {
        beforeEach(() => {
            localStorage.setItem("authToken", "test-token");
            localStorage.setItem("user", JSON.stringify(mockAdminUser));
        });

        test("should display loading state initially", () => {
            (CategoryService.getAllCategories as jest.Mock).mockImplementation(
                () => new Promise(() => {}) // Never resolves
            );

            render(
                <BrowserRouter>
                    <CategoryManagement />
                </BrowserRouter>
            );

            expect(screen.getByText("Loading categories...")).toBeInTheDocument();
        });

        test("should fetch and display categories on mount", async () => {
            (CategoryService.getAllCategories as jest.Mock).mockResolvedValue({
                content: mockCategories,
                totalElements: 3,
            });

            render(
                <BrowserRouter>
                    <CategoryManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Food")).toBeInTheDocument();
                expect(screen.getByText("Transportation")).toBeInTheDocument();
                expect(screen.getByText("Utilities")).toBeInTheDocument();
            });
        });

        test("should display total categories count", async () => {
            (CategoryService.getAllCategories as jest.Mock).mockResolvedValue({
                content: mockCategories,
                totalElements: 3,
            });

            render(
                <BrowserRouter>
                    <CategoryManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("3")).toBeInTheDocument();
                expect(screen.getByText("Total Categories")).toBeInTheDocument();
            });
        });

        test("should display error message on fetch failure", async () => {
            const errorMessage = "Failed to load categories";
            (CategoryService.getAllCategories as jest.Mock).mockRejectedValue({
                response: {
                    data: {
                        message: errorMessage,
                    },
                },
            });

            render(
                <BrowserRouter>
                    <CategoryManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText(errorMessage)).toBeInTheDocument();
            });
        });

        test("should display 'No categories found' when list is empty", async () => {
            (CategoryService.getAllCategories as jest.Mock).mockResolvedValue({
                content: [],
                totalElements: 0,
            });

            render(
                <BrowserRouter>
                    <CategoryManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("No categories found")).toBeInTheDocument();
            });
        });
    });

    describe("Category Display", () => {
        beforeEach(() => {
            localStorage.setItem("authToken", "test-token");
            localStorage.setItem("user", JSON.stringify(mockAdminUser));
            (CategoryService.getAllCategories as jest.Mock).mockResolvedValue({
                content: mockCategories,
                totalElements: 3,
            });
        });

        test("should display category details in table", async () => {
            render(
                <BrowserRouter>
                    <CategoryManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Food")).toBeInTheDocument();
                expect(screen.getByText("Food and dining expenses")).toBeInTheDocument();
            });
        });

        test("should display status badges for categories", async () => {
            render(
                <BrowserRouter>
                    <CategoryManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                const activeStatuses = screen.getAllByText("Active");
                const inactiveStatuses = screen.getAllByText("Inactive");
                expect(activeStatuses.length).toBeGreaterThan(0);
                expect(inactiveStatuses.length).toBeGreaterThan(0);
            });
        });

        test("should display dash for missing description", async () => {
            const categoryNoDesc: Category = {
                id: "4",
                name: "Test",
                isActive: true,
            };

            (CategoryService.getAllCategories as jest.Mock).mockResolvedValue({
                content: [categoryNoDesc],
                totalElements: 1,
            });

            render(
                <BrowserRouter>
                    <CategoryManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("-")).toBeInTheDocument();
            });
        });
    });

    describe("Add Category", () => {
        beforeEach(() => {
            localStorage.setItem("authToken", "test-token");
            localStorage.setItem("user", JSON.stringify(mockAdminUser));
            (CategoryService.getAllCategories as jest.Mock).mockResolvedValue({
                content: mockCategories,
                totalElements: 3,
            });
        });

        test("should open add category dialog on button click", async () => {
            render(
                <BrowserRouter>
                    <CategoryManagement />
                </BrowserRouter>
            );

            const addButton = await screen.findByText("+ Add Category");
            fireEvent.click(addButton);

            expect(screen.getByText("Add New Category")).toBeInTheDocument();
        });

        test("should show validation error for empty name", async () => {
            render(
                <BrowserRouter>
                    <CategoryManagement />
                </BrowserRouter>
            );

            const addButton = await screen.findByText("+ Add Category");
            fireEvent.click(addButton);

            const createButton = screen.getByRole("button", { name: /create category/i });
            fireEvent.click(createButton);

            await waitFor(() => {
                expect(screen.getByText("Category name is required")).toBeInTheDocument();
            });
        });

        test("should create category successfully", async () => {
            const newCategory: Category = {
                id: "4",
                name: "Entertainment",
                description: "Movies and hobbies",
                isActive: true,
            };

            (CategoryService.createCategory as jest.Mock).mockResolvedValue(newCategory);

            render(
                <BrowserRouter>
                    <CategoryManagement />
                </BrowserRouter>
            );

            const addButton = await screen.findByText("+ Add Category");
            fireEvent.click(addButton);

            const nameInput = screen.getByPlaceholderText("Food");
            fireEvent.change(nameInput, { target: { value: "Entertainment" } });

            const descriptionTextarea = screen.getByPlaceholderText("Category description...");
            fireEvent.change(descriptionTextarea, { target: { value: "Movies and hobbies" } });

            const createButton = screen.getByRole("button", { name: /create category/i });
            fireEvent.click(createButton);

            await waitFor(() => {
                expect(CategoryService.createCategory).toHaveBeenCalledWith({
                    name: "Entertainment",
                    description: "Movies and hobbies",
                    isActive: true,
                });
            });
        });

        test("should close dialog after successful creation", async () => {
            const newCategory: Category = {
                id: "4",
                name: "Entertainment",
                description: "Movies and hobbies",
                isActive: true,
            };

            (CategoryService.createCategory as jest.Mock).mockResolvedValue(newCategory);

            render(
                <BrowserRouter>
                    <CategoryManagement />
                </BrowserRouter>
            );

            const addButton = await screen.findByText("+ Add Category");
            fireEvent.click(addButton);

            const nameInput = screen.getByPlaceholderText("Food");
            fireEvent.change(nameInput, { target: { value: "Entertainment" } });

            const createButton = screen.getByRole("button", { name: /create category/i });
            fireEvent.click(createButton);

            await waitFor(() => {
                expect(screen.queryByText("Add New Category")).not.toBeInTheDocument();
            });
        });

        test("should display error on creation failure", async () => {
            const errorMessage = "Failed to create category";
            (CategoryService.createCategory as jest.Mock).mockRejectedValue({
                response: {
                    data: {
                        message: errorMessage,
                    },
                },
            });

            render(
                <BrowserRouter>
                    <CategoryManagement />
                </BrowserRouter>
            );

            const addButton = await screen.findByText("+ Add Category");
            fireEvent.click(addButton);

            const nameInput = screen.getByPlaceholderText("Food");
            fireEvent.change(nameInput, { target: { value: "Entertainment" } });

            const createButton = screen.getByRole("button", { name: /create category/i });
            fireEvent.click(createButton);

            await waitFor(() => {
                expect(screen.getByText(errorMessage)).toBeInTheDocument();
            });
        });

        test("should cancel add category dialog", async () => {
            render(
                <BrowserRouter>
                    <CategoryManagement />
                </BrowserRouter>
            );

            const addButton = await screen.findByText("+ Add Category");
            fireEvent.click(addButton);

            const cancelButton = screen.getAllByText("Cancel")[0];
            fireEvent.click(cancelButton);

            await waitFor(() => {
                expect(screen.queryByText("Add New Category")).not.toBeInTheDocument();
            });
        });
    });

    describe("Edit Category", () => {
        beforeEach(() => {
            localStorage.setItem("authToken", "test-token");
            localStorage.setItem("user", JSON.stringify(mockAdminUser));
            (CategoryService.getAllCategories as jest.Mock).mockResolvedValue({
                content: mockCategories,
                totalElements: 3,
            });
        });

        test("should open edit dialog on edit button click", async () => {
            render(
                <BrowserRouter>
                    <CategoryManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Food")).toBeInTheDocument();
            });

            const editButtons = screen.getAllByRole("button", { name: /edit/i });
            fireEvent.click(editButtons[0]);

            expect(screen.getByText("Edit Category")).toBeInTheDocument();
        });

        test("should populate form with category data", async () => {
            render(
                <BrowserRouter>
                    <CategoryManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Food")).toBeInTheDocument();
            });

            const editButtons = screen.getAllByRole("button", { name: /edit/i });
            fireEvent.click(editButtons[0]);

            const nameInput = screen.getByDisplayValue("Food") as HTMLInputElement;
            expect(nameInput.value).toBe("Food");
        });

        test("should show validation error for empty name on edit", async () => {
            render(
                <BrowserRouter>
                    <CategoryManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Food")).toBeInTheDocument();
            });

            const editButtons = screen.getAllByRole("button", { name: /edit/i });
            fireEvent.click(editButtons[0]);

            const nameInput = screen.getByDisplayValue("Food") as HTMLInputElement;
            fireEvent.change(nameInput, { target: { value: "" } });

            const updateButton = screen.getByRole("button", { name: /update/i });
            fireEvent.click(updateButton);

            await waitFor(() => {
                expect(screen.getByText("Category name is required")).toBeInTheDocument();
            });
        });

        test("should update category successfully", async () => {
            const updatedCategory: Category = {
                id: "1",
                name: "Food & Dining",
                description: "Updated description",
                isActive: true,
            };

            (CategoryService.updateCategory as jest.Mock).mockResolvedValue(updatedCategory);

            render(
                <BrowserRouter>
                    <CategoryManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Food")).toBeInTheDocument();
            });

            const editButtons = screen.getAllByRole("button", { name: /edit/i });
            fireEvent.click(editButtons[0]);

            const nameInput = screen.getByDisplayValue("Food") as HTMLInputElement;
            fireEvent.change(nameInput, { target: { value: "Food & Dining" } });

            const updateButton = screen.getByRole("button", { name: /update/i });
            fireEvent.click(updateButton);

            await waitFor(() => {
                expect(CategoryService.updateCategory).toHaveBeenCalledWith("1", {
                    name: "Food & Dining",
                    description: "Food and dining expenses",
                    isActive: true,
                });
            });
        });

        test("should close dialog after successful update", async () => {
            const updatedCategory: Category = {
                id: "1",
                name: "Food & Dining",
                description: "Updated description",
                isActive: true,
            };

            (CategoryService.updateCategory as jest.Mock).mockResolvedValue(updatedCategory);

            render(
                <BrowserRouter>
                    <CategoryManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Food")).toBeInTheDocument();
            });

            const editButtons = screen.getAllByRole("button", { name: /edit/i });
            fireEvent.click(editButtons[0]);

            const updateButton = screen.getByRole("button", { name: /update/i });
            fireEvent.click(updateButton);

            await waitFor(() => {
                expect(screen.queryByText("Edit Category")).not.toBeInTheDocument();
            });
        });

        test("should cancel edit dialog", async () => {
            render(
                <BrowserRouter>
                    <CategoryManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Food")).toBeInTheDocument();
            });

            const editButtons = screen.getAllByRole("button", { name: /edit/i });
            fireEvent.click(editButtons[0]);

            const cancelButtons = screen.getAllByText("Cancel");
            fireEvent.click(cancelButtons[0]);

            await waitFor(() => {
                expect(screen.queryByText("Edit Category")).not.toBeInTheDocument();
            });
        });
    });

    describe("Delete Category", () => {
        beforeEach(() => {
            localStorage.setItem("authToken", "test-token");
            localStorage.setItem("user", JSON.stringify(mockAdminUser));
            (CategoryService.getAllCategories as jest.Mock).mockResolvedValue({
                content: mockCategories,
                totalElements: 3,
            });
        });

        test("should open delete confirmation dialog on delete button click", async () => {
            render(
                <BrowserRouter>
                    <CategoryManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Food")).toBeInTheDocument();
            });

            const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
            fireEvent.click(deleteButtons[0]);

            expect(screen.getByTestId("confirm-dialog")).toBeInTheDocument();
        });

        test("should delete category successfully", async () => {
            (CategoryService.deleteCategory as jest.Mock).mockResolvedValue({});

            render(
                <BrowserRouter>
                    <CategoryManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Food")).toBeInTheDocument();
            });

            const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
            fireEvent.click(deleteButtons[0]);

            const confirmButton = screen.getByTestId("confirm-btn");
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(CategoryService.deleteCategory).toHaveBeenCalledWith("1");
            });
        });

        test("should update total elements after deletion", async () => {
            (CategoryService.deleteCategory as jest.Mock).mockResolvedValue({});

            render(
                <BrowserRouter>
                    <CategoryManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("3")).toBeInTheDocument();
            });

            const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
            fireEvent.click(deleteButtons[0]);

            const confirmButton = screen.getByTestId("confirm-btn");
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(screen.getByText("2")).toBeInTheDocument();
            });
        });

        test("should display error on delete failure", async () => {
            const errorMessage = "Failed to delete category";
            (CategoryService.deleteCategory as jest.Mock).mockRejectedValue({
                response: {
                    data: {
                        message: errorMessage,
                    },
                },
            });

            render(
                <BrowserRouter>
                    <CategoryManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Food")).toBeInTheDocument();
            });

            const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
            fireEvent.click(deleteButtons[0]);

            const confirmButton = screen.getByTestId("confirm-btn");
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(screen.getByText(errorMessage)).toBeInTheDocument();
            });
        });

        test("should cancel delete confirmation", async () => {
            render(
                <BrowserRouter>
                    <CategoryManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Food")).toBeInTheDocument();
            });

            const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
            fireEvent.click(deleteButtons[0]);

            const cancelButton = screen.getByTestId("cancel-btn");
            fireEvent.click(cancelButton);

            expect(CategoryService.deleteCategory).not.toHaveBeenCalled();
        });
    });

    describe("Checkbox Handling", () => {
        beforeEach(() => {
            localStorage.setItem("authToken", "test-token");
            localStorage.setItem("user", JSON.stringify(mockAdminUser));
            (CategoryService.getAllCategories as jest.Mock).mockResolvedValue({
                content: mockCategories,
                totalElements: 3,
            });
        });

        test("should handle active/inactive checkbox in add dialog", async () => {
            const newCategory: Category = {
                id: "4",
                name: "Test",
                description: "Test",
                isActive: false,
            };

            (CategoryService.createCategory as jest.Mock).mockResolvedValue(newCategory);

            render(
                <BrowserRouter>
                    <CategoryManagement />
                </BrowserRouter>
            );

            const addButton = await screen.findByText("+ Add Category");
            fireEvent.click(addButton);

            const checkboxes = screen.getAllByRole("checkbox");
            fireEvent.click(checkboxes[0]);

            const nameInput = screen.getByPlaceholderText("Food");
            fireEvent.change(nameInput, { target: { value: "Test" } });

            const createButton = screen.getByRole("button", { name: /create category/i });
            fireEvent.click(createButton);

            await waitFor(() => {
                expect(CategoryService.createCategory).toHaveBeenCalledWith({
                    name: "Test",
                    description: "",
                    isActive: false,
                });
            });
        });
    });

    describe("Error Handling", () => {
        beforeEach(() => {
            localStorage.setItem("authToken", "test-token");
            localStorage.setItem("user", JSON.stringify(mockAdminUser));
        });

        test("should dismiss error message on close button click", async () => {
            const errorMessage = "Failed to load categories";
            (CategoryService.getAllCategories as jest.Mock).mockRejectedValue({
                response: {
                    data: {
                        message: errorMessage,
                    },
                },
            });

            render(
                <BrowserRouter>
                    <CategoryManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText(errorMessage)).toBeInTheDocument();
            });

            const closeButton = screen.getByText("×");
            fireEvent.click(closeButton);

            await waitFor(() => {
                expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
            });
        });
    });
});