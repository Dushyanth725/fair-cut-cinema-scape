
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface Showtime {
  id: string;
  movie_id: string;
  theater_id: string;
  date: string;
  time: string;
  screen: string;
}

const ShowtimeList = () => {
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const { theaterId, movieId } = useParams();
  const navigate = useNavigate();
  
  const movieJson = localStorage.getItem("selectedMovie");
  const movie = movieJson ? JSON.parse(movieJson) : null;

  useEffect(() => {
    const fetchShowtimes = async () => {
      try {
        const { data, error } = await supabase
          .from('showtimes')
          .select('*')
          .eq('movie_id', movieId)
          .eq('theater_id', theaterId);
        
        if (error) throw error;
        
        if (data) {
          setShowtimes(data);
        }
      } catch (error) {
        console.error("Error fetching showtimes:", error);
        toast.error("Failed to load showtimes");
      } finally {
        setLoading(false);
      }
    };

    fetchShowtimes();
  }, [theaterId, movieId]);

  const handleSelectShowtime = (showtime: Showtime) => {
    localStorage.setItem("selectedShowtime", JSON.stringify(showtime));
    navigate(`/seats/${showtime.id}`);
  };

  // Group showtimes by date
  const groupedShowtimes = showtimes.reduce((acc, showtime) => {
    const date = showtime.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(showtime);
    return acc;
  }, {} as Record<string, Showtime[]>);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
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
          <div className="flex items-center space-x-4">
            {movie?.poster && (
              <img 
                src={movie.poster} 
                alt={movie.title}
                className="w-20 h-30 object-cover rounded"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-white">
                {movie?.title || 'Movie'}
              </h1>
              <p className="text-violet-300 text-sm mt-1">
                Select showtime to continue
              </p>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-t-violet-500 border-r-transparent border-b-violet-500 border-l-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.keys(groupedShowtimes).length > 0 ? (
              Object.entries(groupedShowtimes).map(([date, dateShowtimes]) => (
                <Card 
                  key={date}
                  className="bg-black border border-violet-500 text-white overflow-hidden"
                >
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg text-violet-300 mb-3">
                      {formatDate(date)}
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {dateShowtimes.map((showtime) => (
                        <Button 
                          key={showtime.id}
                          variant="outline"
                          className="border-violet-600 bg-violet-950 hover:bg-violet-900"
                          onClick={() => handleSelectShowtime(showtime)}
                        >
                          <div className="text-center w-full">
                            <div className="text-white">{showtime.time}</div>
                            <div className="text-xs text-violet-300">Screen {showtime.screen}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center text-violet-300 py-6 bg-black bg-opacity-50 rounded-lg border border-violet-800">
                No showtimes available for this movie
              </div>
            )}
          </div>
        )}
        
        <div className="mt-6">
          <Button 
            variant="outline" 
            className="w-full border-violet-500 text-violet-300"
            onClick={() => navigate(`/movies/${theaterId}`)}
          >
            Back to Movies
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShowtimeList;
