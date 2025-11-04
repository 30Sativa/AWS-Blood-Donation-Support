import { useLocation } from "react-router-dom";
import { User } from "lucide-react";

interface HeaderProps {
  userName?: string;
}

const getPageTitle = (pathname: string): string => {
  if (pathname.includes("/sos")) return "Member - SOS";
  if (pathname.includes("/register-donation")) return "Member - Register Donation";
  if (pathname.includes("/history")) return "Member - History";
  if (pathname.includes("/health-check")) return "Member - Health Check";
  if (pathname.includes("/notifications")) return "Member - Notifications";
  if (pathname.includes("/dashboard")) return "Member - Dashboard";
  if (pathname.includes("/settings")) return "Member - Account setting";
  return "Member";
};

export function Header({ userName = "Member ABC ....." }: HeaderProps) {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <header className="w-full h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6">
      <span className="text-sm text-gray-600 font-medium">{pageTitle}</span>
      <div className="flex items-center gap-2">
        <User className="w-5 h-5 text-gray-600" />
        <span className="text-sm text-black">{userName}</span>
      </div>
    </header>
  );
}

