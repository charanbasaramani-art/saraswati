import { Moon, Sun, Rainbow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === "light" || theme === "system") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("vibgyor");
    } else {
      setTheme("light");
    }
  };

  const isVibgyor = theme === "vibgyor";
  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative h-9 w-9 rounded-full transition-all duration-300 hover:bg-accent"
    >
      {isVibgyor ? (
        <Rainbow className="h-5 w-5 text-primary animate-pulse" />
      ) : (
        <>
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
        </>
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
