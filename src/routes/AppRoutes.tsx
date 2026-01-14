import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import AdminDashboard from "../pages/AdminDashboard";
import UserDashboard from "../pages/UserDashboard";
import UserManagement from "../pages/UserManagement";
import CategoryManagement from "../pages/CategoryManagement";
import ExpenseReport from "../pages/ExpenseReport";
import UserExpenseManagement from "../pages/UserExpenseManagement";
import RegisterVerification from "../pages/RegisterVerification";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/register/verify" element={<RegisterVerification />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/categories" element={<CategoryManagement />} />
                <Route path="/admin/reports" element={<ExpenseReport />} />
                <Route path="/user/dashboard" element={<UserDashboard />} />
                <Route path="/user/expenses" element={<UserExpenseManagement />} />
                <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    )
}