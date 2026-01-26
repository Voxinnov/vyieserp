import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./auth/Login";
import Register from "./auth/Register";
import DashboardLayout from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import CreateTask from "./pages/CreateTask";
import EditTask from "./pages/EditTask";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<div>Forgot Password Page</div>} />

        <Route element={<DashboardLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          {/* Placeholder routes for sidebar items */}
          <Route path="tasks" element={<Tasks />} />
          <Route path="tasks/create" element={<CreateTask />} />
          <Route path="tasks/edit/:id" element={<EditTask />} />
          <Route path="todo" element={<div>To Do Page</div>} />
          <Route path="clients" element={<div>Clients Page</div>} />
          <Route path="litigation" element={<div>Litigation Page</div>} />
          <Route path="calendar" element={<div>Calendar Page</div>} />
          <Route path="cause-list" element={<div>Cause List Page</div>} />
          <Route path="drafts" element={<div>Drafts Page</div>} />
          <Route path="documents" element={<div>Documents Page</div>} />
          <Route path="time-tracking" element={<div>Time Tracking Page</div>} />
          <Route path="billing" element={<div>Billing Page</div>} />
          <Route path="expenses" element={<div>Expenses Page</div>} />
          <Route path="client-portal" element={<div>Client Portal Page</div>} />
          <Route path="communication" element={<div>Communication Page</div>} />
          <Route path="research" element={<div>Research Page</div>} />
          <Route path="reports" element={<div>Reports Page</div>} />
          <Route path="settings" element={<div>Settings Page</div>} />

          <Route path="*" element={<div className="p-4">Page under construction</div>} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
