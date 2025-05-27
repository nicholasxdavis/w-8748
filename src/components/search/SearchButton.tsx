import { Search } from "lucide-react";
interface SearchButtonProps {
  searchQuery: string;
  onClick: () => void;
  isMobile?: boolean;
}
const SearchButton = ({
  searchQuery,
  onClick,
  isMobile = false
}: SearchButtonProps) => {
  if (isMobile) {
    return <div className="w-full flex items-center bg-gray-800/60 backdrop-blur-xl rounded-xl px-3 py-2 cursor-pointer hover:bg-gray-700/60 transition-all duration-300" onClick={onClick}>
        <Search className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
        <span className="text-gray-400 text-sm font-medium truncate">
          {searchQuery || "Search..."}
        </span>
      </div>;
  }
  return <div onClick={onClick} className="w-48 sm:w-80 flex items-center bg-gray-800/60 backdrop-blur-xl rounded-2xl px-4 py-2 cursor-pointer hover:bg-gray-700/60 transition-all duration-300 ">
      <Search className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
      <span className="text-gray-400 text-sm font-medium truncate">
        {searchQuery || "Search articles & news..."}
      </span>
    </div>;
};
export default SearchButton;