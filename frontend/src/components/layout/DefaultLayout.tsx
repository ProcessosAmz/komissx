import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function DefaultLayout() {
  return (
    <div className="min-h-screen bg-[#030712] flex text-slate-100">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 px-4 sm:px-6 py-6">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}