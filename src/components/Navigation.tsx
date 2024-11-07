import { Home, Search, Compass } from "lucide-react";

const Navigation = () => {
  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-transparent z-50 flex items-center justify-between px-4">
      <div className="text-2xl font-bold text-wikitok-red">WikiTok</div>
      <div className="flex space-x-4">
        <Home className="w-6 h-6 text-white" />
        <Compass className="w-6 h-6 text-white" />
        <Search className="w-6 h-6 text-white" />
      </div>
    </div>
  );
};

export default Navigation;