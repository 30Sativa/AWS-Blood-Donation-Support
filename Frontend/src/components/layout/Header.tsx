import { User } from "lucide-react";

interface HeaderProps {
  userName?: string;
}

export function Header({ userName = "Member ABC ....." }: HeaderProps) {

  return (
    <header className="w-full h-16 border-b border-gray-200 bg-white flex items-center justify-end px-6">
      <div className="flex items-center gap-2">
        <User className="w-5 h-5 text-gray-600" />
        <span className="text-sm text-black">{userName}</span>
      </div>
    </header>
  );
}

