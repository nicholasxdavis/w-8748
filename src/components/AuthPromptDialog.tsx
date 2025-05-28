
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

interface AuthPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'save' | 'listen';
}

const AuthPromptDialog = ({
  open,
  onOpenChange,
  type
}: AuthPromptDialogProps) => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/auth');
    onOpenChange(false);
  };

  const config = {
    save: {
      title: "Save articles for later",
      description: "Sign in to bookmark articles and access them across all your devices."
    },
    listen: {
      title: "Listen to articles",
      description: "Sign in to access text-to-speech features and listen to articles on the go."
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent 
        className="sm:max-w-md bg-zinc-950 border-zinc-800 rounded-xl py-6 px-6 relative"
        style={{
          position: 'fixed',
          top: '50vh',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999
        }}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4 text-zinc-400 hover:text-white" />
        </button>
        
        <AlertDialogHeader className="space-y-3">
          <AlertDialogTitle className="text-white text-lg font-semibold">
            {config[type].title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-400 text-sm">
            {config[type].description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogAction 
          onClick={handleSignIn}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0 mt-4"
        >
          Sign In
        </AlertDialogAction>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AuthPromptDialog;
