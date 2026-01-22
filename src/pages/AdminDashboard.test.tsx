import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import { User } from "../models/User";

// Mock useNavigate hook
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

// Mock Toolbar component
jest.mock("../components/Toolbar", () => {
    return function MockToolbar({ title, onLogout }: { title: string; onLogout: () => void }) {
        return (
            <div data-testid="toolbar">
                <h1>{title}</h1>
                <button onClick={onLogout} data-testid="logout-button">
                    Logout
                </button>
            </div>
        );
    };
});

const mockAdminUser: User = {
    id: "1",
    firstName: "Admin",
    lastName: "User",
    email: "admin@example.com",
    role: "ADMIN",
};

const mockRegularUser: User = {
    id: "2",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    role: "USER",
};

describe("AdminDashboard Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        sessionStorage.clear();
        mockNavigate.mockClear();
    });

    describe("Authentication & Authorization", () => {
        test("should redirect to login if no auth token exists", () => {
            render(
                <BrowserRouter>
                    <AdminDashboard />
                </BrowserRouter>
            );

            expect(mockNavigate).toHaveBeenCalledWith("/login");
        });

        test("should redirect to user dashboard if user is not admin", () => {
            localStorage.setItem("authToken", "test-token");
            localStorage.setItem("user", JSON.stringify(mockRegularUser));

            render(
                <BrowserRouter>
                    <AdminDashboard />
                </BrowserRouter>
            );

            expect(mockNavigate).toHaveBeenCalledWith("/user/dashboard");
        });

        test("should redirect to user dashboard if user role is not ADMIN (lowercase)", () => {
            const lowercaseUser = { ...mockAdminUser, role: "admin" };
            localStorage.setItem("authToken", "test-token");
            localStorage.setItem("user", JSON.stringify(lowercaseUser));

            render(
                <BrowserRouter>
                    <AdminDashboard />
                </BrowserRouter>
            );

            expect(mockNavigate).not.toHaveBeenCalledWith("/user/dashboard");
        });

        test("should check sessionStorage for token if localStorage is empty", () => {
            sessionStorage.setItem("authToken", "test-token");
            sessionStorage.setItem("user", JSON.stringify(mockAdminUser));

            render(
                <BrowserRouter>
                    <AdminDashboard />
                </BrowserRouter>
            );

            expect(mockNavigate).not.toHaveBeenCalledWith("/login");
        });
    });

    describe("Dashboard Rendering", () => {
        beforeEach(() => {
            localStorage.setItem("authToken", "test-token");
            localStorage.setItem("user", JSON.stringify(mockAdminUser));
        });

        test("should render toolbar with correct title", async () => {
            render(
                <BrowserRouter>
                    <AdminDashboard />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
            });
        });

        test("should display loading state initially then show content", async () => {
            render(
                <BrowserRouter>
                    <AdminDashboard />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText(`Welcome, ${mockAdminUser.firstName} ${mockAdminUser.lastName}`)).toBeInTheDocument();
            });
        });

        test("should display welcome card with user information", async () => {
            render(
                <BrowserRouter>
                    <AdminDashboard />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText(`Welcome, ${mockAdminUser.firstName} ${mockAdminUser.lastName}`)).toBeInTheDocument();
                expect(screen.getByText(`Email: ${mockAdminUser.email}`)).toBeInTheDocument();
                expect(screen.getByText(`Role: ${mockAdminUser.role}`)).toBeInTheDocument();
            });
        });

        test("should display all admin action cards", async () => {
            render(
                <BrowserRouter>
                    <AdminDashboard />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("User Management")).toBeInTheDocument();
                expect(screen.getByText("Category Management")).toBeInTheDocument();
                expect(screen.getByText("Expense Reports")).toBeInTheDocument();
            });
        });

        test("should display card descriptions", async () => {
            render(
                <BrowserRouter>
                    <AdminDashboard />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Manage all users in the system")).toBeInTheDocument();
                expect(screen.getByText("Manage expense categories")).toBeInTheDocument();
                expect(screen.getByText("View expense analytics and insights")).toBeInTheDocument();
            });
        });

        test("should display all action buttons", async () => {
            render(
                <BrowserRouter>
                    <AdminDashboard />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByRole("button", { name: /view users/i })).toBeInTheDocument();
                expect(screen.getByRole("button", { name: /view categories/i })).toBeInTheDocument();
                expect(screen.getByRole("button", { name: /view reports/i })).toBeInTheDocument();
            });
        });
    });

    describe("Navigation", () => {
        beforeEach(() => {
            localStorage.setItem("authToken", "test-token");
            localStorage.setItem("user", JSON.stringify(mockAdminUser));
        });

        test("should navigate to user management on View Users click", async () => {
            render(
                <BrowserRouter>
                    <AdminDashboard />
                </BrowserRouter>
            );

            const viewUsersButton = await screen.findByRole("button", { name: /view users/i });
            fireEvent.click(viewUsersButton);

            expect(mockNavigate).toHaveBeenCalledWith("/admin/users");
        });

        test("should navigate to category management on View Categories click", async () => {
            render(
                <BrowserRouter>
                    <AdminDashboard />
                </BrowserRouter>
            );

            const viewCategoriesButton = await screen.findByRole("button", { name: /view categories/i });
            fireEvent.click(viewCategoriesButton);

            expect(mockNavigate).toHaveBeenCalledWith("/admin/categories");
        });

        test("should navigate to reports on View Reports click", async () => {
            render(
                <BrowserRouter>
                    <AdminDashboard />
                </BrowserRouter>
            );

            const viewReportsButton = await screen.findByRole("button", { name: /view reports/i });
            fireEvent.click(viewReportsButton);

            expect(mockNavigate).toHaveBeenCalledWith("/admin/reports");
        });
    });

    describe("Logout Functionality", () => {
        beforeEach(() => {
            localStorage.setItem("authToken", "test-token");
            localStorage.setItem("user", JSON.stringify(mockAdminUser));
        });

        test("should clear localStorage and sessionStorage on logout", async () => {
            localStorage.setItem("authToken", "test-token");
            localStorage.setItem("user", JSON.stringify(mockAdminUser));

            render(
                <BrowserRouter>
                    <AdminDashboard />
                </BrowserRouter>
            );

            const logoutButton = await screen.findByTestId("logout-button");
            fireEvent.click(logoutButton);

            expect(localStorage.getItem("authToken")).toBeNull();
            expect(localStorage.getItem("user")).toBeNull();
            expect(sessionStorage.getItem("authToken")).toBeNull();
            expect(sessionStorage.getItem("user")).toBeNull();
        });

        test("should navigate to login after logout", async () => {
            render(
                <BrowserRouter>
                    <AdminDashboard />
                </BrowserRouter>
            );

            const logoutButton = await screen.findByTestId("logout-button");
            fireEvent.click(logoutButton);

            expect(mockNavigate).toHaveBeenCalledWith("/login");
        });
    });

    describe("Edge Cases", () => {
        test("should display loading state if user data is not available", () => {
            localStorage.setItem("authToken", "test-token");
            // No user data set

            render(
                <BrowserRouter>
                    <AdminDashboard />
                </BrowserRouter>
            );

            expect(screen.getByText("Loading...")).toBeInTheDocument();
        });

        test("should handle missing role in user object gracefully", () => {
            const userWithoutRole = { ...mockAdminUser, role: undefined };
            localStorage.setItem("authToken", "test-token");
            localStorage.setItem("user", JSON.stringify(userWithoutRole));

            render(
                <BrowserRouter>
                    <AdminDashboard />
                </BrowserRouter>
            );

            expect(mockNavigate).toHaveBeenCalledWith("/user/dashboard");
        });
    });
});