import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/location');
      }
    };
    checkUser();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log("Signing in with:", email, password);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Login error:", error);
        throw error;
      }
      
      console.log("Login successful:", data);
      toast.success("Login successful!");
      navigate('/location');
    } catch (error: any) {
      console.error("Error in login process:", error);
      toast.error(error.message || "Error logging in");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!name.trim()) {
        throw new Error("Please enter your name");
      }
      
      console.log("Signing up with:", email, password, name);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          }
        }
      });
      
      if (error) {
        console.error("Signup error:", error);
        throw error;
      }
      
      console.log("Signup successful:", data);
      toast.success("Registration successful! Please log in.");
      setIsSignUp(false);
    } catch (error: any) {
      console.error("Error in signup process:", error);
      toast.error(error.message || "Error signing up");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "admin" && password === "admin123") {
      toast.success("Admin login successful!");
      navigate('/admin');
    } else {
      toast.error("Invalid admin credentials");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black bg-gradient-to-br from-black via-purple-950 to-violet-900 p-4 relative">
      {/* Admin Login Button */}
      <Button 
        variant="outline" 
        className="absolute top-4 left-4 text-white border-violet-500 hover:bg-violet-900"
        onClick={() => {
          setEmail("admin");
          setPassword("admin123");
        }}
      >
        Admin Access
      </Button>
      
      <div className="w-64 mb-8">
        <img 
          src="/lovable-uploads/78315fe2-71e1-49f4-9fff-b76e2ded5b01.png" 
          alt="Fair-Cut Logo" 
          className="w-full grayscale hover:grayscale-0 transition-all duration-300"
        />
      </div>
      
      <Card className="w-full max-w-md bg-black border border-violet-500 text-white">
        <CardHeader className="border-b border-violet-800">
          <CardTitle className="text-2xl text-center text-violet-400">
            {isSignUp ? "Create an Account" : "Welcome to Fair-Cut"}
          </CardTitle>
          <CardDescription className="text-center text-violet-300">
            {isSignUp ? "Sign up to book convenience fee-free tickets" : "Convenience fee-free movie tickets"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {isSignUp ? (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-violet-300">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-violet-950 border-violet-700 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-violet-300">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-violet-950 border-violet-700 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-violet-300">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-violet-950 border-violet-700 text-white pr-10"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-violet-700 hover:bg-violet-600" 
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Sign Up"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-violet-300">Email Address</Label>
                <Input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-violet-950 border-violet-700 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-violet-300">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-violet-950 border-violet-700 text-white pr-10"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-violet-700 hover:bg-violet-600" 
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
              <Button 
                type="button" 
                onClick={handleAdminLogin}
                variant="outline" 
                className="w-full mt-2 text-violet-400 border-violet-700"
              >
                Admin Login
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t border-violet-800 pt-4">
          <Button 
            type="button" 
            variant="link" 
            className="text-violet-400" 
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
