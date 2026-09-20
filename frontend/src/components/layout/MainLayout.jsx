import { Outlet } from "react-router-dom";

import Topbar from "../common/Topbar";
import Footer from "../common/Footer";

const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Topbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;