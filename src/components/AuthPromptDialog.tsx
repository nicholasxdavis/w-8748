import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
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
  return <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md bg-zinc-950 rounded-md py-[16px] px-[41px] my-0 mx-0">
        <AlertDialogHeader>
          <AlertDialogTitle>{config[type].title}</AlertDialogTitle>
          <AlertDialogDescription>
            {config[type].description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogAction onClick={handleSignIn}>
          Sign In
        </AlertDialogAction>
      </AlertDialogContent>
    </AlertDialog>;
};
export default AuthPromptDialog;