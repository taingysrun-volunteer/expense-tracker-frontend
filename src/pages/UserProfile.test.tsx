import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UserProfile from "./UserProfile";
import UserService from "../api/UserService";
import { BrowserRouter } from "react-router-dom";

// Mock UserService
jest.mock("../api/UserService");

// Mock Toolbar
jest.mock("../components/Toolbar", () => ({
    __esModule: true,
    default: ({ title, onLogout }: any) => (
        <div data-testid="toolbar">
            <span>{title}</span>
            <button onClick={onLogout}>Logout</button>
        </div>
    ),
}));

const mockUser = {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    role: "USER",
    createdAt: "2025-01-01T00:00:00Z",
};

describe("UserProfile Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        sessionStorage.clear();
    });

    describe("Authentication and Loading", () => {
        test("should display loading state initially", () => {
            localStorage.setItem("authToken", "test-token");
            localStorage.setItem("user", JSON.stringify(mockUser));
            (UserService.getUserById as jest.Mock).mockImplementation(
                () => new Promise(() => {}) // Never resolves
            );

            render(
                <BrowserRouter>
                    <UserProfile />
                </BrowserRouter>
            );

            expect(screen.getByText("Loading...")).toBeInTheDocument();
        });

        test("should fetch user profile on mount", async () => {
            localStorage.setItem("authToken", "test-token");
            localStorage.setItem("user", JSON.stringify(mockUser));
            (UserService.getUserById as jest.Mock).mockResolvedValue(mockUser);

            render(
                <BrowserRouter>
                    <UserProfile />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(UserService.getUserById).toHaveBeenCalledWith("1");
            });
        });
    });

    describe("Profile Display", () => {
        beforeEach(() => {
            localStorage.setItem("authToken", "test-token");
            localStorage.setItem("user", JSON.stringify(mockUser));
            (UserService.getUserById as jest.Mock).mockResolvedValue(mockUser);
        });

        test("should display user profile information", async () => {
            render(
                <BrowserRouter>
                    <UserProfile />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("John")).toBeInTheDocument();
                expect(screen.getByText("Doe")).toBeInTheDocument();
                expect(screen.getByText("john@example.com")).toBeInTheDocument();
            });
        });

        test("should display role badge", async () => {
            render(
                <BrowserRouter>
                    <UserProfile />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("USER")).toBeInTheDocument();
            });
        });

        test("should display member since date", async () => {
            render(
                <BrowserRouter>
                    <UserProfile />
                </BrowserRouter>
            );

            await waitFor(() => {
                // Check that "Member Since" label is displayed
                expect(screen.getByText("Member Since")).toBeInTheDocument();
            });
        });

        test("should display Edit Profile button", async () => {
            render(
                <BrowserRouter>
                    <UserProfile />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Edit Profile")).toBeInTheDocument();
            });
        });

        test("should display Profile Information title", async () => {
            render(
                <BrowserRouter>
                    <UserProfile />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Profile Information")).toBeInTheDocument();
            });
        });
    });

    describe("Edit Profile", () => {
        beforeEach(() => {
            localStorage.setItem("authToken", "test-token");
            localStorage.setItem("user", JSON.stringify(mockUser));
            (UserService.getUserById as jest.Mock).mockResolvedValue(mockUser);
        });

        test("should enter edit mode when Edit Profile button is clicked", async () => {
            render(
                <BrowserRouter>
                    <UserProfile />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Edit Profile")).toBeInTheDocument();
            });

            const editButton = screen.getByText("Edit Profile");
            fireEvent.click(editButton);

            expect(screen.getByDisplayValue("John")).toBeInTheDocument();
            expect(screen.getByDisplayValue("Doe")).toBeInTheDocument();
            expect(screen.getByDisplayValue("john@example.com")).toBeInTheDocument();
        });

        test("should display form inputs in edit mode", async () => {
            render(
                <BrowserRouter>
                    <UserProfile />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Edit Profile")).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText("Edit Profile"));

            // Find inputs by their values instead of labels
            const firstNameInputs = screen.getAllByDisplayValue("John");
            const lastNameInputs = screen.getAllByDisplayValue("Doe");
            const emailInputs = screen.getAllByDisplayValue("john@example.com");

            expect(firstNameInputs.length).toBeGreaterThan(0);
            expect(lastNameInputs.length).toBeGreaterThan(0);
            expect(emailInputs.length).toBeGreaterThan(0);
        });

        test("should show Cancel and Save Changes buttons in edit mode", async () => {
            render(
                <BrowserRouter>
                    <UserProfile />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Edit Profile")).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText("Edit Profile"));

            expect(screen.getByText("Cancel")).toBeInTheDocument();
            expect(screen.getByText("Save Changes")).toBeInTheDocument();
        });

        test("should cancel edit and return to view mode", async () => {
            render(
                <BrowserRouter>
                    <UserProfile />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Edit Profile")).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText("Edit Profile"));
            fireEvent.click(screen.getByText("Cancel"));

            expect(screen.getByText("Edit Profile")).toBeInTheDocument();
            expect(screen.queryByText("Cancel")).not.toBeInTheDocument();
        });
    });

    describe("Form Validation", () => {
        beforeEach(() => {
            localStorage.setItem("authToken", "test-token");
            localStorage.setItem("user", JSON.stringify(mockUser));
            (UserService.getUserById as jest.Mock).mockResolvedValue(mockUser);
        });

        test("should show validation error for empty first name", async () => {
            render(
                <BrowserRouter>
                    <UserProfile />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Edit Profile")).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText("Edit Profile"));

            const firstNameInput = screen.getByDisplayValue("John") as HTMLInputElement;
            fireEvent.change(firstNameInput, { target: { value: "" } });
            fireEvent.click(screen.getByText("Save Changes"));

            await waitFor(() => {
                expect(screen.getByText("First name is required")).toBeInTheDocument();
            });
        });

        test("should show validation error for empty last name", async () => {
            render(
                <BrowserRouter>
                    <UserProfile />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Edit Profile")).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText("Edit Profile"));

            const lastNameInput = screen.getByDisplayValue("Doe") as HTMLInputElement;
            fireEvent.change(lastNameInput, { target: { value: "" } });
            fireEvent.click(screen.getByText("Save Changes"));

            await waitFor(() => {
                expect(screen.getByText("Last name is required")).toBeInTheDocument();
            });
        });

        test("should show validation error for empty email", async () => {
            render(
                <BrowserRouter>
                    <UserProfile />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Edit Profile")).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText("Edit Profile"));

            const emailInput = screen.getByDisplayValue("john@example.com") as HTMLInputElement;
            fireEvent.change(emailInput, { target: { value: "" } });
            fireEvent.click(screen.getByText("Save Changes"));

            await waitFor(() => {
                expect(screen.getByText("Email is required")).toBeInTheDocument();
            });
        });

        test("should show validation error for invalid email format", async () => {
            render(
                <BrowserRouter>
                    <UserProfile />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Edit Profile")).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText("Edit Profile"));

            const emailInput = screen.getByDisplayValue("john@example.com") as HTMLInputElement;
            fireEvent.change(emailInput, { target: { value: "invalid-email" } });
            fireEvent.click(screen.getByText("Save Changes"));

            await waitFor(() => {
                expect(screen.getByText("Invalid email format")).toBeInTheDocument();
            });
        });

        test("should clear validation error on focus", async () => {
            render(
                <BrowserRouter>
                    <UserProfile />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Edit Profile")).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText("Edit Profile"));

            const firstNameInput = screen.getByDisplayValue("John") as HTMLInputElement;
            fireEvent.change(firstNameInput, { target: { value: "" } });
            fireEvent.click(screen.getByText("Save Changes"));

            await waitFor(() => {
                expect(screen.getByText("First name is required")).toBeInTheDocument();
            });

            fireEvent.focus(firstNameInput);

            expect(screen.queryByText("First name is required")).not.toBeInTheDocument();
        });
    });

    describe("Save Profile Changes", () => {
        beforeEach(() => {
            localStorage.setItem("authToken", "test-token");
            localStorage.setItem("user", JSON.stringify(mockUser));
            (UserService.getUserById as jest.Mock).mockResolvedValue(mockUser);
        });

        test("should successfully save profile changes", async () => {
            const updatedUser = {
                ...mockUser,
                firstName: "Jane",
                lastName: "Smith",
            };
            (UserService.updateUser as jest.Mock).mockResolvedValue(updatedUser);

            render(
                <BrowserRouter>
                    <UserProfile />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Edit Profile")).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText("Edit Profile"));

            const firstNameInput = screen.getByDisplayValue("John") as HTMLInputElement;
            fireEvent.change(firstNameInput, { target: { value: "Jane" } });

            const lastNameInput = screen.getByDisplayValue("Doe") as HTMLInputElement;
            fireEvent.change(lastNameInput, { target: { value: "Smith" } });

            fireEvent.click(screen.getByText("Save Changes"));

            await waitFor(() => {
                expect(UserService.updateUser).toHaveBeenCalledWith("1", {
                    firstName: "Jane",
                    lastName: "Smith",
                    email: "john@example.com",
                });
            });
        });

        test("should show success message after saving", async () => {
            const updatedUser = {
                ...mockUser,
                firstName: "Jane",
            };
            (UserService.updateUser as jest.Mock).mockResolvedValue(updatedUser);

            render(
                <BrowserRouter>
                    <UserProfile />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Edit Profile")).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText("Edit Profile"));

            const firstNameInput = screen.getByDisplayValue("John") as HTMLInputElement;
            fireEvent.change(firstNameInput, { target: { value: "Jane" } });

            fireEvent.click(screen.getByText("Save Changes"));

            await waitFor(() => {
                expect(screen.getByText("Profile updated successfully")).toBeInTheDocument();
            });
        });

        test("should return to view mode after successful save", async () => {
            const updatedUser = {
                ...mockUser,
                firstName: "Jane",
            };
            (UserService.updateUser as jest.Mock).mockResolvedValue(updatedUser);

            render(
                <BrowserRouter>
                    <UserProfile />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Edit Profile")).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText("Edit Profile"));

            const firstNameInput = screen.getByDisplayValue("John") as HTMLInputElement;
            fireEvent.change(firstNameInput, { target: { value: "Jane" } });

            fireEvent.click(screen.getByText("Save Changes"));

            await waitFor(() => {
                expect(screen.getByText("Profile updated successfully")).toBeInTheDocument();
            });

            expect(screen.getByText("Edit Profile")).toBeInTheDocument();
            expect(screen.queryByText("Cancel")).not.toBeInTheDocument();
        });

        test("should update localStorage after successful save", async () => {
            const updatedUser = {
                ...mockUser,
                firstName: "Jane",
            };
            (UserService.updateUser as jest.Mock).mockResolvedValue(updatedUser);

            render(
                <BrowserRouter>
                    <UserProfile />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Edit Profile")).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText("Edit Profile"));

            const firstNameInput = screen.getByDisplayValue("John") as HTMLInputElement;
            fireEvent.change(firstNameInput, { target: { value: "Jane" } });

            fireEvent.click(screen.getByText("Save Changes"));

            await waitFor(() => {
                const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
                expect(storedUser.firstName).toBe("Jane");
            });
        });
    });

    describe("Error Handling", () => {
        beforeEach(() => {
            localStorage.setItem("authToken", "test-token");
            localStorage.setItem("user", JSON.stringify(mockUser));
        });

        test("should display error message on profile fetch failure", async () => {
            (UserService.getUserById as jest.Mock).mockRejectedValue({
                response: {
                    data: {
                        message: "Failed to load profile",
                    },
                },
            });

            render(
                <BrowserRouter>
                    <UserProfile />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Failed to load profile")).toBeInTheDocument();
            });
        });

        test("should display error message on profile update failure", async () => {
            (UserService.getUserById as jest.Mock).mockResolvedValue(mockUser);
            (UserService.updateUser as jest.Mock).mockRejectedValue({
                response: {
                    data: {
                        message: "Email already exists",
                    },
                },
            });

            render(
                <BrowserRouter>
                    <UserProfile />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Edit Profile")).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText("Edit Profile"));
            fireEvent.click(screen.getByText("Save Changes"));

            await waitFor(() => {
                expect(screen.getByText("Email already exists")).toBeInTheDocument();
            });
        });

        test("should clear error message when close button is clicked", async () => {
            (UserService.getUserById as jest.Mock).mockRejectedValue({
                response: {
                    data: {
                        message: "Failed to load profile",
                    },
                },
            });

            render(
                <BrowserRouter>
                    <UserProfile />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Failed to load profile")).toBeInTheDocument();
            });

            const closeButton = screen.getByRole("button", { name: "✕" });
            fireEvent.click(closeButton);

            expect(screen.queryByText("Failed to load profile")).not.toBeInTheDocument();
        });
    });

    describe("Logout", () => {
        test("should clear auth data on logout", async () => {
            localStorage.setItem("authToken", "test-token");
            localStorage.setItem("user", JSON.stringify(mockUser));
            (UserService.getUserById as jest.Mock).mockResolvedValue(mockUser);

            render(
                <BrowserRouter>
                    <UserProfile />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Profile Information")).toBeInTheDocument();
            });

            const logoutButton = screen.getByText("Logout");
            fireEvent.click(logoutButton);

            expect(localStorage.getItem("authToken")).toBeNull();
            expect(localStorage.getItem("user")).toBeNull();
            expect(sessionStorage.getItem("authToken")).toBeNull();
            expect(sessionStorage.getItem("user")).toBeNull();
        });
    });
});
