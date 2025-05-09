
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const LocationAccess = () => {
  const [loading, setLoading] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if location is already stored
    const savedLocation = localStorage.getItem("userLocation");
    if (savedLocation) {
      setLocationGranted(true);
      setLocation(savedLocation);
    }
  }, []);

  const handleRequestLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Just store that user granted permission; we're not using actual coords in this demo
          localStorage.setItem("userLocation", "Location access granted");
          setLocationGranted(true);
          setLocation("Location access granted");
          toast.success("Location access granted!");
          setLoading(false);
        },
        (error) => {
          toast.error("Error accessing location. Please try again.");
          setLoading(false);
          console.error("Error getting location:", error);
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
      setLoading(false);
    }
  };

  const handleSearchLocation = () => {
    navigate('/cities');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black bg-gradient-to-br from-black via-purple-950 to-violet-900 p-4">
      <img 
        src="/lovable-uploads/78315fe2-71e1-49f4-9fff-b76e2ded5b01.png" 
        alt="Fair-Cut Logo" 
        className="w-48 mb-8"
      />
      
      <Card className="w-full max-w-md bg-black border border-violet-500 text-white">
        <CardHeader className="border-b border-violet-800">
          <CardTitle className="text-2xl text-center text-violet-400">
            {locationGranted ? "Location Access" : "Allow Location Access"}
          </CardTitle>
          <CardDescription className="text-center text-violet-300">
            {locationGranted 
              ? "Great! Now you can find theaters near you" 
              : "We need your location to find theaters near you"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {!locationGranted ? (
            <div className="text-center">
              <div className="mb-6 text-violet-300">
                <p>Fair-cut needs access to your location to show nearby theaters offering convenience fee-free tickets.</p>
              </div>
              <Button 
                onClick={handleRequestLocation} 
                className="w-full bg-violet-700 hover:bg-violet-600"
                disabled={loading}
              >
                {loading ? "Requesting..." : "Allow Location Access"}
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-violet-700 rounded-full mx-auto flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-green-400">Location access granted</p>
              </div>
              <Button 
                onClick={handleSearchLocation} 
                className="w-full bg-violet-700 hover:bg-violet-600"
              >
                Find Theaters Near Me
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationAccess;
