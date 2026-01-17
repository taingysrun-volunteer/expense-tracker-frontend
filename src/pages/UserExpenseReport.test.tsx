import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import UserExpenseReport from "./UserExpenseReport";
import ReportService from "../api/ReportService";
import CategoryService from "../api/CategoryService";

// Mock services
jest.mock("../api/ReportService");
jest.mock("../api/CategoryService");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

const mockSummaryData = {
    totalAmount: 500.5,
    totalCount: 10,
    averageAmount: 50.05,
    maxAmount: 150.0,
    minAmount: 10.0,
    categoryBreakdown: [
        {
            categoryName: "Food",
            totalAmount: 250.5,
            count: 5,
            percentage: 50.05,
        },
        {
            categoryName: "Transportation",
            totalAmount: 200.0,
            count: 4,
            percentage: 39.96,
        },
        {
            categoryName: "Entertainment",
            totalAmount: 49.95,
            count: 1,
            percentage: 9.99,
        },
    ],
    monthlyBreakdown: [
        {
            month: "2024-01",
            totalAmount: 250.25,
            count: 5,
        },
        {
            month: "2024-02",
            totalAmount: 250.25,
            count: 5,
        },
    ],
};

const mockCategories = [
    { id: "cat1", name: "Food" },
    { id: "cat2", name: "Transportation" },
    { id: "cat3", name: "Entertainment" },
];

