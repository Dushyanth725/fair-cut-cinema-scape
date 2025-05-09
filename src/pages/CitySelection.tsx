
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const CitySelection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  
  const cities = [
    "Chennai", "Mumbai", "Delhi", "Bangalore", "Hyderabad", 
    "Kolkata", "Ahmedabad", "Pune", "Jaipur", "Lucknow",
    "Coimbatore", "Madurai", "Trichy", "Salem", "Erode"
  ];
  
  const filteredCities = searchTerm.trim() === "" 
    ? cities.slice(0, 5) 
    : cities.filter(city => 
        city.toLowerCase().includes(searchTerm.toLowerCase())
      );
  
  const handleSelectCity = (city: string) => {
    localStorage.setItem("selectedCity", city);
    toast.success(`Selected city: ${city}`);
    navigate("/theaters");
  };

  return (
    <div className="min-h-screen bg-black bg-gradient-to-br from-black via-purple-950 to-violet-900 p-4">
      <div className="max-w-md mx-auto pt-8">
        <div className="flex justify-center mb-8">
          <img 
            src="/lovable-uploads/78315fe2-71e1-49f4-9fff-b76e2ded5b01.png" 
            alt="Fair-Cut Logo" 
            className="w-40"
          />
        </div>
        
        <Card className="bg-black border border-violet-500 text-white">
          <CardHeader className="border-b border-violet-800">
            <CardTitle className="text-2xl text-center text-violet-400">
              Select Your City
            </CardTitle>
            <CardDescription className="text-center text-violet-300">
              Find theaters offering convenience fee-free tickets
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-6">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for your city..."
                className="w-full p-3 rounded-md bg-violet-950 border border-violet-700 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            
            <div className="space-y-2">
              {filteredCities.length > 0 ? (
                filteredCities.map((city) => (
                  <Button
                    key={city}
                    variant="outline"
                    className="w-full justify-start text-left text-violet-200 bg-violet-950 hover:bg-violet-900 border border-violet-700"
                    onClick={() => handleSelectCity(city)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {city}
                  </Button>
                ))
              ) : (
                <div className="text-center text-violet-300 py-4">
                  No cities found matching your search
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CitySelection;
