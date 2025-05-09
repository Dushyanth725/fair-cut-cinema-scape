
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

// Define proper types for seat and booking data
interface Seat {
  row: string;
  number: number;
  price: number;
  isSelected: boolean;
  isBooked: boolean;
}

interface BookingSeat {
  row: string;
  number: number;
}

interface Booking {
  id?: string;
  seats: BookingSeat[];
  showtime_id: string;
  total_amount: number;
  payment_status?: string;
  booking_date?: string;
  user_id?: string;
}

// Interface for raw booking data from Supabase
interface RawBooking {
  id: string;
  seats: Json;
  showtime_id: string;
  total_amount: number;
  payment_status: string | null;
  booking_date: string;
  user_id: string | null;
}

const SeatSelection = () => {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const [seats, setSeats] = useState<Seat[]>([]);
  const [showtime, setShowtime] = useState<any>(null);
  const [movie, setMovie] = useState<any>(null);
  const [theater, setTheater] = useState<any>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [numSeats, setNumSeats] = useState<number>(1);
  const [existingBookings, setExistingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShowtimeData = async () => {
      try {
        if (!showtimeId) return;

        // Fetch showtime data
        const { data: showtimeData, error: showtimeError } = await supabase
          .from('showtimes')
          .select('*, movies(*), theaters(*)')
          .eq('id', showtimeId)
          .single();

        if (showtimeError) throw showtimeError;

        setShowtime(showtimeData);
        setMovie(showtimeData.movies);
        setTheater(showtimeData.theaters);

        // Fetch existing bookings for this showtime
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('*')
          .eq('showtime_id', showtimeId);

        if (bookingsError) throw bookingsError;

        // Process and convert the raw bookings data to match our Booking interface
        const processedBookings: Booking[] = (bookingsData || []).map((rawBooking: RawBooking) => {
          // Parse the seats JSON if it's a string, or use as is if it's already an array
          let parsedSeats: BookingSeat[];
          if (typeof rawBooking.seats === 'string') {
            try {
              parsedSeats = JSON.parse(rawBooking.seats);
            } catch (e) {
              console.error('Error parsing seats JSON:', e);
              parsedSeats = [];
            }
          } else if (Array.isArray(rawBooking.seats)) {
            parsedSeats = rawBooking.seats as unknown as BookingSeat[];
          } else {
            parsedSeats = [];
          }

          return {
            id: rawBooking.id,
            seats: parsedSeats,
            showtime_id: rawBooking.showtime_id,
            total_amount: rawBooking.total_amount,
            payment_status: rawBooking.payment_status || undefined,
            booking_date: rawBooking.booking_date,
            user_id: rawBooking.user_id || undefined
          };
        });

        setExistingBookings(processedBookings);

        // Initialize seats
        generateSeats();
        setLoading(false);
      } catch (error: any) {
        toast.error(`Error loading showtime: ${error.message}`);
        setLoading(false);
      }
    };

    fetchShowtimeData();
  }, [showtimeId]);

  const generateSeats = () => {
    // Create a realistic theater layout
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'];
    const seatsPerRow = 12;
    const generatedSeats: Seat[] = [];

    rows.forEach((row) => {
      for (let i = 1; i <= seatsPerRow; i++) {
        // Set price based on row (front rows cheaper)
        const price = row === 'A' || row === 'B' ? 70 : 150;
        
        generatedSeats.push({
          row,
          number: i,
          price,
          isSelected: false,
          isBooked: checkIfSeatIsBooked(row, i)
        });
      }
    });

    setSeats(generatedSeats);
  };

  const checkIfSeatIsBooked = (row: string, number: number): boolean => {
    return existingBookings.some(booking => {
      if (Array.isArray(booking.seats)) {
        return booking.seats.some((seat: BookingSeat) => 
          seat.row === row && seat.number === number
        );
      }
      return false;
    });
  };

  const handleSeatClick = (selectedRow: string, selectedNumber: number) => {
    const seatIndex = seats.findIndex(
      seat => seat.row === selectedRow && seat.number === selectedNumber
    );

    if (seatIndex === -1 || seats[seatIndex].isBooked) return;

    const newSeats = [...seats];
    
    // If the seat is already selected, unselect it
    if (newSeats[seatIndex].isSelected) {
      newSeats[seatIndex].isSelected = false;
      setSeats(newSeats);
      
      // Update selected seats and total amount
      const updatedSelectedSeats = selectedSeats.filter(
        seat => !(seat.row === selectedRow && seat.number === selectedNumber)
      );
      setSelectedSeats(updatedSelectedSeats);
      setTotalAmount(calculateTotal(updatedSelectedSeats));
      return;
    }

    // If we're selecting more seats than numSeats, unselect the oldest one
    if (selectedSeats.length >= numSeats) {
      const oldestSeat = selectedSeats[0];
      const oldestIndex = seats.findIndex(
        seat => seat.row === oldestSeat.row && seat.number === oldestSeat.number
      );
      if (oldestIndex !== -1) {
        newSeats[oldestIndex].isSelected = false;
      }
      setSelectedSeats(selectedSeats.slice(1));
    }

    // Select the new seat
    newSeats[seatIndex].isSelected = true;
    setSeats(newSeats);
    
    const newSelectedSeats = [...selectedSeats, newSeats[seatIndex]];
    setSelectedSeats(newSelectedSeats);
    setTotalAmount(calculateTotal(newSelectedSeats));
  };

  const calculateTotal = (selectedSeats: Seat[]): number => {
    return selectedSeats.reduce((total, seat) => total + seat.price, 0);
  };

  const handleContinue = async () => {
    try {
      if (selectedSeats.length === 0) {
        toast.error("Please select at least one seat");
        return;
      }

      // Check if this is Light House Cinemas (has payment enabled)
      const hasPayment = theater?.has_payment_enabled;

      // Format seats data for booking
      const bookingSeats = selectedSeats.map(seat => ({
        row: seat.row,
        number: seat.number
      }));

      // Create booking in database
      const { data: user } = await supabase.auth.getUser();
      
      const bookingData = {
        showtime_id: showtimeId,
        seats: bookingSeats,
        total_amount: totalAmount,
        user_id: user?.user?.id,
        payment_status: 'pending'
      };

      const { data: booking, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();

      if (error) throw error;

      // Save booking details in localStorage for the payment and ticket pages
      localStorage.setItem('currentBooking', JSON.stringify({
        id: booking.id,
        showtimeId,
        theater: theater?.name,
        movie: movie?.title,
        date: showtime?.date,
        time: showtime?.time,
        screen: showtime?.screen,
        seats: bookingSeats,
        totalAmount,
      }));

      // Navigate to payment if Light House Cinemas, otherwise direct to ticket
      if (hasPayment) {
        navigate('/payment');
      } else {
        // For theaters without payment, mark as paid and go straight to ticket
        await supabase
          .from('bookings')
          .update({ payment_status: 'paid' })
          .eq('id', booking.id);
          
        navigate('/ticket');
      }
    } catch (error: any) {
      toast.error(`Error creating booking: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black bg-gradient-to-br from-black via-purple-950 to-violet-900">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black bg-gradient-to-br from-black via-purple-950 to-violet-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <img 
            src="/lovable-uploads/78315fe2-71e1-49f4-9fff-b76e2ded5b01.png" 
            alt="Fair-Cut Logo" 
            className="w-24 grayscale hover:grayscale-0 transition-all duration-300"
          />
          <div className="ml-4">
            <h2 className="text-xl font-bold text-white">{movie?.title}</h2>
            <p className="text-violet-300">{theater?.name} - {showtime?.date} {showtime?.time} - Screen {showtime?.screen}</p>
          </div>
        </div>

        <Card className="bg-black border border-violet-500 text-white mb-6">
          <CardHeader className="border-b border-violet-800">
            <CardTitle className="text-xl text-violet-400 flex items-center justify-between">
              <span>Select Your Seats</span>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setNumSeats(Math.max(1, numSeats - 1))}
                  className="h-8 w-8 p-0 text-violet-300 border-violet-700"
                  disabled={numSeats <= 1}
                >-</Button>
                <span>{numSeats} seat{numSeats > 1 ? 's' : ''}</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setNumSeats(Math.min(10, numSeats + 1))}
                  className="h-8 w-8 p-0 text-violet-300 border-violet-700"
                  disabled={numSeats >= 10}
                >+</Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex justify-center mb-8">
              <div className="w-3/4 h-2 bg-violet-600 rounded-lg"></div>
            </div>
            <div className="text-center mb-2 text-xs text-violet-400">SCREEN</div>

            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                <div className="grid grid-cols-12 gap-1 mb-6">
                  {seats.map((seat) => {
                    // Only show seat number at start of row
                    const showRowLabel = seats.findIndex(s => s.row === seat.row && s.number === seat.number) % 12 === 0;
                    
                    return (
                      <div key={`${seat.row}-${seat.number}`} className="relative text-center">
                        {showRowLabel && (
                          <div className="absolute -left-6 top-1 text-xs text-violet-400">
                            {seat.row}
                          </div>
                        )}
                        <button
                          onClick={() => handleSeatClick(seat.row, seat.number)}
                          disabled={seat.isBooked}
                          className={`w-8 h-8 text-xs rounded-t-md flex items-center justify-center transition-colors ${
                            seat.isBooked
                              ? 'bg-red-900 cursor-not-allowed opacity-50'
                              : seat.isSelected
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-violet-800 hover:bg-violet-700'
                          }`}
                        >
                          {seat.number}
                        </button>
                        <div className={`h-1 rounded-b-sm ${
                          seat.isBooked
                            ? 'bg-red-900 opacity-50'
                            : seat.isSelected
                            ? 'bg-green-600'
                            : 'bg-violet-700'
                        }`}>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-center mb-8 space-x-8">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-violet-800 mr-2"></div>
                <span className="text-sm text-violet-300">Available</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-600 mr-2"></div>
                <span className="text-sm text-violet-300">Selected</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-900 opacity-50 mr-2"></div>
                <span className="text-sm text-violet-300">Booked</span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center border-t border-violet-800 pt-4 mt-4">
              <div>
                <p className="text-violet-300 mb-1">Selected Seats:</p>
                <p className="text-white font-semibold">
                  {selectedSeats.length > 0
                    ? selectedSeats
                        .sort((a, b) => a.row.localeCompare(b.row) || a.number - b.number)
                        .map(seat => `${seat.row}${seat.number}`)
                        .join(', ')
                    : 'None'}
                </p>
              </div>
              <div className="mt-4 md:mt-0 text-right">
                <p className="text-violet-300 mb-1">Total Amount:</p>
                <p className="text-white text-2xl font-bold">₹{totalAmount}</p>
                <p className="text-green-400 text-xs">No convenience fee!</p>
              </div>
            </div>

            <Button 
              onClick={handleContinue}
              className="w-full mt-6 bg-violet-700 hover:bg-violet-600"
              disabled={selectedSeats.length === 0}
            >
              {theater?.has_payment_enabled ? 'Proceed to Payment' : 'Confirm Booking'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SeatSelection;