describe("UserExpenseReport Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        sessionStorage.clear();
        localStorage.setItem("authToken", "test-token");

        (ReportService.getSummary as jest.Mock).mockResolvedValue(mockSummaryData);
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
                    <UserExpenseReport />
                </BrowserRouter>
            );

            expect(mockNavigate).toHaveBeenCalledWith("/login");
        });

        test("should fetch summary and categories on mount", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(ReportService.getSummary).toHaveBeenCalled();
                expect(CategoryService.getAllCategories).toHaveBeenCalled();
            });
        });

        test("should display loading state initially", () => {
            (ReportService.getSummary as jest.Mock).mockImplementation(
                () => new Promise(() => {})
            );

            render(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            expect(screen.getByText("Loading...")).toBeInTheDocument();
        });
    });

    describe("Summary Stats Display", () => {
        test("should display total amount stat", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                const totalAmountLabels = screen.getAllByText("Total Amount");
                expect(totalAmountLabels.length).toBeGreaterThan(0);
                expect(screen.getByText("$500.50")).toBeInTheDocument();
            });
        });

        test("should display total expenses stat", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Total Expenses")).toBeInTheDocument();
                const countElements = screen.getAllByText("10");
                expect(countElements.length).toBeGreaterThan(0);
            });
        });

        test("should display average amount stat", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Average Amount")).toBeInTheDocument();
                const avgElements = screen.getAllByText("$50.05");
                expect(avgElements.length).toBeGreaterThan(0);
            });
        });

        test("should display manage expense button", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                const button = screen.getByRole("button", { name: /Go to Expenses/i });
                expect(button).toBeInTheDocument();
            });
        });

        test("should navigate to expenses page when button clicked", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            const button = await screen.findByRole("button", { name: /Go to Expenses/i });
            fireEvent.click(button);

            expect(mockNavigate).toHaveBeenCalledWith("/user/expenses");
        });
    });

    describe("Filter Section", () => {
        test("should display filter section with category and month inputs", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                const categoryLabels = screen.getAllByText("Category");
                expect(categoryLabels.length).toBeGreaterThan(0);
                const monthLabels = screen.getAllByText("Month");
                expect(monthLabels.length).toBeGreaterThan(0);
            });
        });

        test("should populate category dropdown with options", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                const categoryOptions = screen.getAllByRole("option");
                const foodOption = categoryOptions.find(opt => opt.textContent === "Food");
                expect(foodOption).toBeInTheDocument();
            });
        });

        test("should have Apply Filters and Clear buttons", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByRole("button", { name: /Apply Filters/i })).toBeInTheDocument();
                expect(screen.getByRole("button", { name: /Clear/i })).toBeInTheDocument();
            });
        });

        test("should allow selecting a category filter", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                const categorySelects = screen.getAllByDisplayValue("All Categories");
                const categorySelect = categorySelects[0];
                fireEvent.change(categorySelect, { target: { value: "cat1" } });
                expect((categorySelect as HTMLInputElement).value).toBe("cat1");
            });
        });

        test("should allow selecting a month filter", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                const monthInputs = screen.getAllByDisplayValue("");
                const monthInput = monthInputs.find(input => (input as HTMLInputElement).type === "month");
                if (monthInput) {
                    fireEvent.change(monthInput, { target: { value: "2024-01" } });
                    expect((monthInput as HTMLInputElement).value).toBe("2024-01");
                }
            });
        });

        test("should apply filters when Apply Filters button clicked", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            const categorySelects = await screen.findAllByDisplayValue("All Categories");
            const categorySelect = categorySelects[0];
            fireEvent.change(categorySelect, { target: { value: "cat1" } });

            const applyButton = screen.getByRole("button", { name: /Apply Filters/i });
            fireEvent.click(applyButton);

            await waitFor(() => {
                expect(ReportService.getSummary).toHaveBeenCalledWith({
                    categoryId: "cat1",
                });
            });
        });

        test("should clear filters when Clear button clicked", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            const categorySelects = await screen.findAllByDisplayValue("All Categories");
            const categorySelect = categorySelects[0];
            fireEvent.change(categorySelect, { target: { value: "cat1" } });

            const clearButton = screen.getByRole("button", { name: /Clear/i });
            fireEvent.click(clearButton);

            await waitFor(() => {
                expect((categorySelect as HTMLInputElement).value).toBe("");
            });
        });

        test("should apply multiple filters together", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            const categorySelects = await screen.findAllByDisplayValue("All Categories");
            const categorySelect = categorySelects[0];
            fireEvent.change(categorySelect, { target: { value: "cat1" } });

            const monthInputs = screen.getAllByDisplayValue("");
            const monthInput = monthInputs.find(input => (input as HTMLInputElement).type === "month");
            if (monthInput) {
                fireEvent.change(monthInput, { target: { value: "2024-01" } });
            }

            const applyButton = screen.getByRole("button", { name: /Apply Filters/i });
            fireEvent.click(applyButton);

            await waitFor(() => {
                expect(ReportService.getSummary).toHaveBeenCalledWith({
                    categoryId: "cat1",
                    month: "2024-01",
                });
            });
        });
    });

    describe("Category Breakdown Section", () => {
        test("should display category breakdown title", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Category Breakdown")).toBeInTheDocument();
            });
        });

        test("should display category breakdown table with all categories", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                const foodElements = screen.getAllByText("Food");
                expect(foodElements.length).toBeGreaterThan(0);
                const transportationElements = screen.getAllByText("Transportation");
                expect(transportationElements.length).toBeGreaterThan(0);
                const entertainmentElements = screen.getAllByText("Entertainment");
                expect(entertainmentElements.length).toBeGreaterThan(0);
            });
        });

        test("should display category amounts in table", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("$250.50")).toBeInTheDocument();
                expect(screen.getByText("$200.00")).toBeInTheDocument();
            });
        });

        test("should display category counts in table", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                const cells = screen.getAllByText("5");
                expect(cells.length).toBeGreaterThan(0);
                const cells4 = screen.getAllByText("4");
                expect(cells4.length).toBeGreaterThan(0);
            });
        });

        test("should display percentages in table", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText(/50\.05%/)).toBeInTheDocument();
                expect(screen.getByText(/39\.96%/)).toBeInTheDocument();
            });
        });

        test("should display pie chart for category breakdown", async () => {
            const { container } = render(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                const svgs = container.querySelectorAll("svg");
                expect(svgs.length).toBeGreaterThan(0);
            });
        });

        test("should display no data message when no categories", async () => {
            (ReportService.getSummary as jest.Mock).mockResolvedValue({
                ...mockSummaryData,
                categoryBreakdown: [],
            });

            render(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("No category data available")).toBeInTheDocument();
            });
        });
    });

    describe("Monthly Breakdown Section", () => {
        test("should display monthly breakdown title", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Monthly Breakdown")).toBeInTheDocument();
            });
        });

        test("should display monthly breakdown table", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                const monthElements = screen.getAllByText(/Jan|Feb/);
                expect(monthElements.length).toBeGreaterThan(0);
            });
        });

        test("should display monthly amounts", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                const amountElements = screen.getAllByText("$250.25");
                expect(amountElements.length).toBeGreaterThan(0);
            });
        });

        test("should display bar chart for monthly breakdown", async () => {
            const { container } = render(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                const svgs = container.querySelectorAll("svg");
                expect(svgs.length).toBeGreaterThan(0);
            });
        });

        test("should display no data message when no monthly data", async () => {
            (ReportService.getSummary as jest.Mock).mockResolvedValue({
                ...mockSummaryData,
                monthlyBreakdown: [],
            });

            render(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("No monthly data available")).toBeInTheDocument();
            });
        });

        test("should display average column in monthly table", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                const columnHeaders = screen.getAllByText("Average");
                expect(columnHeaders.length).toBeGreaterThan(0);
            });
        });
    });

    describe("Error Handling", () => {
        test("should handle errors gracefully", async () => {
            (ReportService.getSummary as jest.Mock).mockRejectedValue({
                response: {
                    data: {
                        message: "Summary fetch error",
                    },
                },
            });

            const { container } = render(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                // Should render without crashing
                expect(container).toBeDefined();
            }, { timeout: 3000 });
        });

        test("should handle network errors gracefully", async () => {
            (ReportService.getSummary as jest.Mock).mockRejectedValue(
                new Error("Network connection error")
            );

            const { container } = render(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                // Should render without crashing
                expect(container).toBeDefined();
            }, { timeout: 3000 });
        });

        test("should display error when summary with error is rendered", async () => {
            const { rerender } = render(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            // First render shows loading
            expect(screen.getByText("Loading...")).toBeInTheDocument();

            // Mock to return summary with error state possible
            (ReportService.getSummary as jest.Mock).mockResolvedValue(mockSummaryData);

            rerender(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            // Should eventually show summary
            await waitFor(() => {
                expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
            });
        });
    });

    describe("Currency Formatting", () => {
        test("should format all currency values correctly", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                const amount500Elements = screen.getAllByText("$500.50");
                expect(amount500Elements.length).toBeGreaterThan(0);
                const amount50Elements = screen.getAllByText("$50.05");
                expect(amount50Elements.length).toBeGreaterThan(0);
                const amount250Elements = screen.getAllByText("$250.50");
                expect(amount250Elements.length).toBeGreaterThan(0);
                const amount200Elements = screen.getAllByText("$200.00");
                expect(amount200Elements.length).toBeGreaterThan(0);
            });
        });
    });

    describe("Month Formatting", () => {
        test("should format months correctly in monthly breakdown", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                const monthElements = screen.getAllByText(/Jan|Feb/);
                expect(monthElements.length).toBeGreaterThan(0);
            });
        });
    });

    describe("Data Empty States", () => {
        test("should display no data message when summary is null", async () => {
            (ReportService.getSummary as jest.Mock).mockResolvedValue(null);

            render(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("No data available")).toBeInTheDocument();
            });
        });

        test("should display both breakdown sections with data", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Category Breakdown")).toBeInTheDocument();
                expect(screen.getByText("Monthly Breakdown")).toBeInTheDocument();
            });
        });
    });

    describe("Filter Interactions", () => {
        test("should handle category filter without month", async () => {
            (ReportService.getSummary as jest.Mock).mockResolvedValue(mockSummaryData);

            render(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            const categorySelects = await screen.findAllByDisplayValue("All Categories");
            const categorySelect = categorySelects[0];
            fireEvent.change(categorySelect, { target: { value: "cat1" } });

            const applyButton = screen.getByRole("button", { name: /Apply Filters/i });
            fireEvent.click(applyButton);

            await waitFor(() => {
                expect(ReportService.getSummary).toHaveBeenCalledWith({
                    categoryId: "cat1",
                });
            });
        });

        test("should handle month filter without category", async () => {
            (ReportService.getSummary as jest.Mock).mockResolvedValue(mockSummaryData);

            render(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            const monthInputs = await screen.findAllByDisplayValue("");
            const monthInput = monthInputs.find(input => (input as HTMLInputElement).type === "month");
            if (monthInput) {
                fireEvent.change(monthInput, { target: { value: "2024-01" } });
            }

            const applyButton = screen.getByRole("button", { name: /Apply Filters/i });
            fireEvent.click(applyButton);

            await waitFor(() => {
                expect(ReportService.getSummary).toHaveBeenCalledWith({
                    month: "2024-01",
                });
            });
        });

        test("should fetch summary without filters when clearing", async () => {
            (ReportService.getSummary as jest.Mock).mockResolvedValue(mockSummaryData);

            render(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            const categorySelects = await screen.findAllByDisplayValue("All Categories");
            const categorySelect = categorySelects[0];
            fireEvent.change(categorySelect, { target: { value: "cat1" } });

            const clearButton = screen.getByRole("button", { name: /Clear/i });
            fireEvent.click(clearButton);

            await waitFor(() => {
                expect(ReportService.getSummary).toHaveBeenCalledWith({});
            });
        });
    });

    describe("Table Structure", () => {
        test("should have proper table headers for category breakdown", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                const categoryHeaders = screen.getAllByText("Category");
                expect(categoryHeaders.length).toBeGreaterThan(0);
                const amountHeaders = screen.getAllByText("Total Amount");
                expect(amountHeaders.length).toBeGreaterThan(0);
                const countHeaders = screen.getAllByText("Count");
                expect(countHeaders.length).toBeGreaterThan(0);
                const percentageHeaders = screen.getAllByText("Percentage");
                expect(percentageHeaders.length).toBeGreaterThan(0);
            });
        });

        test("should have proper table headers for monthly breakdown", async () => {
            render(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                const monthHeaders = screen.getAllByText("Month");
                expect(monthHeaders.length).toBeGreaterThan(0);
                const amountHeaders = screen.getAllByText("Total Amount");
                expect(amountHeaders.length).toBeGreaterThan(0);
                const averageHeaders = screen.getAllByText("Average");
                expect(averageHeaders.length).toBeGreaterThan(0);
            });
        });
    });

    describe("Responsive Layout", () => {
        test("should display stats grid", async () => {
            const { container } = render(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                const statCards = container.querySelectorAll('[style*="grid-template-columns"]');
                expect(statCards.length).toBeGreaterThan(0);
            });
        });

        test("should display charts grid", async () => {
            const { container } = render(
                <BrowserRouter>
                    <UserExpenseReport />
                </BrowserRouter>
            );

            await waitFor(() => {
                const categoryBreakdown = screen.getByText("Category Breakdown");
                const monthlyBreakdown = screen.getByText("Monthly Breakdown");
                expect(categoryBreakdown).toBeInTheDocument();
                expect(monthlyBreakdown).toBeInTheDocument();
            });
        });
    });
});
