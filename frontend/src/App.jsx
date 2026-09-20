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

// Invoice Pages
import Invoices from "./pages/invoices/Invoices";
import CreateInvoice from "./pages/invoices/CreateInvoice";
import EditInvoice from "./pages/invoices/EditInvoice";
import InvoiceDetails from "./pages/invoices/InvoiceDetails";
import InvoiceExport from "./pages/invoices/InvoiceExport";

// Layout & Authentication
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
 

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

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

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

            <Route
              path="/invoice-export"
              element={<InvoiceExport />}
            />

          </Route>
        </Route>

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;