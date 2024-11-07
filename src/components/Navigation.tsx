import { Home, Search, Compass } from "lucide-react";

const Navigation = () => {
  return (
    <div className="fixed top-0 left-0 right-0 h-14 bg-transparent z-50 flex items-center justify-between px-4 bg-gradient-to-b from-black/50 to-transparent">
      <div className="text-xl font-bold text-wikitok-red">WikiTok</div>
      <div className="flex space-x-6">
        <Home className="w-5 h-5 text-white" />
        <Compass className="w-5 h-5 text-white" />
        <Search className="w-5 h-5 text-white" />
      </div>
    </div>
  );
};

export default Navigation;