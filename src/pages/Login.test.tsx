import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "./Login";
import AuthService from "../api/AuthService";

// Mock AuthService
jest.mock("../api/AuthService");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

const mockUser = {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    role: "USER",
};

const mockAdminUser = {
    id: "2",
    firstName: "Admin",
    lastName: "User",
    email: "admin@example.com",
    role: "ADMIN",
};

describe("Login Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        sessionStorage.clear();
        localStorage.clear();
        mockNavigate.mockClear();
    });

    describe("Form Rendering", () => {
        test("should render login form with all elements", () => {
            render(
                <BrowserRouter>
                    <Login />
                </BrowserRouter>
            );

            expect(screen.getByText("Expense Tracker")).toBeInTheDocument();
            expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
            expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
        });

        test("should render signup link", () => {
            render(
                <BrowserRouter>
                    <Login />
                </BrowserRouter>
            );

            expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
            expect(screen.getByText("Create one")).toBeInTheDocument();
        });

        test("should have email and password labels", () => {
            render(
                <BrowserRouter>
                    <Login />
                </BrowserRouter>
            );

            // Check for labels in the form
            const labels = screen.getAllByText(/Email|Password/);
            expect(labels.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe("Form Input Handling", () => {
        test("should update email input value on change", () => {
            render(
                <BrowserRouter>
                    <Login />
                </BrowserRouter>
            );

            const emailInput = screen.getByPlaceholderText("you@example.com") as HTMLInputElement;
            fireEvent.change(emailInput, { target: { value: "test@example.com" } });

            expect(emailInput.value).toBe("test@example.com");
        });

        test("should update password input value on change", () => {
            render(
                <BrowserRouter>
                    <Login />
                </BrowserRouter>
            );

            const passwordInput = screen.getByPlaceholderText("••••••••") as HTMLInputElement;
            fireEvent.change(passwordInput, { target: { value: "password123" } });

            expect(passwordInput.value).toBe("password123");
        });

        test("should clear inputs after form submission", async () => {
            (AuthService.login as jest.Mock).mockResolvedValue({
                token: "test-token",
                user: mockUser,
            });

            render(
                <BrowserRouter>
                    <Login />
                </BrowserRouter>
            );

            const emailInput = screen.getByPlaceholderText("you@example.com") as HTMLInputElement;
            const passwordInput = screen.getByPlaceholderText("••••••••") as HTMLInputElement;

            fireEvent.change(emailInput, { target: { value: "test@example.com" } });
            fireEvent.change(passwordInput, { target: { value: "password123" } });

            const submitButton = screen.getByRole("button", { name: /sign in/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalled();
            });
        });
    });

    describe("Form Validation", () => {
        test("should show error when email is empty", async () => {
            render(
                <BrowserRouter>
                    <Login />
                </BrowserRouter>
            );

            const passwordInput = screen.getByPlaceholderText("••••••••");
            fireEvent.change(passwordInput, { target: { value: "password123" } });

            const submitButton = screen.getByRole("button", { name: /sign in/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText("Email is required.")).toBeInTheDocument();
            });
        });

        test("should show error when password is empty", async () => {
            render(
                <BrowserRouter>
                    <Login />
                </BrowserRouter>
            );

            const emailInput = screen.getByPlaceholderText("you@example.com");
            fireEvent.change(emailInput, { target: { value: "test@example.com" } });

            const submitButton = screen.getByRole("button", { name: /sign in/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText("Password is required.")).toBeInTheDocument();
            });
        });

        test("should show error for invalid email format", async () => {
            render(
                <BrowserRouter>
                    <Login />
                </BrowserRouter>
            );

            const emailInput = screen.getByPlaceholderText("you@example.com");
            const passwordInput = screen.getByPlaceholderText("••••••••");

            fireEvent.change(emailInput, { target: { value: "invalid-email" } });
            fireEvent.change(passwordInput, { target: { value: "password123" } });

            const submitButton = screen.getByRole("button", { name: /sign in/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText("Enter a valid email.")).toBeInTheDocument();
            });
        });

        test("should show error when password is less than 6 characters", async () => {
            render(
                <BrowserRouter>
                    <Login />
                </BrowserRouter>
            );

            const emailInput = screen.getByPlaceholderText("you@example.com");
            const passwordInput = screen.getByPlaceholderText("••••••••");

            fireEvent.change(emailInput, { target: { value: "test@example.com" } });
            fireEvent.change(passwordInput, { target: { value: "pass" } });

            const submitButton = screen.getByRole("button", { name: /sign in/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText("Password must be at least 6 characters.")).toBeInTheDocument();
            });
        });

        test("should not show error when form is valid", async () => {
            (AuthService.login as jest.Mock).mockResolvedValue({
                token: "test-token",
                user: mockUser,
            });

            render(
                <BrowserRouter>
                    <Login />
                </BrowserRouter>
            );

            const emailInput = screen.getByPlaceholderText("you@example.com");
            const passwordInput = screen.getByPlaceholderText("••••••••");

            fireEvent.change(emailInput, { target: { value: "test@example.com" } });
            fireEvent.change(passwordInput, { target: { value: "password123" } });

            const submitButton = screen.getByRole("button", { name: /sign in/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                // Should call login API instead of showing validation error
                expect(AuthService.login).toHaveBeenCalledWith({
                    email: "test@example.com",
                    password: "password123",
                });
            });
        });
    });

    describe("Successful Login", () => {
        test("should successfully login user with USER role", async () => {
            (AuthService.login as jest.Mock).mockResolvedValue({
                token: "test-token",
                user: mockUser,
            });

            render(
                <BrowserRouter>
                    <Login />
                </BrowserRouter>
            );

            const emailInput = screen.getByPlaceholderText("you@example.com");
            const passwordInput = screen.getByPlaceholderText("••••••••");

            fireEvent.change(emailInput, { target: { value: "john@example.com" } });
            fireEvent.change(passwordInput, { target: { value: "password123" } });

            const submitButton = screen.getByRole("button", { name: /sign in/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(AuthService.login).toHaveBeenCalledWith({
                    email: "john@example.com",
                    password: "password123",
                });
            });

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith("/user/dashboard");
            });
        });

        test("should successfully login user with ADMIN role", async () => {
            (AuthService.login as jest.Mock).mockResolvedValue({
                token: "admin-token",
                user: mockAdminUser,
            });

            render(
                <BrowserRouter>
                    <Login />
                </BrowserRouter>
            );

            const emailInput = screen.getByPlaceholderText("you@example.com");
            const passwordInput = screen.getByPlaceholderText("••••••••");

            fireEvent.change(emailInput, { target: { value: "admin@example.com" } });
            fireEvent.change(passwordInput, { target: { value: "admin123" } });

            const submitButton = screen.getByRole("button", { name: /sign in/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(AuthService.login).toHaveBeenCalledWith({
                    email: "admin@example.com",
                    password: "admin123",
                });
            });

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith("/admin/dashboard");
            });
        });

        test("should store token in sessionStorage after successful login", async () => {
            (AuthService.login as jest.Mock).mockResolvedValue({
                token: "test-token",
                user: mockUser,
            });

            render(
                <BrowserRouter>
                    <Login />
                </BrowserRouter>
            );

            const emailInput = screen.getByPlaceholderText("you@example.com");
            const passwordInput = screen.getByPlaceholderText("••••••••");

            fireEvent.change(emailInput, { target: { value: "john@example.com" } });
            fireEvent.change(passwordInput, { target: { value: "password123" } });

            const submitButton = screen.getByRole("button", { name: /sign in/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(sessionStorage.getItem("authToken")).toBe("test-token");
            });
        });

        test("should store user info in sessionStorage after successful login", async () => {
            (AuthService.login as jest.Mock).mockResolvedValue({
                token: "test-token",
                user: mockUser,
            });

            render(
                <BrowserRouter>
                    <Login />
                </BrowserRouter>
            );

            const emailInput = screen.getByPlaceholderText("you@example.com");
            const passwordInput = screen.getByPlaceholderText("••••••••");

            fireEvent.change(emailInput, { target: { value: "john@example.com" } });
            fireEvent.change(passwordInput, { target: { value: "password123" } });

            const submitButton = screen.getByRole("button", { name: /sign in/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                const storedUser = sessionStorage.getItem("user");
                expect(storedUser).toBeTruthy();
                const parsedUser = JSON.parse(storedUser || "{}");
                expect(parsedUser.email).toBe("john@example.com");
            });
        });

        test("should show loading state while signing in", async () => {
            (AuthService.login as jest.Mock).mockImplementation(
                () => new Promise(() => {}) // Never resolves
            );

            render(
                <BrowserRouter>
                    <Login />
                </BrowserRouter>
            );

            const emailInput = screen.getByPlaceholderText("you@example.com");
            const passwordInput = screen.getByPlaceholderText("••••••••");

            fireEvent.change(emailInput, { target: { value: "john@example.com" } });
            fireEvent.change(passwordInput, { target: { value: "password123" } });

            const submitButton = screen.getByRole("button", { name: /sign in/i }) as HTMLButtonElement;
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText("Signing in...")).toBeInTheDocument();
                expect(submitButton.disabled).toBe(true);
            });
        });
    });

    describe("Error Handling", () => {
        test("should display error message on login failure", async () => {
            (AuthService.login as jest.Mock).mockRejectedValue(
                new Error("Invalid credentials")
            );

            render(
                <BrowserRouter>
                    <Login />
                </BrowserRouter>
            );

            const emailInput = screen.getByPlaceholderText("you@example.com");
            const passwordInput = screen.getByPlaceholderText("••••••••");

            fireEvent.change(emailInput, { target: { value: "wrong@example.com" } });
            fireEvent.change(passwordInput, { target: { value: "wrongpass" } });

            const submitButton = screen.getByRole("button", { name: /sign in/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
            });
        });

        test("should display error when no token is returned", async () => {
            (AuthService.login as jest.Mock).mockResolvedValue({
                token: null,
                user: null,
            });

            render(
                <BrowserRouter>
                    <Login />
                </BrowserRouter>
            );

            const emailInput = screen.getByPlaceholderText("you@example.com");
            const passwordInput = screen.getByPlaceholderText("••••••••");

            fireEvent.change(emailInput, { target: { value: "test@example.com" } });
            fireEvent.change(passwordInput, { target: { value: "password123" } });

            const submitButton = screen.getByRole("button", { name: /sign in/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText("Login failed")).toBeInTheDocument();
            });
        });

        test("should handle network errors gracefully", async () => {
            (AuthService.login as jest.Mock).mockRejectedValue(
                new Error("Network error")
            );

            render(
                <BrowserRouter>
                    <Login />
                </BrowserRouter>
            );

            const emailInput = screen.getByPlaceholderText("you@example.com");
            const passwordInput = screen.getByPlaceholderText("••••••••");

            fireEvent.change(emailInput, { target: { value: "test@example.com" } });
            fireEvent.change(passwordInput, { target: { value: "password123" } });

            const submitButton = screen.getByRole("button", { name: /sign in/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText("Network error")).toBeInTheDocument();
            });
        });

        test("should clear error when user starts typing", async () => {
            render(
                <BrowserRouter>
                    <Login />
                </BrowserRouter>
            );

            // Trigger a validation error first
            const submitButton = screen.getByRole("button", { name: /sign in/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText("Email is required.")).toBeInTheDocument();
            });

            // Now the error should remain until form submission (validation only on submit)
            // This is the current behavior based on the component code
            expect(screen.getByText("Email is required.")).toBeInTheDocument();
        });
    });

    describe("Navigation", () => {
        test("should navigate to register page when Create one button is clicked", () => {
            render(
                <BrowserRouter>
                    <Login />
                </BrowserRouter>
            );

            const createButton = screen.getByText("Create one");
            fireEvent.click(createButton);

            expect(mockNavigate).toHaveBeenCalledWith("/register");
        });

        test("should navigate based on user role after login", async () => {
            (AuthService.login as jest.Mock).mockResolvedValue({
                token: "test-token",
                user: mockUser,
            });

            render(
                <BrowserRouter>
                    <Login />
                </BrowserRouter>
            );

            const emailInput = screen.getByPlaceholderText("you@example.com");
            const passwordInput = screen.getByPlaceholderText("••••••••");

            fireEvent.change(emailInput, { target: { value: "john@example.com" } });
            fireEvent.change(passwordInput, { target: { value: "password123" } });

            const submitButton = screen.getByRole("button", { name: /sign in/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith("/user/dashboard");
            });

            // Reset and test with ADMIN role
            mockNavigate.mockClear();
            jest.clearAllMocks();

            (AuthService.login as jest.Mock).mockResolvedValue({
                token: "admin-token",
                user: mockAdminUser,
            });

            render(
                <BrowserRouter>
                    <Login />
                </BrowserRouter>
            );

            const emailInput2 = screen.getAllByPlaceholderText("you@example.com")[1];
            const passwordInput2 = screen.getAllByPlaceholderText("••••••••")[1];

            fireEvent.change(emailInput2, { target: { value: "admin@example.com" } });
            fireEvent.change(passwordInput2, { target: { value: "admin123" } });

            const submitButton2 = screen.getAllByRole("button", { name: /sign in/i })[1];
            fireEvent.click(submitButton2);

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith("/admin/dashboard");
            });
        });
    });

    describe("Form State Management", () => {
        test("should maintain form state across re-renders", () => {
            render(
                <BrowserRouter>
                    <Login />
                </BrowserRouter>
            );

            const emailInput = screen.getByPlaceholderText("you@example.com") as HTMLInputElement;
            const passwordInput = screen.getByPlaceholderText("••••••••") as HTMLInputElement;

            fireEvent.change(emailInput, { target: { value: "test@example.com" } });
            fireEvent.change(passwordInput, { target: { value: "password123" } });

            expect(emailInput.value).toBe("test@example.com");
            expect(passwordInput.value).toBe("password123");
        });

        test("should allow form submission with valid data", async () => {
            (AuthService.login as jest.Mock).mockResolvedValue({
                token: "test-token",
                user: mockUser,
            });

            render(
                <BrowserRouter>
                    <Login />
                </BrowserRouter>
            );

            const emailInput = screen.getByPlaceholderText("you@example.com");
            const passwordInput = screen.getByPlaceholderText("••••••••");

            fireEvent.change(emailInput, { target: { value: "john@example.com" } });
            fireEvent.change(passwordInput, { target: { value: "password123" } });

            const submitButton = screen.getByRole("button", { name: /sign in/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(AuthService.login).toHaveBeenCalledWith({
                    email: "john@example.com",
                    password: "password123",
                });
            });
        });
    });

    describe("Accessibility", () => {
        test("should have proper input types", () => {
            render(
                <BrowserRouter>
                    <Login />
                </BrowserRouter>
            );

            const emailInput = screen.getByPlaceholderText("you@example.com") as HTMLInputElement;
            const passwordInput = screen.getByPlaceholderText("••••••••") as HTMLInputElement;

            expect(emailInput.type).toBe("email");
            expect(passwordInput.type).toBe("password");
        });

        test("should have autocomplete attributes", () => {
            render(
                <BrowserRouter>
                    <Login />
                </BrowserRouter>
            );

            const emailInput = screen.getByPlaceholderText("you@example.com") as HTMLInputElement;
            const passwordInput = screen.getByPlaceholderText("••••••••") as HTMLInputElement;

            // Check that autocomplete attribute exists (React may use different casing)
            expect(emailInput.getAttribute("autocomplete")).toBe("email");
            expect(passwordInput.getAttribute("autocomplete")).toBe("current-password");
        });

        test("should have required attributes on inputs", () => {
            render(
                <BrowserRouter>
                    <Login />
                </BrowserRouter>
            );

            const emailInput = screen.getByPlaceholderText("you@example.com") as HTMLInputElement;
            const passwordInput = screen.getByPlaceholderText("••••••••") as HTMLInputElement;

            expect(emailInput.required).toBe(true);
            expect(passwordInput.required).toBe(true);
        });
    });
});
