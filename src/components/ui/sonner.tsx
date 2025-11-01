"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "#16a34a",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      toastOptions={{
        className: "text-green-600"
      }}
      {...props}
    />
  );
};

export { Toaster };
