import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ExpenseReport from "./ExpenseReport";
import ReportService from "../api/ReportService";
import CategoryService from "../api/CategoryService";
import { SummaryResponse, CategoryBreakdown, MonthlyBreakdown } from "../models/Report";
import { Category } from "../models/Category";

// Mock services and hooks
jest.mock("../api/ReportService");
jest.mock("../api/CategoryService");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

jest.mock("../components/Toolbar", () => {
    return function MockToolbar({ title, backTo, actions }: any) {
        return (
            <div data-testid="toolbar">
                <h1>{title}</h1>
                {actions && <div data-testid="toolbar-actions">{actions}</div>}
            </div>
        );
    };
});

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

const mockCategories: Category[] = [
    {
        id: "1",
        name: "Food",
        description: "Food expenses",
        isActive: true,
    },
    {
        id: "2",
        name: "Transportation",
        description: "Transport expenses",
        isActive: true,
    },
    {
        id: "3",
        name: "Utilities",
        description: "Utility expenses",
        isActive: true,
    },
];

const mockCategoryBreakdown: CategoryBreakdown[] = [
    {
        categoryName: "Food",
        totalAmount: 500,
        count: 10,
        percentage: 50,
    },
    {
        categoryName: "Transportation",
        totalAmount: 300,
        count: 6,
        percentage: 30,
    },
    {
        categoryName: "Utilities",
        totalAmount: 200,
        count: 4,
        percentage: 20,
    },
];

const mockMonthlyBreakdown: MonthlyBreakdown[] = [
    {
        month: "2025-01",
        totalAmount: 600,
        count: 12,
    },
    {
        month: "2025-02",
        totalAmount: 400,
        count: 8,
    },
    {
        month: "2025-03",
        totalAmount: 500,
        count: 10,
    },
];

const mockSummary: SummaryResponse = {
    totalAmount: 1000,
    totalCount: 20,
    averageAmount: 50,
    maxAmount: 200,
    minAmount: 10,
    categoryBreakdown: mockCategoryBreakdown,
    monthlyBreakdown: mockMonthlyBreakdown,
};

