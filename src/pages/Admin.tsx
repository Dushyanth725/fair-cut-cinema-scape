
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Movie {
  id?: string;
  title: string;
  poster: string;
  description: string;
}

interface Theater {
  id: string;
  name: string;
  location: string;
  image: string;
  has_payment_enabled: boolean;
}

interface Showtime {
  id?: string;
  movie_id: string;
  theater_id: string;
  date: string;
  time: string;
  screen: string;
}

const Admin = () => {
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // New movie form state
  const [newMovie, setNewMovie] = useState<Movie>({
    title: "",
    poster: "",
    description: ""
  });
  
  // New showtime form state
  const [newShowtime, setNewShowtime] = useState<Showtime>({
    movie_id: "",
    theater_id: "",
    date: new Date().toISOString().split('T')[0], // Today
    time: "",
    screen: ""
  });
  
  useEffect(() => {
    fetchTheaters();
    fetchMovies();
  }, []);
  
  const fetchTheaters = async () => {
    try {
      const { data, error } = await supabase
        .from('theaters')
        .select('*');
      
      if (error) throw error;
      
      if (data) {
        setTheaters(data);
        if (data.length > 0) {
          setNewShowtime(prev => ({ ...prev, theater_id: data[0].id }));
        }
      }
    } catch (error) {
      console.error("Error fetching theaters:", error);
      toast.error("Failed to load theaters");
    }
  };
  
  const fetchMovies = async () => {
    try {
      const { data, error } = await supabase
        .from('movies')
        .select('*');
      
      if (error) throw error;
      
      if (data) {
        setMovies(data);
        if (data.length > 0) {
          setNewShowtime(prev => ({ ...prev, movie_id: data[0].id }));
        }
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
      toast.error("Failed to load movies");
    }
  };
  
  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('movies')
        .insert([newMovie])
        .select();
      
      if (error) throw error;
      
      toast.success(`Movie "${newMovie.title}" added successfully`);
      setNewMovie({ title: "", poster: "", description: "" });
      fetchMovies();
    } catch (error) {
      console.error("Error adding movie:", error);
      toast.error("Failed to add movie");
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddShowtime = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('showtimes')
        .insert([newShowtime]);
      
      if (error) throw error;
      
      toast.success(`Showtime added successfully`);
      setNewShowtime({
        ...newShowtime,
        time: "",
        screen: ""
      });
    } catch (error) {
      console.error("Error adding showtime:", error);
      toast.error("Failed to add showtime");
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = () => {
    navigate('/login');
    toast.success("Admin logged out");
  };

  return (
    <div className="min-h-screen bg-black bg-gradient-to-br from-black via-purple-950 to-violet-900 p-4">
      <div className="max-w-4xl mx-auto pt-6">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/78315fe2-71e1-49f4-9fff-b76e2ded5b01.png" 
              alt="Fair-Cut Logo" 
              className="w-24"
            />
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-violet-300">Manage movies, showtimes, and theaters</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="border-violet-500 text-violet-300"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
        
        <Tabs defaultValue="movies" className="w-full">
          <TabsList className="bg-violet-900 w-full mb-6">
            <TabsTrigger value="movies" className="flex-1">Movies</TabsTrigger>
            <TabsTrigger value="showtimes" className="flex-1">Showtimes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="movies">
            <Card className="bg-black border border-violet-500 text-white mb-6">
              <CardHeader>
                <CardTitle className="text-xl text-violet-400">
                  Add New Movie
                </CardTitle>
                <CardDescription className="text-violet-300">
                  Add a new movie to the database
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddMovie} className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-violet-300 mb-1">
                      Movie Title
                    </label>
                    <input
                      id="title"
                      value={newMovie.title}
                      onChange={(e) => setNewMovie({...newMovie, title: e.target.value})}
                      className="w-full p-3 rounded-md bg-violet-950 border border-violet-700 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="poster" className="block text-sm font-medium text-violet-300 mb-1">
                      Poster URL
                    </label>
                    <input
                      id="poster"
                      value={newMovie.poster}
                      onChange={(e) => setNewMovie({...newMovie, poster: e.target.value})}
                      className="w-full p-3 rounded-md bg-violet-950 border border-violet-700 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-violet-300 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={newMovie.description}
                      onChange={(e) => setNewMovie({...newMovie, description: e.target.value})}
                      className="w-full p-3 rounded-md bg-violet-950 border border-violet-700 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                      rows={3}
                      required
                    ></textarea>
                  </div>
                  
                  <Button 
                    type="submit"
                    className="bg-violet-700 hover:bg-violet-600 text-white"
                    disabled={loading}
                  >
                    {loading ? "Adding..." : "Add Movie"}
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {movies.map(movie => (
                <Card 
                  key={movie.id}
                  className="bg-black border border-violet-500 text-white overflow-hidden"
                >
                  {movie.poster && (
                    <div className="h-40 overflow-hidden">
                      <img 
                        src={movie.poster} 
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <h3 className="font-bold text-white">{movie.title}</h3>
                    <p className="text-violet-300 text-sm line-clamp-2 mt-1">
                      {movie.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="showtimes">
            <Card className="bg-black border border-violet-500 text-white mb-6">
              <CardHeader>
                <CardTitle className="text-xl text-violet-400">
                  Add New Showtime
                </CardTitle>
                <CardDescription className="text-violet-300">
                  Schedule a movie screening
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddShowtime} className="space-y-4">
                  <div>
                    <label htmlFor="movie" className="block text-sm font-medium text-violet-300 mb-1">
                      Movie
                    </label>
                    <select
                      id="movie"
                      value={newShowtime.movie_id}
                      onChange={(e) => setNewShowtime({...newShowtime, movie_id: e.target.value})}
                      className="w-full p-3 rounded-md bg-violet-950 border border-violet-700 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                      required
                    >
                      {movies.map(movie => (
                        <option key={movie.id} value={movie.id}>{movie.title}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="theater" className="block text-sm font-medium text-violet-300 mb-1">
                      Theater
                    </label>
                    <select
                      id="theater"
                      value={newShowtime.theater_id}
                      onChange={(e) => setNewShowtime({...newShowtime, theater_id: e.target.value})}
                      className="w-full p-3 rounded-md bg-violet-950 border border-violet-700 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                      required
                    >
                      {theaters.map(theater => (
                        <option key={theater.id} value={theater.id}>{theater.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-violet-300 mb-1">
                        Date
                      </label>
                      <input
                        id="date"
                        type="date"
                        value={newShowtime.date}
                        onChange={(e) => setNewShowtime({...newShowtime, date: e.target.value})}
                        className="w-full p-3 rounded-md bg-violet-950 border border-violet-700 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="time" className="block text-sm font-medium text-violet-300 mb-1">
                        Time
                      </label>
                      <input
                        id="time"
                        type="text"
                        placeholder="e.g. 19:30"
                        value={newShowtime.time}
                        onChange={(e) => setNewShowtime({...newShowtime, time: e.target.value})}
                        className="w-full p-3 rounded-md bg-violet-950 border border-violet-700 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="screen" className="block text-sm font-medium text-violet-300 mb-1">
                      Screen
                    </label>
                    <select
                      id="screen"
                      value={newShowtime.screen}
                      onChange={(e) => setNewShowtime({...newShowtime, screen: e.target.value})}
                      className="w-full p-3 rounded-md bg-violet-950 border border-violet-700 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                      required
                    >
                      <option value="">Select screen</option>
                      <option value="1">Screen 1</option>
                      <option value="2">Screen 2</option>
                    </select>
                  </div>
                  
                  <Button 
                    type="submit"
                    className="bg-violet-700 hover:bg-violet-600 text-white"
                    disabled={loading}
                  >
                    {loading ? "Adding..." : "Add Showtime"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
