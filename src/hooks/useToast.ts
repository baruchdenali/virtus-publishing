import { toast as sonnerToast } from "sonner";

interface ToastOptions {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const toast = (opts: ToastOptions) => {
    if (opts.variant === "destructive") {
      sonnerToast.error(opts.title, {
        description: opts.description,
      });
    } else {
      sonnerToast.success(opts.title, {
        description: opts.description,
      });
    }
  };
  return { toast };
}
