import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Flame, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background parchment-bg heritage-pattern">
      <div className="text-center manuscript-card corner-ornament p-12 max-w-md mx-4">
        <Flame className="h-12 w-12 text-gold mx-auto mb-4 diya-glow flame-flicker" />
        <h1 className="mb-4 text-6xl font-bold font-serif text-primary">404</h1>
        <p className="mb-6 text-xl text-muted-foreground font-serif">
          This scroll could not be found
        </p>
        <p className="mb-8 text-sm text-muted-foreground">
          The ancient manuscript you seek does not exist in our archives.
        </p>
        <a href="/">
          <Button className="btn-plaque">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Temple
          </Button>
        </a>
      </div>
    </div>
  );
};

export default NotFound;
