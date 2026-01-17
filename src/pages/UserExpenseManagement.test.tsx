import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import UserExpenseManagement from "./UserExpenseManagement";
import ExpenseService from "../api/ExpenseService";
import CategoryService from "../api/CategoryService";

// Mock services
jest.mock("../api/ExpenseService");
jest.mock("../api/CategoryService");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

const mockExpenses = [
    {
        id: "1",
        title: "Groceries",
        amount: 50.5,
        description: "Weekly groceries",
        expenseDate: "2024-01-15",
        categoryId: "cat1",
        categoryName: "Food",
        userId: "user1",
    },
    {
        id: "2",
        title: "Gas",
        amount: 45.0,
        description: "Gas for car",
        expenseDate: "2024-01-14",
        categoryId: "cat2",
        categoryName: "Transportation",
        userId: "user1",
    },
];

const mockCategories = [
    { id: "cat1", name: "Food" },
    { id: "cat2", name: "Transportation" },
    { id: "cat3", name: "Entertainment" },
];

describe("UserExpenseManagement Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        sessionStorage.clear();
        localStorage.setItem("authToken", "test-token");

        (ExpenseService.getAllExpenses as jest.Mock).mockResolvedValue({
            content: mockExpenses,
            totalPages: 1,
            totalElements: 2,
        });

        (CategoryService.getAllCategories as jest.Mock).mockResolvedValue({
            content: mockCategories,
        });
    });

    describe("Authentication & Loading", () => {
        test("should redirect to login if no auth token", async () => {
            localStorage.clear();
            sessionStorage.clear();

            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            expect(mockNavigate).toHaveBeenCalledWith("/login");
        });

        test("should fetch expenses and categories on mount", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(ExpenseService.getAllExpenses).toHaveBeenCalledWith(0, 10);
                expect(CategoryService.getAllCategories).toHaveBeenCalled();
            });
        });

        test("should display loading state initially", () => {
            (ExpenseService.getAllExpenses as jest.Mock).mockImplementation(
                () => new Promise(() => {})
            );

            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            expect(screen.getByText("Loading expenses...")).toBeInTheDocument();
        });

        test("should display toolbar with back button", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("My Expenses")).toBeInTheDocument();
            });
        });
    });

    describe("Expense Display", () => {
        test("should display all expenses in table", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Groceries")).toBeInTheDocument();
                expect(screen.getByText("Gas")).toBeInTheDocument();
            });
        });

        test("should display expense details correctly", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Weekly groceries")).toBeInTheDocument();
                expect(screen.getByText("Gas for car")).toBeInTheDocument();
                expect(screen.getByText("$50.50")).toBeInTheDocument();
                expect(screen.getByText("$45.00")).toBeInTheDocument();
            });
        });

        test("should display category names", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                const categoryElements = screen.getAllByText("Food");
                expect(categoryElements.length).toBeGreaterThan(0);
                expect(screen.getByText("Transportation")).toBeInTheDocument();
            });
        });

        test("should display expense dates", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("2024-01-15")).toBeInTheDocument();
                expect(screen.getByText("2024-01-14")).toBeInTheDocument();
            });
        });

        test("should display total expenses count", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("2")).toBeInTheDocument();
                expect(screen.getByText("Total Expenses")).toBeInTheDocument();
            });
        });

        test("should display 'No expenses found' when empty", async () => {
            (ExpenseService.getAllExpenses as jest.Mock).mockResolvedValue({
                content: [],
                totalPages: 0,
                totalElements: 0,
            });

            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("No expenses found")).toBeInTheDocument();
            });
        });

        test("should have Add Expense button", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByRole("button", { name: /\+ Add Expense/i })).toBeInTheDocument();
            });
        });

        test("should display Edit and Delete buttons for each expense", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                const editButtons = screen.getAllByText("Edit");
                const deleteButtons = screen.getAllByText("Delete");
                expect(editButtons.length).toBe(2);
                expect(deleteButtons.length).toBe(2);
            });
        });
    });

    describe("Add Expense Dialog", () => {
        test("should open add expense dialog when button clicked", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            const addButton = await screen.findByRole("button", { name: /\+ Add Expense/i });
            fireEvent.click(addButton);

            expect(screen.getByText("Add New Expense")).toBeInTheDocument();
            expect(screen.getByPlaceholderText("Expense title")).toBeInTheDocument();
        });

        test("should have all required fields in add dialog", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            const addButton = await screen.findByRole("button", { name: /\+ Add Expense/i });
            fireEvent.click(addButton);

            expect(screen.getByPlaceholderText("Expense title")).toBeInTheDocument();
            expect(screen.getByPlaceholderText("0.00")).toBeInTheDocument();
            expect(screen.getByPlaceholderText("Expense description")).toBeInTheDocument();
            expect(screen.getByDisplayValue(/^\d{4}-\d{2}-\d{2}$/)).toBeInTheDocument();
        });

        test("should populate category dropdown in add dialog", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            const addButton = await screen.findByRole("button", { name: /\+ Add Expense/i });
            fireEvent.click(addButton);

            const categorySelect = screen.getByDisplayValue("Select category");
            expect(categorySelect).toBeInTheDocument();

            const options = screen.getAllByRole("option");
            expect(options.some(opt => opt.textContent === "Food")).toBe(true);
            expect(options.some(opt => opt.textContent === "Transportation")).toBe(true);
        });

        test("should close dialog on Cancel button", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            const addButton = await screen.findByRole("button", { name: /\+ Add Expense/i });
            fireEvent.click(addButton);

            expect(screen.getByText("Add New Expense")).toBeInTheDocument();

            const cancelButtons = screen.getAllByText("Cancel");
            fireEvent.click(cancelButtons[0]);

            await waitFor(() => {
                expect(screen.queryByText("Add New Expense")).not.toBeInTheDocument();
            });
        });
    });

    describe("Add Expense Validation", () => {
        test("should show error when title is empty", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            const addButton = await screen.findByRole("button", { name: /\+ Add Expense/i });
            fireEvent.click(addButton);

            const amountInput = screen.getByPlaceholderText("0.00") as HTMLInputElement;
            const categorySelect = screen.getByDisplayValue("Select category");
            const dateInput = screen.getByDisplayValue(/^\d{4}-\d{2}-\d{2}$/) as HTMLInputElement;

            fireEvent.change(amountInput, { target: { value: "50" } });
            fireEvent.change(categorySelect, { target: { value: "cat1" } });
            fireEvent.change(dateInput, { target: { value: "2024-01-15" } });

            const createButton = screen.getByRole("button", { name: /Create Expense/i });
            fireEvent.click(createButton);

            await waitFor(() => {
                expect(screen.getByText("Title is required")).toBeInTheDocument();
            });
        });

        test("should show error when amount is invalid", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            const addButton = await screen.findByRole("button", { name: /\+ Add Expense/i });
            fireEvent.click(addButton);

            const titleInput = screen.getByPlaceholderText("Expense title");
            const amountInput = screen.getByPlaceholderText("0.00");
            const categorySelect = screen.getByDisplayValue("Select category");

            fireEvent.change(titleInput, { target: { value: "Test" } });
            fireEvent.change(amountInput, { target: { value: "0" } });
            fireEvent.change(categorySelect, { target: { value: "cat1" } });

            const createButton = screen.getByRole("button", { name: /Create Expense/i });
            fireEvent.click(createButton);

            await waitFor(() => {
                expect(screen.getByText(/Amount must be a valid number greater than 0/)).toBeInTheDocument();
            });
        });

        test("should show error when category is not selected", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            const addButton = await screen.findByRole("button", { name: /\+ Add Expense/i });
            fireEvent.click(addButton);

            const titleInput = screen.getByPlaceholderText("Expense title");
            const amountInput = screen.getByPlaceholderText("0.00");

            fireEvent.change(titleInput, { target: { value: "Test" } });
            fireEvent.change(amountInput, { target: { value: "50" } });

            const createButton = screen.getByRole("button", { name: /Create Expense/i });
            fireEvent.click(createButton);

            await waitFor(() => {
                expect(screen.getByText("Category is required")).toBeInTheDocument();
            });
        });
    });

    describe("Add Expense Submission", () => {
        test("should successfully add a new expense", async () => {
            (ExpenseService.createExpense as jest.Mock).mockResolvedValue({
                id: "3",
                title: "New Expense",
            });

            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            const addButton = await screen.findByRole("button", { name: /\+ Add Expense/i });
            fireEvent.click(addButton);

            const titleInput = screen.getByPlaceholderText("Expense title");
            const amountInput = screen.getByPlaceholderText("0.00");
            const descriptionInput = screen.getByPlaceholderText("Expense description");
            const categorySelect = screen.getByDisplayValue("Select category");

            fireEvent.change(titleInput, { target: { value: "New Expense" } });
            fireEvent.change(amountInput, { target: { value: "75.50" } });
            fireEvent.change(descriptionInput, { target: { value: "New item" } });
            fireEvent.change(categorySelect, { target: { value: "cat1" } });

            const createButton = screen.getByRole("button", { name: /Create Expense/i });
            fireEvent.click(createButton);

            await waitFor(() => {
                expect(ExpenseService.createExpense).toHaveBeenCalledWith({
                    title: "New Expense",
                    amount: 75.5,
                    description: "New item",
                    expenseDate: expect.any(String),
                    categoryId: "cat1",
                });
            });
        });

        test("should close dialog after successful expense creation", async () => {
            (ExpenseService.createExpense as jest.Mock).mockResolvedValue({ id: "3" });

            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            const addButton = await screen.findByRole("button", { name: /\+ Add Expense/i });
            fireEvent.click(addButton);

            const titleInput = screen.getByPlaceholderText("Expense title");
            const amountInput = screen.getByPlaceholderText("0.00");
            const categorySelect = screen.getByDisplayValue("Select category");

            fireEvent.change(titleInput, { target: { value: "New" } });
            fireEvent.change(amountInput, { target: { value: "50" } });
            fireEvent.change(categorySelect, { target: { value: "cat1" } });

            const createButton = screen.getByRole("button", { name: /Create Expense/i });
            fireEvent.click(createButton);

            await waitFor(() => {
                expect(screen.queryByText("Add New Expense")).not.toBeInTheDocument();
            });
        });
    });

    describe("Edit Expense Dialog", () => {
        test("should open edit dialog when Edit button clicked", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                const editButtons = screen.getAllByText("Edit");
                fireEvent.click(editButtons[0]);
            });

            expect(screen.getByText("Edit Expense")).toBeInTheDocument();
        });

        test("should populate edit dialog with expense data", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                const editButtons = screen.getAllByText("Edit");
                fireEvent.click(editButtons[0]);
            });

            const titleInputs = screen.getAllByDisplayValue("Groceries");
            expect(titleInputs.length).toBeGreaterThan(0);
            expect(screen.getByDisplayValue("50.5")).toBeInTheDocument();
            expect(screen.getByDisplayValue("Weekly groceries")).toBeInTheDocument();
        });

        test("should close edit dialog on Cancel", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                const editButtons = screen.getAllByText("Edit");
                fireEvent.click(editButtons[0]);
            });

            expect(screen.getByText("Edit Expense")).toBeInTheDocument();

            const cancelButtons = screen.getAllByText("Cancel");
            fireEvent.click(cancelButtons[0]);

            await waitFor(() => {
                expect(screen.queryByText("Edit Expense")).not.toBeInTheDocument();
            });
        });
    });

    describe("Edit Expense Validation", () => {
        test("should show error when editing with empty title", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                const editButtons = screen.getAllByText("Edit");
                fireEvent.click(editButtons[0]);
            });

            const titleInputs = screen.getAllByDisplayValue("Groceries") as HTMLInputElement[];
            const titleInput = titleInputs.find(input => input.type === "text");

            if (titleInput) {
                fireEvent.change(titleInput, { target: { value: "" } });
            }

            const updateButtons = screen.getAllByText("Update");
            fireEvent.click(updateButtons[0]);

            await waitFor(() => {
                expect(screen.getByText("Title is required")).toBeInTheDocument();
            });
        });

        test("should show error when editing with invalid amount", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                const editButtons = screen.getAllByText("Edit");
                fireEvent.click(editButtons[0]);
            });

            const amountInput = screen.getByDisplayValue("50.5") as HTMLInputElement;
            fireEvent.change(amountInput, { target: { value: "-5" } });

            const updateButtons = screen.getAllByText("Update");
            fireEvent.click(updateButtons[0]);

            await waitFor(() => {
                expect(screen.getByText("Amount must be greater than 0")).toBeInTheDocument();
            });
        });
    });

    describe("Edit Expense Submission", () => {
        test("should successfully update an expense", async () => {
            (ExpenseService.updateExpense as jest.Mock).mockResolvedValue({ id: "1" });

            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                const editButtons = screen.getAllByText("Edit");
                fireEvent.click(editButtons[0]);
            });

            const titleInputs = screen.getAllByDisplayValue("Groceries") as HTMLInputElement[];
            const titleInput = titleInputs.find(input => input.type === "text");

            if (titleInput) {
                fireEvent.change(titleInput, { target: { value: "Updated Groceries" } });
            }

            const updateButtons = screen.getAllByText("Update");
            fireEvent.click(updateButtons[0]);

            await waitFor(() => {
                expect(ExpenseService.updateExpense).toHaveBeenCalledWith("1", expect.objectContaining({
                    title: "Updated Groceries",
                }));
            });
        });

        test("should close edit dialog after successful update", async () => {
            (ExpenseService.updateExpense as jest.Mock).mockResolvedValue({ id: "1" });

            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                const editButtons = screen.getAllByText("Edit");
                fireEvent.click(editButtons[0]);
            });

            const titleInputs = screen.getAllByDisplayValue("Groceries") as HTMLInputElement[];
            const titleInput = titleInputs.find(input => input.type === "text");

            if (titleInput) {
                fireEvent.change(titleInput, { target: { value: "Updated" } });
            }

            const updateButtons = screen.getAllByText("Update");
            fireEvent.click(updateButtons[0]);

            await waitFor(() => {
                expect(screen.queryByText("Edit Expense")).not.toBeInTheDocument();
            });
        });
    });

    describe("Delete Expense", () => {
        test("should open delete confirmation dialog", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                const deleteButtons = screen.getAllByText("Delete");
                fireEvent.click(deleteButtons[0]);
            });

            expect(screen.getByText("Delete Expense")).toBeInTheDocument();
        });

        test("should show correct confirmation message", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                const deleteButtons = screen.getAllByText("Delete");
                fireEvent.click(deleteButtons[0]);
            });

            const confirmMessages = screen.getAllByText(/Weekly groceries/);
            expect(confirmMessages.length).toBeGreaterThan(0);
            const currencyMessages = screen.getAllByText(/\$50.50/);
            expect(currencyMessages.length).toBeGreaterThan(0);
        });

        test("should successfully delete expense on confirmation", async () => {
            (ExpenseService.deleteExpense as jest.Mock).mockResolvedValue(null);

            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                const deleteButtons = screen.getAllByText("Delete");
                fireEvent.click(deleteButtons[0]);
            });

            const confirmButtons = screen.getAllByRole("button", { name: /Delete/ });
            fireEvent.click(confirmButtons[confirmButtons.length - 1]);

            await waitFor(() => {
                expect(ExpenseService.deleteExpense).toHaveBeenCalledWith("1");
            });
        });

        test("should refetch expenses after deletion", async () => {
            (ExpenseService.deleteExpense as jest.Mock).mockResolvedValue(null);

            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            const initialCallCount = (ExpenseService.getAllExpenses as jest.Mock).mock.calls.length;

            await waitFor(() => {
                const deleteButtons = screen.getAllByText("Delete");
                fireEvent.click(deleteButtons[0]);
            });

            const confirmButtons = screen.getAllByRole("button", { name: /Delete/ });
            fireEvent.click(confirmButtons[confirmButtons.length - 1]);

            await waitFor(() => {
                expect((ExpenseService.getAllExpenses as jest.Mock).mock.calls.length).toBeGreaterThan(initialCallCount);
            });
        });
    });

    describe("Pagination", () => {
        test("should display pagination info", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText(/Showing 1 to 2 of 2 expenses/)).toBeInTheDocument();
            });
        });

        test("should have page size selector", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                const select = screen.getByDisplayValue("10 per page");
                expect(select).toBeInTheDocument();
            });
        });

        test("should change page size when selector changes", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                const select = screen.getByDisplayValue("10 per page");
                fireEvent.change(select, { target: { value: "5" } });
            });

            await waitFor(() => {
                expect(ExpenseService.getAllExpenses).toHaveBeenCalledWith(0, 5);
            });
        });

        test("should have pagination navigation buttons", async () => {
            (ExpenseService.getAllExpenses as jest.Mock).mockResolvedValue({
                content: mockExpenses,
                totalPages: 5,
                totalElements: 50,
            });

            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByRole("button", { name: /First/i })).toBeInTheDocument();
                expect(screen.getByRole("button", { name: /Previous/i })).toBeInTheDocument();
                expect(screen.getByRole("button", { name: /Next/i })).toBeInTheDocument();
                expect(screen.getByRole("button", { name: /Last/i })).toBeInTheDocument();
            });
        });

        test("should disable First and Previous buttons on first page", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                const firstButton = screen.getByRole("button", { name: /First/i }) as HTMLButtonElement;
                const prevButton = screen.getByRole("button", { name: /Previous/i }) as HTMLButtonElement;
                expect(firstButton.disabled).toBe(true);
                expect(prevButton.disabled).toBe(true);
            });
        });
    });

    describe("Error Handling", () => {
        test("should display error message when fetch fails", async () => {
            (ExpenseService.getAllExpenses as jest.Mock).mockRejectedValue({
                response: {
                    data: {
                        message: "Failed to fetch expenses",
                    },
                },
            });

            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Failed to fetch expenses")).toBeInTheDocument();
            });
        });

        test("should close error message when close button clicked", async () => {
            (ExpenseService.getAllExpenses as jest.Mock).mockRejectedValue({
                response: {
                    data: {
                        message: "Error message",
                    },
                },
            });

            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Error message")).toBeInTheDocument();
            });

            const closeButton = screen.getByText("×");
            fireEvent.click(closeButton);

            await waitFor(() => {
                expect(screen.queryByText("Error message")).not.toBeInTheDocument();
            });
        });

        test("should display error when creating expense fails", async () => {
            (ExpenseService.createExpense as jest.Mock).mockRejectedValue({
                response: {
                    data: {
                        message: "Failed to create expense",
                    },
                },
            });

            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            const addButton = await screen.findByRole("button", { name: /\+ Add Expense/i });
            fireEvent.click(addButton);

            const titleInput = screen.getByPlaceholderText("Expense title");
            const amountInput = screen.getByPlaceholderText("0.00");
            const categorySelect = screen.getByDisplayValue("Select category");

            fireEvent.change(titleInput, { target: { value: "Test" } });
            fireEvent.change(amountInput, { target: { value: "50" } });
            fireEvent.change(categorySelect, { target: { value: "cat1" } });

            const createButton = screen.getByRole("button", { name: /Create Expense/i });
            fireEvent.click(createButton);

            await waitFor(() => {
                expect(screen.getByText("Failed to create expense")).toBeInTheDocument();
            });
        });

        test("should display error when updating expense fails", async () => {
            (ExpenseService.updateExpense as jest.Mock).mockRejectedValue({
                response: {
                    data: {
                        message: "Failed to update expense",
                    },
                },
            });

            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                const editButtons = screen.getAllByText("Edit");
                fireEvent.click(editButtons[0]);
            });

            const updateButtons = screen.getAllByText("Update");
            fireEvent.click(updateButtons[0]);

            await waitFor(() => {
                expect(screen.getByText("Failed to update expense")).toBeInTheDocument();
            });
        });

        test("should display error when deleting expense fails", async () => {
            (ExpenseService.deleteExpense as jest.Mock).mockRejectedValue({
                response: {
                    data: {
                        message: "Failed to delete expense",
                    },
                },
            });

            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                const deleteButtons = screen.getAllByText("Delete");
                fireEvent.click(deleteButtons[0]);
            });

            const confirmButtons = screen.getAllByRole("button", { name: /Delete/ });
            fireEvent.click(confirmButtons[confirmButtons.length - 1]);

            await waitFor(() => {
                expect(screen.getByText("Failed to delete expense")).toBeInTheDocument();
            });
        });
    });

    describe("Currency Formatting", () => {
        test("should format amounts as currency", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseManagement />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("$50.50")).toBeInTheDocument();
                expect(screen.getByText("$45.00")).toBeInTheDocument();
            });
        });
    });
});
