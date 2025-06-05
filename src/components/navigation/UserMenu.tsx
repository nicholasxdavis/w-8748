
import { User, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const UserMenu = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error: any) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) {
    return (
      <button
        onClick={() => navigate('/auth')}
        className="flex items-center space-x-1 sm:space-x-2 bg-blue-600 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl hover:bg-blue-700 transition-all duration-300 font-medium hover:scale-105 h-8 sm:h-9"
      >
        <User className="w-4 h-4" />
        <span className="text-xs sm:text-sm hidden sm:inline">Sign In</span>
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-600 rounded-full flex items-center justify-center border-2 border-gray-700/50 hover:bg-blue-700 transition-colors">
          <User className="w-4 h-4 text-white" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-48 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl z-[60]"
        align="end"
      >
        <DropdownMenuItem 
          onClick={() => navigate('/settings')}
          className="text-gray-300 hover:text-blue-400 hover:bg-gray-800/60 focus:bg-gray-800/60 focus:text-blue-400 cursor-pointer px-3 py-2 rounded-lg"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="text-red-400 hover:text-red-300 hover:bg-gray-800/60 focus:bg-gray-800/60 focus:text-red-300 cursor-pointer px-3 py-2 rounded-lg"
        >
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
