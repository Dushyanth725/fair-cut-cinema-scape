
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface Seat {
  id: string;
  row: string;
  number: number;
  price: number;
  isSelected: boolean;
  isBooked: boolean;
}

interface Booking {
  showtime_id: string;
  seats: { row: string; number: number }[];
}

const SeatSelection = () => {
  const [seats, setSeats] = useState<Seat[][]>([]);
  const [numSeats, setNumSeats] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  
  const showtimeJson = localStorage.getItem("selectedShowtime");
  const showtime = showtimeJson ? JSON.parse(showtimeJson) : null;
  
  const movieJson = localStorage.getItem("selectedMovie");
  const movie = movieJson ? JSON.parse(movieJson) : null;
  
  const theaterJson = localStorage.getItem("selectedTheater");
  const theater = theaterJson ? JSON.parse(theaterJson) : null;

  // Generate seats layout
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('seats, showtime_id')
          .eq('showtime_id', showtimeId);
        
        if (error) throw error;
        
        if (data) {
          setBookings(data);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
      
      generateSeats();
      setLoading(false);
    };

    fetchBookings();
  }, [showtimeId]);

  const generateSeats = () => {
    // Create a theater layout
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const seatsPerRow = 20;
    const seatsArray: Seat[][] = [];
    
    rows.forEach((row, rowIndex) => {
      const rowSeats: Seat[] = [];
      for (let i = 1; i <= seatsPerRow; i++) {
        // Check if seat is already booked
        const isBooked = bookings.some(booking => 
          booking.seats.some(seat => seat.row === row && seat.number === i)
        );
        
        // Premium seats are all rows except A and B (which are budget seats)
        const isPremiumSeat = row !== 'A' && row !== 'B';
        const price = isPremiumSeat ? 150 : 70;
        
        rowSeats.push({
          id: `${row}${i}`,
          row,
          number: i,
          price,
          isSelected: false,
          isBooked
        });
      }
      seatsArray.push(rowSeats);
    });
    
    setSeats(seatsArray);
  };

  const handleSeatClick = (clickedSeat: Seat) => {
    if (clickedSeat.isBooked) return;
    
    // Define a new array to hold updated seats
    const updatedSeats = seats.map(row => 
      row.map(seat => ({
        ...seat,
        isSelected: false // Reset all seats first
      }))
    );
    
    // Find the clicked seat in our updated array
    let selectedRow = -1;
    let selectedSeatIndex = -1;
    
    updatedSeats.forEach((row, rowIndex) => {
      row.forEach((seat, seatIndex) => {
        if (seat.id === clickedSeat.id) {
          selectedRow = rowIndex;
          selectedSeatIndex = seatIndex;
        }
      });
    });
    
    if (selectedRow === -1) return;
    
    // Select required number of seats starting from clicked seat
    const newSelectedSeats = [];
    for (let i = 0; i < numSeats; i++) {
      if (selectedSeatIndex + i < updatedSeats[selectedRow].length && 
          !updatedSeats[selectedRow][selectedSeatIndex + i].isBooked) {
        updatedSeats[selectedRow][selectedSeatIndex + i].isSelected = true;
        newSelectedSeats.push(updatedSeats[selectedRow][selectedSeatIndex + i]);
      }
    }
    
    // Update state only if we can select the required number of seats
    if (newSelectedSeats.length === numSeats) {
      setSeats(updatedSeats);
      setSelectedSeats(newSelectedSeats);
    } else {
      toast.error(`Cannot select ${numSeats} consecutive seats from this position`);
    }
  };

  const getTotalAmount = () => {
    return selectedSeats.reduce((total, seat) => total + seat.price, 0);
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      toast.error("Please select seats to continue");
      return;
    }
    
    const bookingDetails = {
      movie: movie,
      theater: theater,
      showtime: showtime,
      seats: selectedSeats,
      totalAmount: getTotalAmount()
    };
    
    localStorage.setItem("bookingDetails", JSON.stringify(bookingDetails));
    navigate('/payment');
  };

  return (
    <div className="min-h-screen bg-black bg-gradient-to-br from-black via-purple-950 to-violet-900 p-4">
      <div className="max-w-4xl mx-auto pt-4">
        <div className="flex justify-center mb-4">
          <img 
            src="/lovable-uploads/78315fe2-71e1-49f4-9fff-b76e2ded5b01.png" 
            alt="Fair-Cut Logo" 
            className="w-24"
          />
        </div>
        
        <Card className="bg-black border border-violet-500 text-white mb-4">
          <CardHeader className="py-3 px-4 border-b border-violet-800">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg text-white">
                  {movie?.title || 'Movie Title'}
                </CardTitle>
                <CardDescription className="text-violet-300">
                  {theater?.name || 'Theater'} | Screen {showtime?.screen} | {showtime?.time}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm text-violet-300">Select seats</div>
                <select
                  value={numSeats}
                  onChange={(e) => setNumSeats(parseInt(e.target.value))}
                  className="bg-violet-900 border border-violet-700 rounded px-2 py-1 text-white text-sm"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <option key={num} value={num}>{num} seat{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-12 h-12 border-4 border-t-violet-500 border-r-transparent border-b-violet-500 border-l-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div>
                {/* Screen indicator */}
                <div className="relative mb-8">
                  <div className="h-2 bg-gray-600 rounded-lg w-3/4 mx-auto mb-1"></div>
                  <div className="text-center text-gray-400 text-xs">SCREEN</div>
                </div>
                
                {/* Seat layout */}
                <div className="overflow-x-auto pb-4">
                  <div className="min-w-max">
                    {seats.map((row, rowIndex) => (
                      <div key={rowIndex} className="flex mb-1">
                        <div className="w-6 flex items-center justify-center text-violet-400 text-sm font-bold pr-2">
                          {row[0]?.row}
                        </div>
                        <div className="flex gap-1">
                          {row.map((seat) => (
                            <button
                              key={seat.id}
                              disabled={seat.isBooked}
                              onClick={() => handleSeatClick(seat)}
                              className={`w-6 h-6 flex items-center justify-center text-xs rounded-sm transition-colors ${
                                seat.isBooked
                                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                  : seat.isSelected
                                  ? 'bg-green-500 text-white'
                                  : seat.price === 70
                                  ? 'bg-amber-700 hover:bg-amber-600 text-white'
                                  : 'bg-violet-700 hover:bg-violet-600 text-white'
                              }`}
                              title={`${seat.row}${seat.number} - ₹${seat.price}`}
                            >
                              {seat.number}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Seat type indicators */}
                <div className="flex justify-center gap-6 mt-4 mb-2 text-sm">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-violet-700 rounded-sm mr-2"></div>
                    <span className="text-violet-300">Premium (₹150)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-amber-700 rounded-sm mr-2"></div>
                    <span className="text-violet-300">Budget (₹70)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded-sm mr-2"></div>
                    <span className="text-violet-300">Selected</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gray-700 rounded-sm mr-2"></div>
                    <span className="text-violet-300">Booked</span>
                  </div>
                </div>
                
                {/* Selected seats summary */}
                {selectedSeats.length > 0 && (
                  <div className="mt-6 p-4 border border-violet-700 rounded-md bg-violet-950 bg-opacity-50">
                    <div className="text-white font-semibold mb-2">Selected Seats</div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedSeats.map((seat) => (
                        <div key={seat.id} className="px-2 py-1 bg-green-600 text-white rounded text-sm">
                          {seat.row}{seat.number} - ₹{seat.price}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between border-t border-violet-700 pt-3 mt-2">
                      <div className="text-violet-300">Total Amount:</div>
                      <div className="text-white font-bold">₹{getTotalAmount()}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1 border-violet-500 text-violet-300"
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
          
          <Button 
            className="flex-1 bg-violet-700 hover:bg-violet-600 text-white"
            onClick={handleContinue}
            disabled={selectedSeats.length === 0}
          >
            Continue to Payment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
