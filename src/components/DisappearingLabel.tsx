
import { useEffect, useState } from 'react';

interface DisappearingLabelProps {
  show: boolean;
  message: string;
  className?: string;
}

const DisappearingLabel = ({ show, message, className = "" }: DisappearingLabelProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [show]);

  if (!isVisible) return null;

  return (
    <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-black/80 text-white px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-md border border-white/20 animate-in fade-in duration-200 ${className}`}>
      {message}
    </div>
  );
};

export default DisappearingLabel;