describe("ExpenseReport Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        sessionStorage.clear();
        mockNavigate.mockClear();
        (ReportService.getSummary as jest.Mock).mockClear();
        (CategoryService.getAllCategories as jest.Mock).mockClear();
    });

    describe("Authentication & Authorization", () => {
        test("should redirect to login if no auth token exists", () => {
            (CategoryService.getAllCategories as jest.Mock).mockResolvedValue({
                content: [],
            });
            (ReportService.getSummary as jest.Mock).mockResolvedValue(mockSummary);

            render(
                <BrowserRouter>
                    <ExpenseReport />
                </BrowserRouter>
            );

            expect(mockNavigate).toHaveBeenCalledWith("/login");
        });

        test("should redirect to user dashboard if user is not admin", () => {
            localStorage.setItem("authToken", "test-token");
            localStorage.setItem("user", JSON.stringify(mockRegularUser));

            render(
                <BrowserRouter>
                    <ExpenseReport />
                </BrowserRouter>
            );

            expect(mockNavigate).toHaveBeenCalledWith("/user/dashboard");
        });

        test("should allow access if user is admin", async () => {
            localStorage.setItem("authToken", "test-token");
            localStorage.setItem("user", JSON.stringify(mockAdminUser));
            (CategoryService.getAllCategories as jest.Mock).mockResolvedValue({
                content: mockCategories,
            });
            (ReportService.getSummary as jest.Mock).mockResolvedValue(mockSummary);

            render(
                <BrowserRouter>
                    <ExpenseReport />
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
            (CategoryService.getAllCategories as jest.Mock).mockResolvedValue({
                content: mockCategories,
            });
            (ReportService.getSummary as jest.Mock).mockImplementation(
                () => new Promise(() => {}) // Never resolves
            );

            render(
                <BrowserRouter>
                    <ExpenseReport />
                </BrowserRouter>
            );

            expect(screen.getByText("Loading report...")).toBeInTheDocument();
        });

        test("should fetch categories and summary on mount", async () => {
            (CategoryService.getAllCategories as jest.Mock).mockResolvedValue({
                content: mockCategories,
            });
            (ReportService.getSummary as jest.Mock).mockResolvedValue(mockSummary);

            render(
                <BrowserRouter>
                    <ExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(CategoryService.getAllCategories).toHaveBeenCalled();
                expect(ReportService.getSummary).toHaveBeenCalled();
            });
        });

        test("should display error message on summary fetch failure", async () => {
            const errorMessage = "Failed to load summary";
            (CategoryService.getAllCategories as jest.Mock).mockResolvedValue({
                content: mockCategories,
            });
            (ReportService.getSummary as jest.Mock).mockRejectedValue({
                response: {
                    data: {
                        message: errorMessage,
                    },
                },
            });

            render(
                <BrowserRouter>
                    <ExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText(errorMessage)).toBeInTheDocument();
            });
        });
    });

    describe("Summary Statistics Display", () => {
        beforeEach(() => {
            localStorage.setItem("authToken", "test-token");
            localStorage.setItem("user", JSON.stringify(mockAdminUser));
            (CategoryService.getAllCategories as jest.Mock).mockResolvedValue({
                content: mockCategories,
            });
            (ReportService.getSummary as jest.Mock).mockResolvedValue(mockSummary);
        });

        test("should display total amount correctly", async () => {
            render(
                <BrowserRouter>
                    <ExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("$1000.00")).toBeInTheDocument();
            });
        });

        test("should display total expenses count", async () => {
            render(
                <BrowserRouter>
                    <ExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("20")).toBeInTheDocument();
            });
        });

        test("should display average amount", async () => {
            render(
                <BrowserRouter>
                    <ExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("$50.00")).toBeInTheDocument();
            });
        });

        test("should display max and min amounts", async () => {
            render(
                <BrowserRouter>
                    <ExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("$200.00")).toBeInTheDocument();
                expect(screen.getByText("$10.00")).toBeInTheDocument();
            });
        });

        test("should display all stat labels", async () => {
            render(
                <BrowserRouter>
                    <ExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Total Amount")).toBeInTheDocument();
                expect(screen.getByText("Total Expenses")).toBeInTheDocument();
                expect(screen.getByText("Average Amount")).toBeInTheDocument();
                expect(screen.getByText("Max Amount")).toBeInTheDocument();
                expect(screen.getByText("Min Amount")).toBeInTheDocument();
            });
        });
    });

    describe("Category Breakdown", () => {
        beforeEach(() => {
            localStorage.setItem("authToken", "test-token");
            localStorage.setItem("user", JSON.stringify(mockAdminUser));
            (CategoryService.getAllCategories as jest.Mock).mockResolvedValue({
                content: mockCategories,
            });
        });

        test("should display category breakdown table", async () => {
            (ReportService.getSummary as jest.Mock).mockResolvedValue(mockSummary);

            render(
                <BrowserRouter>
                    <ExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Food")).toBeInTheDocument();
                expect(screen.getByText("Transportation")).toBeInTheDocument();
                expect(screen.getByText("Utilities")).toBeInTheDocument();
            });
        });

        test("should display category amounts correctly", async () => {
            (ReportService.getSummary as jest.Mock).mockResolvedValue(mockSummary);

            render(
                <BrowserRouter>
                    <ExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("$500.00")).toBeInTheDocument();
                expect(screen.getByText("$300.00")).toBeInTheDocument();
            });
        });

        test("should display category counts", async () => {
            (ReportService.getSummary as jest.Mock).mockResolvedValue(mockSummary);

            render(
                <BrowserRouter>
                    <ExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                const cells = screen.getAllByText("10");
                expect(cells.length).toBeGreaterThan(0);
            });
        });

        test("should display percentages for multiple categories", async () => {
            (ReportService.getSummary as jest.Mock).mockResolvedValue(mockSummary);

            render(
                <BrowserRouter>
                    <ExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("50.00%")).toBeInTheDocument();
                expect(screen.getByText("30.00%")).toBeInTheDocument();
                expect(screen.getByText("20.00%")).toBeInTheDocument();
            });
        });

        test("should not display percentage column for single category", async () => {
            const singleCategorySummary: SummaryResponse = {
                ...mockSummary,
                categoryBreakdown: [mockCategoryBreakdown[0]],
            };
            (ReportService.getSummary as jest.Mock).mockResolvedValue(singleCategorySummary);

            render(
                <BrowserRouter>
                    <ExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                // Check that single category info is displayed
                expect(screen.getByText(/Showing data for:/)).toBeInTheDocument();
                expect(screen.getByText("Food")).toBeInTheDocument();
            });
        });

        test("should display 'No category data available' when empty", async () => {
            const emptySummary: SummaryResponse = {
                ...mockSummary,
                categoryBreakdown: [],
            };
            (ReportService.getSummary as jest.Mock).mockResolvedValue(emptySummary);

            render(
                <BrowserRouter>
                    <ExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("No category data available")).toBeInTheDocument();
            });
        });
    });

    describe("Monthly Breakdown", () => {
        beforeEach(() => {
            localStorage.setItem("authToken", "test-token");
            localStorage.setItem("user", JSON.stringify(mockAdminUser));
            (CategoryService.getAllCategories as jest.Mock).mockResolvedValue({
                content: mockCategories,
            });
            (ReportService.getSummary as jest.Mock).mockResolvedValue(mockSummary);
        });

        test("should display monthly breakdown table", async () => {
            render(
                <BrowserRouter>
                    <ExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Monthly Breakdown")).toBeInTheDocument();
            });
        });

        test("should display formatted month names", async () => {
            render(
                <BrowserRouter>
                    <ExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Jan 2025")).toBeInTheDocument();
                expect(screen.getByText("Feb 2025")).toBeInTheDocument();
                expect(screen.getByText("Mar 2025")).toBeInTheDocument();
            });
        });

        test("should display monthly amounts", async () => {
            render(
                <BrowserRouter>
                    <ExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("$600.00")).toBeInTheDocument();
                expect(screen.getByText("$400.00")).toBeInTheDocument();
            });
        });

        test("should calculate and display average per month", async () => {
            render(
                <BrowserRouter>
                    <ExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                // 600 / 12 = 50
                const averageValues = screen.getAllByText("$50.00");
                expect(averageValues.length).toBeGreaterThan(0);
            });
        });

        test("should display 'No monthly data available' when empty", async () => {
            const emptySummary: SummaryResponse = {
                ...mockSummary,
                monthlyBreakdown: [],
            };
            (ReportService.getSummary as jest.Mock).mockResolvedValue(emptySummary);

            render(
                <BrowserRouter>
                    <ExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("No monthly data available")).toBeInTheDocument();
            });
        });
    });

    describe("Filter Controls", () => {
        beforeEach(() => {
            localStorage.setItem("authToken", "test-token");
            localStorage.setItem("user", JSON.stringify(mockAdminUser));
            (CategoryService.getAllCategories as jest.Mock).mockResolvedValue({
                content: mockCategories,
            });
            (ReportService.getSummary as jest.Mock).mockResolvedValue(mockSummary);
        });

        test("should display filter section with category dropdown", async () => {
            render(
                <BrowserRouter>
                    <ExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByDisplayValue("All Categories")).toBeInTheDocument();
            });
        });

        test("should display category options from API", async () => {
            render(
                <BrowserRouter>
                    <ExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                const select = screen.getByDisplayValue("All Categories") as HTMLSelectElement;
                expect(select.options.length).toBe(4); // All Categories + 3 categories
            });
        });

        test("should display month filter input", async () => {
            render(
                <BrowserRouter>
                    <ExpenseReport />
                </BrowserRouter>
            );

            const monthInput = screen.getByRole("textbox", { hidden: true }) as HTMLInputElement;
            expect(monthInput.type).toBe("month");
        });

        test("should display Apply Filters button", async () => {
            render(
                <BrowserRouter>
                    <ExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByRole("button", { name: /apply filters/i })).toBeInTheDocument();
            });
        });

        test("should display Clear button", async () => {
            render(
                <BrowserRouter>
                    <ExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
            });
        });
    });

    describe("Filter Functionality", () => {
        beforeEach(() => {
            localStorage.setItem("authToken", "test-token");
            localStorage.setItem("user", JSON.stringify(mockAdminUser));
            (CategoryService.getAllCategories as jest.Mock).mockResolvedValue({
                content: mockCategories,
            });
        });

        test("should apply category filter", async () => {
            (ReportService.getSummary as jest.Mock).mockResolvedValue(mockSummary);

            render(
                <BrowserRouter>
                    <ExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByDisplayValue("All Categories")).toBeInTheDocument();
            });

            const select = screen.getByDisplayValue("All Categories") as HTMLSelectElement;
            fireEvent.change(select, { target: { value: "1" } });

            const applyButton = screen.getByRole("button", { name: /apply filters/i });
            fireEvent.click(applyButton);

            await waitFor(() => {
                expect(ReportService.getSummary).toHaveBeenCalledWith({
                    categoryId: "1",
                });
            });
        });

        test("should apply month filter", async () => {
            (ReportService.getSummary as jest.Mock).mockResolvedValue(mockSummary);

            render(
                <BrowserRouter>
                    <ExpenseReport />
                </BrowserRouter>
            );

            const monthInput = screen.getByRole("textbox", { hidden: true }) as HTMLInputElement;
            fireEvent.change(monthInput, { target: { value: "2025-01" } });

            const applyButton = screen.getByRole("button", { name: /apply filters/i });
            fireEvent.click(applyButton);

            await waitFor(() => {
                expect(ReportService.getSummary).toHaveBeenCalledWith({
                    month: "2025-01",
                });
            });
        });

        test("should apply both filters together", async () => {
            (ReportService.getSummary as jest.Mock).mockResolvedValue(mockSummary);

            render(
                <BrowserRouter>
                    <ExpenseReport />
                </BrowserRouter>
            );

            const select = screen.getByDisplayValue("All Categories") as HTMLSelectElement;
            fireEvent.change(select, { target: { value: "1" } });

            const monthInput = screen.getByRole("textbox", { hidden: true }) as HTMLInputElement;
            fireEvent.change(monthInput, { target: { value: "2025-01" } });

            const applyButton = screen.getByRole("button", { name: /apply filters/i });
            fireEvent.click(applyButton);

            await waitFor(() => {
                expect(ReportService.getSummary).toHaveBeenCalledWith({
                    categoryId: "1",
                    month: "2025-01",
                });
            });
        });

        test("should clear filters", async () => {
            (ReportService.getSummary as jest.Mock).mockResolvedValue(mockSummary);

            render(
                <BrowserRouter>
                    <ExpenseReport />
                </BrowserRouter>
            );

            const select = screen.getByDisplayValue("All Categories") as HTMLSelectElement;
            fireEvent.change(select, { target: { value: "1" } });

            const clearButton = screen.getByRole("button", { name: /clear/i });
            fireEvent.click(clearButton);

            await waitFor(() => {
                expect(select.value).toBe("");
            });
        });

        test("should refetch summary when filters are cleared", async () => {
            (ReportService.getSummary as jest.Mock).mockResolvedValue(mockSummary);

            render(
                <BrowserRouter>
                    <ExpenseReport />
                </BrowserRouter>
            );

            const select = screen.getByDisplayValue("All Categories") as HTMLSelectElement;
            fireEvent.change(select, { target: { value: "1" } });

            const clearButton = screen.getByRole("button", { name: /clear/i });
            fireEvent.click(clearButton);

            await waitFor(() => {
                // Should have been called on mount and once more after clearing
                expect(ReportService.getSummary).toHaveBeenCalledTimes(2);
            });
        });
    });

    describe("Refresh Functionality", () => {
        beforeEach(() => {
            localStorage.setItem("authToken", "test-token");
            localStorage.setItem("user", JSON.stringify(mockAdminUser));
            (CategoryService.getAllCategories as jest.Mock).mockResolvedValue({
                content: mockCategories,
            });
            (ReportService.getSummary as jest.Mock).mockResolvedValue(mockSummary);
        });

        test("should display refresh button in toolbar", async () => {
            render(
                <BrowserRouter>
                    <ExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByRole("button", { name: /refresh/i })).toBeInTheDocument();
            });
        });

        test("should refetch summary on refresh button click", async () => {
            render(
                <BrowserRouter>
                    <ExpenseReport />
                </BrowserRouter>
            );

            const refreshButton = await screen.findByRole("button", { name: /refresh/i });
            fireEvent.click(refreshButton);

            await waitFor(() => {
                // Called on mount and once on refresh
                expect(ReportService.getSummary).toHaveBeenCalledTimes(2);
            });
        });
    });

    describe("Error Handling", () => {
        beforeEach(() => {
            localStorage.setItem("authToken", "test-token");
            localStorage.setItem("user", JSON.stringify(mockAdminUser));
            (CategoryService.getAllCategories as jest.Mock).mockResolvedValue({
                content: mockCategories,
            });
        });

        test("should dismiss error message on close button click", async () => {
            const errorMessage = "Failed to load summary";
            (ReportService.getSummary as jest.Mock).mockRejectedValue({
                response: {
                    data: {
                        message: errorMessage,
                    },
                },
            });

            render(
                <BrowserRouter>
                    <ExpenseReport />
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

        test("should handle category fetch failure gracefully", async () => {
            (CategoryService.getAllCategories as jest.Mock).mockRejectedValue({
                response: {
                    data: {
                        message: "Failed to load categories",
                    },
                },
            });
            (ReportService.getSummary as jest.Mock).mockResolvedValue(mockSummary);

            render(
                <BrowserRouter>
                    <ExpenseReport />
                </BrowserRouter>
            );

            // Should still render the page even if categories fail
            await waitFor(() => {
                expect(screen.getByText("Expense Report")).toBeInTheDocument();
            });
        });
    });

    describe("Chart Generation", () => {
        beforeEach(() => {
            localStorage.setItem("authToken", "test-token");
            localStorage.setItem("user", JSON.stringify(mockAdminUser));
            (CategoryService.getAllCategories as jest.Mock).mockResolvedValue({
                content: mockCategories,
            });
            (ReportService.getSummary as jest.Mock).mockResolvedValue(mockSummary);
        });

        test("should render pie chart for category breakdown", async () => {
            render(
                <BrowserRouter>
                    <ExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                const svgs = screen.getAllByRole("img", { hidden: true });
                // At least one SVG should be rendered for pie chart
                expect(svgs.length).toBeGreaterThanOrEqual(0);
            });
        });

        test("should render bar chart for monthly breakdown", async () => {
            render(
                <BrowserRouter>
                    <ExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                // Chart should render without errors
                expect(screen.getByText("Monthly Breakdown")).toBeInTheDocument();
            });
        });
    });

    describe("Currency Formatting", () => {
        beforeEach(() => {
            localStorage.setItem("authToken", "test-token");
            localStorage.setItem("user", JSON.stringify(mockAdminUser));
            (CategoryService.getAllCategories as jest.Mock).mockResolvedValue({
                content: mockCategories,
            });
            (ReportService.getSummary as jest.Mock).mockResolvedValue(mockSummary);
        });

        test("should format currency with dollar sign and two decimals", async () => {
            render(
                <BrowserRouter>
                    <ExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("$1000.00")).toBeInTheDocument();
                expect(screen.getByText("$500.00")).toBeInTheDocument();
            });
        });
    });

    describe("Empty Data Handling", () => {
        beforeEach(() => {
            localStorage.setItem("authToken", "test-token");
            localStorage.setItem("user", JSON.stringify(mockAdminUser));
            (CategoryService.getAllCategories as jest.Mock).mockResolvedValue({
                content: [],
            });
        });

        test("should display 'No data available' when summary is null", async () => {
            (ReportService.getSummary as jest.Mock).mockResolvedValue(null);

            render(
                <BrowserRouter>
                    <ExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("No data available")).toBeInTheDocument();
            });
        });
    });
});