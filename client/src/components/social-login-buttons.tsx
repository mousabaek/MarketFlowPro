import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FaGoogle, FaApple, FaGithub } from "react-icons/fa";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function SocialLoginButtons() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSocialLogin = (provider: string) => {
    try {
      setIsLoading(provider);
      // Redirect to the provider's OAuth route
      window.location.href = `/api/auth/${provider}`;
      
      // We show a toast here, but it may not be visible long because of the redirect
      toast({
        title: `Redirecting to ${provider}`,
        description: "Please wait while we redirect you to the authentication provider.",
      });
    } catch (error) {
      setIsLoading(null);
      toast({
        title: "Authentication Error",
        description: `Could not initiate ${provider} login. Please try again.`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-3 mt-3">
      <div className="flex items-center">
        <Separator className="flex-grow" />
        <span className="px-3 text-xs text-muted-foreground">OR CONTINUE WITH</span>
        <Separator className="flex-grow" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Button 
          variant="outline" 
          onClick={() => handleSocialLogin("google")}
          className="h-10"
          aria-label="Sign in with Google"
          disabled={isLoading !== null}
        >
          {isLoading === "google" ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <FaGoogle className="h-4 w-4" />
          )}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => handleSocialLogin("github")}
          className="h-10"
          aria-label="Sign in with GitHub"
          disabled={isLoading !== null}
        >
          {isLoading === "github" ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <FaGithub className="h-4 w-4" />
          )}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => handleSocialLogin("apple")}
          className="h-10"
          aria-label="Sign in with Apple"
          disabled={isLoading !== null}
        >
          {isLoading === "apple" ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <FaApple className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}