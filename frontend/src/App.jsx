import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Dashboard
import Dashboard from "./pages/dashboard/Dashboard";

// Client Pages
import Clients from "./pages/clients/Clients";
import CreateClient from "./pages/clients/CreateClient";
import EditClient from "./pages/clients/EditClient";


// Layout & Authentication
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Invoices from "./pages/invoices/Invoices";
import CreateInvoice from "./pages/invoices/CreateInvoice";
import EditInvoice from "./pages/invoices/EditInvoice";
import InvoiceDetails from "./pages/invoices/InvoiceDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ========================================
            Public Routes
        ======================================== */}

        {/* Redirect root to login */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* Authentication Routes */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* ========================================
            Protected Routes
        ======================================== */}

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>

            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            {/* ================================
                Client Routes
            ================================= */}

            <Route
              path="/clients"
              element={<Clients />}
            />

            <Route
              path="/clients/create"
              element={<CreateClient />}
            />

            <Route
              path="/clients/edit/:id"
              element={<EditClient />}
            />

            {/* ================================
                Invoice Routes
            ================================= */}

            <Route
              path="/invoices"
              element={<Invoices />}
            />

            <Route
              path="/invoices/create"
              element={<CreateInvoice />}
            />

            <Route
              path="/invoices/edit/:id"
              element={<EditInvoice />}
            />

            <Route
              path="/invoices/:id"
              element={<InvoiceDetails />}
            />
          </Route>
        </Route>

        {/* ========================================
            Unknown Routes
        ======================================== */}

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;