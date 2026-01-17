import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Register from "./Register";
import AuthService from "../api/AuthService";

// Mock AuthService
jest.mock("../api/AuthService");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

describe("Register Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        sessionStorage.clear();
        localStorage.clear();
        mockNavigate.mockClear();
    });

    describe("Form Rendering", () => {
        test("should render registration form with all elements", () => {
            render(
                <BrowserRouter>
                    <Register />
                </BrowserRouter>
            );

            expect(screen.getByText("Expense Tracker")).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
            expect(screen.getByPlaceholderText("John")).toBeInTheDocument();
            expect(screen.getByPlaceholderText("Doe")).toBeInTheDocument();
            expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
            expect(screen.getAllByPlaceholderText("••••••••").length).toBe(2);
        });

        test("should render signin link", () => {
            render(
                <BrowserRouter>
                    <Register />
                </BrowserRouter>
            );

            expect(screen.getByText("Already have an account?")).toBeInTheDocument();
            expect(screen.getByText("Sign in")).toBeInTheDocument();
        });

        test("should have proper labels for all form fields", () => {
            render(
                <BrowserRouter>
                    <Register />
                </BrowserRouter>
            );

            const labels = screen.getAllByText(/First Name|Last Name|Email|Password|Confirm Password/);
            expect(labels.length).toBeGreaterThanOrEqual(5);
        });

        test("should display Create Account button", () => {
            render(
                <BrowserRouter>
                    <Register />
                </BrowserRouter>
            );

            expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
        });
    });

    describe("Form Input Handling", () => {
        test("should update first name input on change", () => {
            render(
                <BrowserRouter>
                    <Register />
                </BrowserRouter>
            );

            const firstNameInput = screen.getByPlaceholderText("John") as HTMLInputElement;
            fireEvent.change(firstNameInput, { target: { value: "Jane" } });

            expect(firstNameInput.value).toBe("Jane");
        });

        test("should update last name input on change", () => {
            render(
                <BrowserRouter>
                    <Register />
                </BrowserRouter>
            );

            const lastNameInput = screen.getByPlaceholderText("Doe") as HTMLInputElement;
            fireEvent.change(lastNameInput, { target: { value: "Smith" } });

            expect(lastNameInput.value).toBe("Smith");
        });

        test("should update email input on change", () => {
            render(
                <BrowserRouter>
                    <Register />
                </BrowserRouter>
            );

            const emailInput = screen.getByPlaceholderText("you@example.com") as HTMLInputElement;
            fireEvent.change(emailInput, { target: { value: "test@example.com" } });

            expect(emailInput.value).toBe("test@example.com");
        });

        test("should update password input on change", () => {
            render(
                <BrowserRouter>
                    <Register />
                </BrowserRouter>
            );

            const passwordInputs = screen.getAllByPlaceholderText("••••••••") as HTMLInputElement[];
            fireEvent.change(passwordInputs[0], { target: { value: "password123" } });

            expect(passwordInputs[0].value).toBe("password123");
        });

        test("should update confirm password input on change", () => {
            render(
                <BrowserRouter>
                    <Register />
                </BrowserRouter>
            );

            const passwordInputs = screen.getAllByPlaceholderText("••••••••") as HTMLInputElement[];
            fireEvent.change(passwordInputs[1], { target: { value: "password123" } });

            expect(passwordInputs[1].value).toBe("password123");
        });

        test("should maintain form state across multiple updates", () => {
            render(
                <BrowserRouter>
                    <Register />
                </BrowserRouter>
            );

            const firstNameInput = screen.getByPlaceholderText("John") as HTMLInputElement;
            const lastNameInput = screen.getByPlaceholderText("Doe") as HTMLInputElement;
            const emailInput = screen.getByPlaceholderText("you@example.com") as HTMLInputElement;

            fireEvent.change(firstNameInput, { target: { value: "John" } });
            fireEvent.change(lastNameInput, { target: { value: "Doe" } });
            fireEvent.change(emailInput, { target: { value: "john@example.com" } });

            expect(firstNameInput.value).toBe("John");
            expect(lastNameInput.value).toBe("Doe");
            expect(emailInput.value).toBe("john@example.com");
        });
    });

    describe("Form Validation", () => {
        test("should show error when first name is empty", async () => {
            render(
                <BrowserRouter>
                    <Register />
                </BrowserRouter>
            );

            const lastNameInput = screen.getByPlaceholderText("Doe");
            const emailInput = screen.getByPlaceholderText("you@example.com");
            const passwordInputs = screen.getAllByPlaceholderText("••••••••");

            fireEvent.change(lastNameInput, { target: { value: "Doe" } });
            fireEvent.change(emailInput, { target: { value: "test@example.com" } });
            fireEvent.change(passwordInputs[0], { target: { value: "password123" } });
            fireEvent.change(passwordInputs[1], { target: { value: "password123" } });

            const submitButton = screen.getByRole("button", { name: /create account/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText("First name is required.")).toBeInTheDocument();
            });
        });

        test("should show error when last name is empty", async () => {
            render(
                <BrowserRouter>
                    <Register />
                </BrowserRouter>
            );

            const firstNameInput = screen.getByPlaceholderText("John");
            const emailInput = screen.getByPlaceholderText("you@example.com");
            const passwordInputs = screen.getAllByPlaceholderText("••••••••");

            fireEvent.change(firstNameInput, { target: { value: "John" } });
            fireEvent.change(emailInput, { target: { value: "test@example.com" } });
            fireEvent.change(passwordInputs[0], { target: { value: "password123" } });
            fireEvent.change(passwordInputs[1], { target: { value: "password123" } });

            const submitButton = screen.getByRole("button", { name: /create account/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText("Last name is required.")).toBeInTheDocument();
            });
        });

        test("should show error when email is empty", async () => {
            render(
                <BrowserRouter>
                    <Register />
                </BrowserRouter>
            );

            const firstNameInput = screen.getByPlaceholderText("John");
            const lastNameInput = screen.getByPlaceholderText("Doe");
            const passwordInputs = screen.getAllByPlaceholderText("••••••••");

            fireEvent.change(firstNameInput, { target: { value: "John" } });
            fireEvent.change(lastNameInput, { target: { value: "Doe" } });
            fireEvent.change(passwordInputs[0], { target: { value: "password123" } });
            fireEvent.change(passwordInputs[1], { target: { value: "password123" } });

            const submitButton = screen.getByRole("button", { name: /create account/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText("Email is required.")).toBeInTheDocument();
            });
        });

        test("should show error for invalid email format", async () => {
            render(
                <BrowserRouter>
                    <Register />
                </BrowserRouter>
            );

            const firstNameInput = screen.getByPlaceholderText("John");
            const lastNameInput = screen.getByPlaceholderText("Doe");
            const emailInput = screen.getByPlaceholderText("you@example.com");
            const passwordInputs = screen.getAllByPlaceholderText("••••••••");

            fireEvent.change(firstNameInput, { target: { value: "John" } });
            fireEvent.change(lastNameInput, { target: { value: "Doe" } });
            fireEvent.change(emailInput, { target: { value: "invalid-email" } });
            fireEvent.change(passwordInputs[0], { target: { value: "password123" } });
            fireEvent.change(passwordInputs[1], { target: { value: "password123" } });

            const submitButton = screen.getByRole("button", { name: /create account/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText("Enter a valid email.")).toBeInTheDocument();
            });
        });

        test("should show error when password is empty", async () => {
            render(
                <BrowserRouter>
                    <Register />
                </BrowserRouter>
            );

            const firstNameInput = screen.getByPlaceholderText("John");
            const lastNameInput = screen.getByPlaceholderText("Doe");
            const emailInput = screen.getByPlaceholderText("you@example.com");
            const passwordInputs = screen.getAllByPlaceholderText("••••••••");

            fireEvent.change(firstNameInput, { target: { value: "John" } });
            fireEvent.change(lastNameInput, { target: { value: "Doe" } });
            fireEvent.change(emailInput, { target: { value: "test@example.com" } });
            fireEvent.change(passwordInputs[1], { target: { value: "password123" } });

            const submitButton = screen.getByRole("button", { name: /create account/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText("Password is required.")).toBeInTheDocument();
            });
        });

        test("should show error when password is less than 6 characters", async () => {
            render(
                <BrowserRouter>
                    <Register />
                </BrowserRouter>
            );

            const firstNameInput = screen.getByPlaceholderText("John");
            const lastNameInput = screen.getByPlaceholderText("Doe");
            const emailInput = screen.getByPlaceholderText("you@example.com");
            const passwordInputs = screen.getAllByPlaceholderText("••••••••");

            fireEvent.change(firstNameInput, { target: { value: "John" } });
            fireEvent.change(lastNameInput, { target: { value: "Doe" } });
            fireEvent.change(emailInput, { target: { value: "test@example.com" } });
            fireEvent.change(passwordInputs[0], { target: { value: "pass" } });
            fireEvent.change(passwordInputs[1], { target: { value: "pass" } });

            const submitButton = screen.getByRole("button", { name: /create account/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText("Password must be at least 6 characters.")).toBeInTheDocument();
            });
        });

        test("should show error when confirm password is empty", async () => {
            render(
                <BrowserRouter>
                    <Register />
                </BrowserRouter>
            );

            const firstNameInput = screen.getByPlaceholderText("John");
            const lastNameInput = screen.getByPlaceholderText("Doe");
            const emailInput = screen.getByPlaceholderText("you@example.com");
            const passwordInputs = screen.getAllByPlaceholderText("••••••••");

            fireEvent.change(firstNameInput, { target: { value: "John" } });
            fireEvent.change(lastNameInput, { target: { value: "Doe" } });
            fireEvent.change(emailInput, { target: { value: "test@example.com" } });
            fireEvent.change(passwordInputs[0], { target: { value: "password123" } });

            const submitButton = screen.getByRole("button", { name: /create account/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText("Please confirm your password.")).toBeInTheDocument();
            });
        });

        test("should show error when passwords do not match", async () => {
            render(
                <BrowserRouter>
                    <Register />
                </BrowserRouter>
            );

            const firstNameInput = screen.getByPlaceholderText("John");
            const lastNameInput = screen.getByPlaceholderText("Doe");
            const emailInput = screen.getByPlaceholderText("you@example.com");
            const passwordInputs = screen.getAllByPlaceholderText("••••••••");

            fireEvent.change(firstNameInput, { target: { value: "John" } });
            fireEvent.change(lastNameInput, { target: { value: "Doe" } });
            fireEvent.change(emailInput, { target: { value: "test@example.com" } });
            fireEvent.change(passwordInputs[0], { target: { value: "password123" } });
            fireEvent.change(passwordInputs[1], { target: { value: "password456" } });

            const submitButton = screen.getByRole("button", { name: /create account/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
            });
        });

        test("should not show error when form is valid", async () => {
            (AuthService.register as jest.Mock).mockResolvedValue({
                token: "test-token",
                user: { id: "1", email: "john@example.com" },
            });

            render(
                <BrowserRouter>
                    <Register />
                </BrowserRouter>
            );

            const firstNameInput = screen.getByPlaceholderText("John");
            const lastNameInput = screen.getByPlaceholderText("Doe");
            const emailInput = screen.getByPlaceholderText("you@example.com");
            const passwordInputs = screen.getAllByPlaceholderText("••••••••");

            fireEvent.change(firstNameInput, { target: { value: "John" } });
            fireEvent.change(lastNameInput, { target: { value: "Doe" } });
            fireEvent.change(emailInput, { target: { value: "john@example.com" } });
            fireEvent.change(passwordInputs[0], { target: { value: "password123" } });
            fireEvent.change(passwordInputs[1], { target: { value: "password123" } });

            const submitButton = screen.getByRole("button", { name: /create account/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(AuthService.register).toHaveBeenCalledWith({
                    firstName: "John",
                    lastName: "Doe",
                    email: "john@example.com",
                    password: "password123",
                });
            });
        });

        test("should show error when first name has only whitespace", async () => {
            render(
                <BrowserRouter>
                    <Register />
                </BrowserRouter>
            );

            const firstNameInput = screen.getByPlaceholderText("John");
            const lastNameInput = screen.getByPlaceholderText("Doe");
            const emailInput = screen.getByPlaceholderText("you@example.com");
            const passwordInputs = screen.getAllByPlaceholderText("••••••••");

            fireEvent.change(firstNameInput, { target: { value: "   " } });
            fireEvent.change(lastNameInput, { target: { value: "Doe" } });
            fireEvent.change(emailInput, { target: { value: "test@example.com" } });
            fireEvent.change(passwordInputs[0], { target: { value: "password123" } });
            fireEvent.change(passwordInputs[1], { target: { value: "password123" } });

            const submitButton = screen.getByRole("button", { name: /create account/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText("First name is required.")).toBeInTheDocument();
            });
        });
    });

    describe("Successful Registration", () => {
        test("should successfully register a new user", async () => {
            (AuthService.register as jest.Mock).mockResolvedValue({
                token: "test-token",
                user: { id: "1", email: "john@example.com" },
            });

            render(
                <BrowserRouter>
                    <Register />
                </BrowserRouter>
            );

            const firstNameInput = screen.getByPlaceholderText("John");
            const lastNameInput = screen.getByPlaceholderText("Doe");
            const emailInput = screen.getByPlaceholderText("you@example.com");
            const passwordInputs = screen.getAllByPlaceholderText("••••••••");

            fireEvent.change(firstNameInput, { target: { value: "John" } });
            fireEvent.change(lastNameInput, { target: { value: "Doe" } });
            fireEvent.change(emailInput, { target: { value: "john@example.com" } });
            fireEvent.change(passwordInputs[0], { target: { value: "password123" } });
            fireEvent.change(passwordInputs[1], { target: { value: "password123" } });

            const submitButton = screen.getByRole("button", { name: /create account/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(AuthService.register).toHaveBeenCalledWith({
                    firstName: "John",
                    lastName: "Doe",
                    email: "john@example.com",
                    password: "password123",
                });
            });
        });

        test("should navigate to verification page after successful registration", async () => {
            (AuthService.register as jest.Mock).mockResolvedValue({
                token: "test-token",
                user: { id: "1", email: "john@example.com" },
            });

            render(
                <BrowserRouter>
                    <Register />
                </BrowserRouter>
            );

            const firstNameInput = screen.getByPlaceholderText("John");
            const lastNameInput = screen.getByPlaceholderText("Doe");
            const emailInput = screen.getByPlaceholderText("you@example.com");
            const passwordInputs = screen.getAllByPlaceholderText("••••••••");

            fireEvent.change(firstNameInput, { target: { value: "John" } });
            fireEvent.change(lastNameInput, { target: { value: "Doe" } });
            fireEvent.change(emailInput, { target: { value: "john@example.com" } });
            fireEvent.change(passwordInputs[0], { target: { value: "password123" } });
            fireEvent.change(passwordInputs[1], { target: { value: "password123" } });

            const submitButton = screen.getByRole("button", { name: /create account/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith("/register/verify", {
                    state: { email: "john@example.com" },
                });
            });
        });

        test("should show loading state while registering", async () => {
            (AuthService.register as jest.Mock).mockImplementation(
                () => new Promise(() => {}) // Never resolves
            );

            render(
                <BrowserRouter>
                    <Register />
                </BrowserRouter>
            );

            const firstNameInput = screen.getByPlaceholderText("John");
            const lastNameInput = screen.getByPlaceholderText("Doe");
            const emailInput = screen.getByPlaceholderText("you@example.com");
            const passwordInputs = screen.getAllByPlaceholderText("••••••••");

            fireEvent.change(firstNameInput, { target: { value: "John" } });
            fireEvent.change(lastNameInput, { target: { value: "Doe" } });
            fireEvent.change(emailInput, { target: { value: "john@example.com" } });
            fireEvent.change(passwordInputs[0], { target: { value: "password123" } });
            fireEvent.change(passwordInputs[1], { target: { value: "password123" } });

            const submitButton = screen.getByRole("button", { name: /create account/i }) as HTMLButtonElement;
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText("Creating Account...")).toBeInTheDocument();
                expect(submitButton.disabled).toBe(true);
            });
        });

        test("should pass correct data to AuthService.register", async () => {
            (AuthService.register as jest.Mock).mockResolvedValue({
                token: "test-token",
            });

            render(
                <BrowserRouter>
                    <Register />
                </BrowserRouter>
            );

            const firstNameInput = screen.getByPlaceholderText("John");
            const lastNameInput = screen.getByPlaceholderText("Doe");
            const emailInput = screen.getByPlaceholderText("you@example.com");
            const passwordInputs = screen.getAllByPlaceholderText("••••••••");

            fireEvent.change(firstNameInput, { target: { value: "Jane" } });
            fireEvent.change(lastNameInput, { target: { value: "Smith" } });
            fireEvent.change(emailInput, { target: { value: "jane@example.com" } });
            fireEvent.change(passwordInputs[0], { target: { value: "securepass123" } });
            fireEvent.change(passwordInputs[1], { target: { value: "securepass123" } });

            const submitButton = screen.getByRole("button", { name: /create account/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(AuthService.register).toHaveBeenCalledWith({
                    firstName: "Jane",
                    lastName: "Smith",
                    email: "jane@example.com",
                    password: "securepass123",
                });
            });
        });
    });

    describe("Error Handling", () => {
        test("should display error message on registration failure", async () => {
            (AuthService.register as jest.Mock).mockRejectedValue({
                response: {
                    data: {
                        message: "Email already exists",
                    },
                },
            });

            render(
                <BrowserRouter>
                    <Register />
                </BrowserRouter>
            );

            const firstNameInput = screen.getByPlaceholderText("John");
            const lastNameInput = screen.getByPlaceholderText("Doe");
            const emailInput = screen.getByPlaceholderText("you@example.com");
            const passwordInputs = screen.getAllByPlaceholderText("••••••••");

            fireEvent.change(firstNameInput, { target: { value: "John" } });
            fireEvent.change(lastNameInput, { target: { value: "Doe" } });
            fireEvent.change(emailInput, { target: { value: "existing@example.com" } });
            fireEvent.change(passwordInputs[0], { target: { value: "password123" } });
            fireEvent.change(passwordInputs[1], { target: { value: "password123" } });

            const submitButton = screen.getByRole("button", { name: /create account/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText("Email already exists")).toBeInTheDocument();
            });
        });

        test("should handle network errors gracefully", async () => {
            (AuthService.register as jest.Mock).mockRejectedValue(
                new Error("Network error")
            );

            render(
                <BrowserRouter>
                    <Register />
                </BrowserRouter>
            );

            const firstNameInput = screen.getByPlaceholderText("John");
            const lastNameInput = screen.getByPlaceholderText("Doe");
            const emailInput = screen.getByPlaceholderText("you@example.com");
            const passwordInputs = screen.getAllByPlaceholderText("••••••••");

            fireEvent.change(firstNameInput, { target: { value: "John" } });
            fireEvent.change(lastNameInput, { target: { value: "Doe" } });
            fireEvent.change(emailInput, { target: { value: "john@example.com" } });
            fireEvent.change(passwordInputs[0], { target: { value: "password123" } });
            fireEvent.change(passwordInputs[1], { target: { value: "password123" } });

            const submitButton = screen.getByRole("button", { name: /create account/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText("Network error")).toBeInTheDocument();
            });
        });

        test("should display default error message when response error is missing", async () => {
            (AuthService.register as jest.Mock).mockRejectedValue({});

            render(
                <BrowserRouter>
                    <Register />
                </BrowserRouter>
            );

            const firstNameInput = screen.getByPlaceholderText("John");
            const lastNameInput = screen.getByPlaceholderText("Doe");
            const emailInput = screen.getByPlaceholderText("you@example.com");
            const passwordInputs = screen.getAllByPlaceholderText("••••••••");

            fireEvent.change(firstNameInput, { target: { value: "John" } });
            fireEvent.change(lastNameInput, { target: { value: "Doe" } });
            fireEvent.change(emailInput, { target: { value: "john@example.com" } });
            fireEvent.change(passwordInputs[0], { target: { value: "password123" } });
            fireEvent.change(passwordInputs[1], { target: { value: "password123" } });

            const submitButton = screen.getByRole("button", { name: /create account/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText("Registration failed. Please try again.")).toBeInTheDocument();
            });
        });
    });

    describe("Navigation", () => {
        test("should navigate to login page when Sign in button is clicked", () => {
            render(
                <BrowserRouter>
                    <Register />
                </BrowserRouter>
            );

            const signInButton = screen.getByText("Sign in");
            fireEvent.click(signInButton);

            expect(mockNavigate).toHaveBeenCalledWith("/login");
        });
    });

    describe("Accessibility", () => {
        test("should have proper input types", () => {
            render(
                <BrowserRouter>
                    <Register />
                </BrowserRouter>
            );

            const firstNameInput = screen.getByPlaceholderText("John") as HTMLInputElement;
            const lastNameInput = screen.getByPlaceholderText("Doe") as HTMLInputElement;
            const emailInput = screen.getByPlaceholderText("you@example.com") as HTMLInputElement;
            const passwordInputs = screen.getAllByPlaceholderText("••••••••") as HTMLInputElement[];

            expect(firstNameInput.type).toBe("text");
            expect(lastNameInput.type).toBe("text");
            expect(emailInput.type).toBe("email");
            expect(passwordInputs[0].type).toBe("password");
            expect(passwordInputs[1].type).toBe("password");
        });

        test("should have autocomplete attributes", () => {
            render(
                <BrowserRouter>
                    <Register />
                </BrowserRouter>
            );

            const firstNameInput = screen.getByPlaceholderText("John") as HTMLInputElement;
            const lastNameInput = screen.getByPlaceholderText("Doe") as HTMLInputElement;
            const emailInput = screen.getByPlaceholderText("you@example.com") as HTMLInputElement;
            const passwordInputs = screen.getAllByPlaceholderText("••••••••") as HTMLInputElement[];

            expect(firstNameInput.getAttribute("autocomplete")).toBe("given-name");
            expect(lastNameInput.getAttribute("autocomplete")).toBe("family-name");
            expect(emailInput.getAttribute("autocomplete")).toBe("email");
            expect(passwordInputs[0].getAttribute("autocomplete")).toBe("new-password");
            expect(passwordInputs[1].getAttribute("autocomplete")).toBe("new-password");
        });

        test("should have required attributes on all inputs", () => {
            render(
                <BrowserRouter>
                    <Register />
                </BrowserRouter>
            );

            const firstNameInput = screen.getByPlaceholderText("John") as HTMLInputElement;
            const lastNameInput = screen.getByPlaceholderText("Doe") as HTMLInputElement;
            const emailInput = screen.getByPlaceholderText("you@example.com") as HTMLInputElement;
            const passwordInputs = screen.getAllByPlaceholderText("••••••••") as HTMLInputElement[];

            expect(firstNameInput.required).toBe(true);
            expect(lastNameInput.required).toBe(true);
            expect(emailInput.required).toBe(true);
            expect(passwordInputs[0].required).toBe(true);
            expect(passwordInputs[1].required).toBe(true);
        });
    });

    describe("Form State Management", () => {
        test("should maintain all form fields after submission attempt with validation error", async () => {
            render(
                <BrowserRouter>
                    <Register />
                </BrowserRouter>
            );

            const firstNameInput = screen.getByPlaceholderText("John") as HTMLInputElement;
            const lastNameInput = screen.getByPlaceholderText("Doe") as HTMLInputElement;
            const emailInput = screen.getByPlaceholderText("you@example.com") as HTMLInputElement;
            const passwordInputs = screen.getAllByPlaceholderText("••••••••") as HTMLInputElement[];

            fireEvent.change(firstNameInput, { target: { value: "Jane" } });
            fireEvent.change(lastNameInput, { target: { value: "Smith" } });
            fireEvent.change(emailInput, { target: { value: "jane@example.com" } });
            fireEvent.change(passwordInputs[0], { target: { value: "pass123" } });
            fireEvent.change(passwordInputs[1], { target: { value: "pass123" } });

            const submitButton = screen.getByRole("button", { name: /create account/i });
            fireEvent.click(submitButton);

            // Check that values are maintained after validation error
            expect(firstNameInput.value).toBe("Jane");
            expect(lastNameInput.value).toBe("Smith");
            expect(emailInput.value).toBe("jane@example.com");
        });
    });
});
