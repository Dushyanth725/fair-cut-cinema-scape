
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface Movie {
  id: string;
  title: string;
  poster: string;
  description: string;
}

const MovieList = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const { theaterId } = useParams();
  const navigate = useNavigate();
  
  const theaterJson = localStorage.getItem("selectedTheater");
  const theater = theaterJson ? JSON.parse(theaterJson) : null;

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const { data, error } = await supabase
          .from('movies')
          .select('*');
        
        if (error) throw error;
        
        if (data) {
          setMovies(data);
        }
      } catch (error) {
        console.error("Error fetching movies:", error);
        toast.error("Failed to load movies");
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [theaterId]);

  const handleSelectMovie = (movie: Movie) => {
    localStorage.setItem("selectedMovie", JSON.stringify(movie));
    navigate(`/showtimes/${theaterId}/${movie.id}`);
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
            {theater?.name || 'Movies'}
          </h1>
          <p className="text-center text-violet-300 mt-1">
            Select a movie to continue
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-t-violet-500 border-r-transparent border-b-violet-500 border-l-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {movies.length > 0 ? (
              movies.map((movie) => (
                <Card 
                  key={movie.id}
                  className="bg-black border border-violet-500 text-white overflow-hidden hover:border-violet-400 transition-all cursor-pointer"
                  onClick={() => handleSelectMovie(movie)}
                >
                  <div className="relative h-60">
                    <img 
                      src={movie.poster || 'https://via.placeholder.com/300x450?text=No+Poster'} 
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg text-white line-clamp-1">{movie.title}</h3>
                    <p className="text-violet-300 text-sm line-clamp-2 mt-1">{movie.description}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center text-violet-300 py-6 bg-black bg-opacity-50 rounded-lg border border-violet-800 col-span-full">
                No movies available at this theater
              </div>
            )}
          </div>
        )}
        
        <div className="mt-6">
          <Button 
            variant="outline" 
            className="w-full border-violet-500 text-violet-300"
            onClick={() => navigate('/theaters')}
          >
            Back to Theaters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MovieList;
