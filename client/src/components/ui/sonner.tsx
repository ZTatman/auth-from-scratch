import * as React from "react";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import { Toaster as Sonner } from "sonner";

import { cn } from "@/lib/utils";

type ToasterProps = React.ComponentProps<typeof Sonner>;

function Toaster({ className, ...props }: ToasterProps) {
  return (
    <Sonner
      position="top-right"
      className={cn("toaster group", className)}
      icons={{
        success: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
        info: <Info className="h-4 w-4 text-sky-600" />,
        error: <XCircle className="h-4 w-4 text-red-600" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-900 group-[.toaster]:border-sky-200 group-[.toaster]:shadow-lg group-[.toaster]:shadow-sky-200/40 group-[.toaster]:ring-1 group-[.toaster]:ring-sky-100",
          description: "group-[.toast]:text-slate-600",
          actionButton:
            "group-[.toast]:bg-sky-600 group-[.toast]:text-white group-[.toast]:hover:bg-sky-700",
          cancelButton:
            "group-[.toast]:bg-white group-[.toast]:text-slate-600 group-[.toast]:border group-[.toast]:border-sky-200 group-[.toast]:hover:bg-sky-50",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
