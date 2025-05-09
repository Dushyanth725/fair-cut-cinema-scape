
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
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

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        // Login with email
        const { error } = await supabase.auth.signInWithOtp({
          email,
        });
        if (error) throw error;
        toast.success("OTP sent to your email!");
      } else {
        // Login with phone
        const { error } = await supabase.auth.signInWithOtp({
          phone,
        });
        if (error) throw error;
        toast.success("OTP sent to your phone!");
      }
      setOtpSent(true);
    } catch (error: any) {
      toast.error(error.message || "Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: isLogin ? email : undefined,
        phone: !isLogin ? phone : undefined,
        token: otp,
        type: 'sms',
      });
      if (error) throw error;
      toast.success("Login successful!");
      navigate('/location');
    } catch (error: any) {
      toast.error(error.message || "Error verifying OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "admin" && otp === "admin123") {
      toast.success("Admin login successful!");
      navigate('/admin');
    } else {
      toast.error("Invalid admin credentials");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black bg-gradient-to-br from-black via-purple-950 to-violet-900 p-4">
      <img 
        src="/lovable-uploads/78315fe2-71e1-49f4-9fff-b76e2ded5b01.png" 
        alt="Fair-Cut Logo" 
        className="w-64 mb-8"
      />
      
      <Card className="w-full max-w-md bg-black border border-violet-500 text-white">
        <CardHeader className="border-b border-violet-800">
          <CardTitle className="text-2xl text-center text-violet-400">
            {otpSent ? "Verify OTP" : "Welcome to Fair-Cut"}
          </CardTitle>
          <CardDescription className="text-center text-violet-300">
            {otpSent ? "Enter the OTP sent to your contact" : "Convenience fee-free movie tickets"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="flex justify-center gap-4 mb-4">
                <Button
                  type="button"
                  variant="outline"
                  className={`w-1/2 ${isLogin ? 'bg-violet-800 text-white' : 'bg-transparent text-violet-400'}`}
                  onClick={() => setIsLogin(true)}
                >
                  Email
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={`w-1/2 ${!isLogin ? 'bg-violet-800 text-white' : 'bg-transparent text-violet-400'}`}
                  onClick={() => setIsLogin(false)}
                >
                  Phone
                </Button>
              </div>
              
              {isLogin ? (
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-violet-300 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 rounded-md bg-violet-950 border border-violet-700 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    required
                    placeholder="Enter your email"
                  />
                </div>
              ) : (
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-violet-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-3 rounded-md bg-violet-950 border border-violet-700 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    required
                    placeholder="Enter your phone number with country code"
                  />
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-violet-700 hover:bg-violet-600" 
                disabled={loading}
              >
                {loading ? "Sending..." : "Send OTP"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-violet-300 mb-1">
                  One-Time Password
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full p-3 rounded-md bg-violet-950 border border-violet-700 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                  placeholder="Enter OTP"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-violet-700 hover:bg-violet-600" 
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
              {isLogin && (
                <Button 
                  type="button" 
                  onClick={handleAdminLogin}
                  variant="outline" 
                  className="w-full mt-2 text-violet-400 border-violet-700"
                >
                  Admin Login
                </Button>
              )}
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t border-violet-800 pt-4">
          {otpSent && (
            <Button 
              type="button" 
              variant="link" 
              className="text-violet-400" 
              onClick={() => setOtpSent(false)}
            >
              Back to login
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
