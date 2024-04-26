import { useEffect } from "react";

type ToastProps = {
  message: string;
  type: "SUCCESS" | "ERROR" | "WARNING";
  onClose: () => void;
};

const Toast = ({ message, type, onClose }: ToastProps) => {
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  let styles: string = "";
    if (type === "SUCCESS") {
      styles = "fixed bottom-20 right-4 z-50 px-4 py-2 rounded-md bg-green-600 text-white max-w-md"
    } else if (type === "WARNING") {
      styles = "fixed bottom-20 right-4 z-50 px-4 py-2 rounded-md bg-yellow-600 text-white max-w-md";
    } else {
      styles = "fixed bottom-20 right-4 z-50 px-4 py-2 rounded-md bg-red-600 text-white max-w-md";
    }

  return (
    <div className={styles}>
      <div className="flex justify-center items-center">
        <span className="text-lg font-semibold">{message}</span>
      </div>
    </div>
  );
};

export default Toast;
