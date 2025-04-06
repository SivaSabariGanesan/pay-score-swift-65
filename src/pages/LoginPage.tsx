
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const LoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading, loginWithGoogle } = useAuth();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated && !loading) {
      navigate("/");
    }

    // Render Google Sign-In button
    if (googleButtonRef.current && window.google) {
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        shape: "rectangular",
        width: 280,
        text: "signin_with",
      });
    }
  }, [isAuthenticated, loading, navigate]);

  const handleLoginWithGoogle = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Login failed", {
        description: "There was an error logging in with Google",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to TransPay</CardTitle>
          <CardDescription>
            Log in to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <div ref={googleButtonRef}></div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          
          <Button 
            className="w-full" 
            variant="outline"
            onClick={handleLoginWithGoogle}
          >
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" 
              alt="Google" 
              className="w-5 h-5 mr-2" 
            />
            Sign in with Google
          </Button>
          
          <Button 
            className="w-full" 
            variant="outline"
            onClick={() => navigate("/")}
          >
            Continue as Guest
          </Button>
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
