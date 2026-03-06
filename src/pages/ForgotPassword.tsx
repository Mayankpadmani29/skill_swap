import { useState } from "react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

// ✅ Centralize API URL for easy backend integration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent multiple clicks
    if (!email.trim() || isLoading) return;

    setIsLoading(true);

    try {
      const payload = { email }; // Backend can expect exactly this shape

      // 🔹 API call (friend can just connect this to backend)
      const res = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, payload);

      // 🔹 Handle success response from backend
      toast({
        title: "Email Sent",
        description:
          res.data?.message ||
          "If this email is registered, you’ll receive a reset link shortly.",
      });

      // Optionally redirect
      navigate("/signin");

    } catch (err: any) {
      // 🔹 More explicit error handling for backend debugging
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to send reset email.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedBackground variant="subtle">
      <div className="flex items-center justify-center p-4 min-h-screen">
        <Card className="w-full max-w-md mx-auto shadow-elegant">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Forgot Password
            </CardTitle>
            <CardDescription className="text-center">
              Enter your email and we’ll send you a password reset link.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2">
            <Button asChild variant="ghost" className="w-full">
              <Link to="/signin" className="flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AnimatedBackground>
  );
};

export default ForgotPassword;
