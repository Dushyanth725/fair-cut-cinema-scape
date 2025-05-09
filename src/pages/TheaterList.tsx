
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface Theater {
  id: string;
  name: string;
  location: string;
  image: string;
  has_payment_enabled: boolean;
}

const TheaterList = () => {
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const selectedCity = localStorage.getItem("selectedCity") || "Chennai";

  useEffect(() => {
    const fetchTheaters = async () => {
      try {
        const { data, error } = await supabase
          .from('theaters')
          .select('*');
        
        if (error) throw error;
        
        if (data) {
          setTheaters(data);
        }
      } catch (error) {
        console.error("Error fetching theaters:", error);
        toast.error("Failed to load theaters");
      } finally {
        setLoading(false);
      }
    };

    fetchTheaters();
  }, []);

  const handleSelectTheater = (theater: Theater) => {
    localStorage.setItem("selectedTheater", JSON.stringify(theater));
    navigate(`/movies/${theater.id}`);
  };

  return (
    <div className="min-h-screen bg-black bg-gradient-to-br from-black via-purple-950 to-violet-900 p-4">
      <div className="max-w-md mx-auto pt-6">
        <div className="flex justify-center mb-6">
          <img 
            src="/lovable-uploads/78315fe2-71e1-49f4-9fff-b76e2ded5b01.png" 
            alt="Fair-Cut Logo" 
            className="w-32"
          />
        </div>
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-center text-white">
            Theaters in {selectedCity}
          </h1>
          <p className="text-center text-violet-300 mt-2">
            Theaters offering convenience fee-free tickets
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-t-violet-500 border-r-transparent border-b-violet-500 border-l-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {theaters.length > 0 ? (
              theaters.map((theater) => (
                <Card 
                  key={theater.id}
                  className="bg-black border border-violet-500 text-white overflow-hidden"
                  onClick={() => handleSelectTheater(theater)}
                >
                  <div className="relative h-36">
                    <img 
                      src={theater.image} 
                      alt={theater.name}
                      className="w-full h-full object-cover"
                    />
                    {theater.name === "Light House Cinemas" && (
                      <div className="absolute top-2 right-2 bg-green-600 text-xs font-bold px-2 py-1 rounded-full">
                        FAIR-CUT PARTNER
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-white">{theater.name}</h3>
                        <p className="text-violet-300 text-sm">{theater.location}</p>
                      </div>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="border-violet-500 text-violet-300 hover:bg-violet-900"
                      >
                        Select
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center text-violet-300 py-6 bg-black bg-opacity-50 rounded-lg border border-violet-800">
                No theaters available in this city yet
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TheaterList;
