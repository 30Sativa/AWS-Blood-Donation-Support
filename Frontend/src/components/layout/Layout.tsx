import { useState } from "react";
import { Header } from "./Header";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-50">
  {/* Sidebar manages its own state but notifies us of changes */}
  <Sidebar onCollapsedChange={setIsCollapsed} />

      <div
        className="flex-1 flex flex-col transition-all duration-300 pt-16"
        style={{ marginLeft: isCollapsed ? "80px" : "256px" }}
      >
        <Header />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

