
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

// Interface for the booking data
interface BookingDetails {
  id: string;
  showtimeId: string;
  theater: string;
  movie: string;
  date: string;
  time: string;
  screen: string;
  seats: { row: string; number: number }[];
  totalAmount: number;
}

const Payment = () => {
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get booking details from localStorage
    const storedBooking = localStorage.getItem('currentBooking');
    if (storedBooking) {
      setBookingDetails(JSON.parse(storedBooking));
    } else {
      toast.error("Booking details not found");
      navigate("/theaters");
    }
  }, [navigate]);

  const handlePayment = async (method: string) => {
    if (!bookingDetails) return;
    
    setLoading(true);
    try {
      // For this demo, we'll just simulate a successful payment
      // In a real app, you would integrate with Razorpay using the test key
      
      // Update booking status to paid
      const { error } = await supabase
        .from('bookings')
        .update({ payment_status: 'paid' })
        .eq('id', bookingDetails.id);
      
      if (error) throw error;
      
      toast.success(`Payment successful via ${method}!`);
      navigate('/ticket');
    } catch (error: any) {
      toast.error(`Payment failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!bookingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black bg-gradient-to-br from-black via-purple-950 to-violet-900">
        <div className="text-white text-2xl">Loading booking details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black bg-gradient-to-br from-black via-purple-950 to-violet-900 p-4">
      <div className="max-w-md mx-auto pt-8">
        <div className="flex justify-center mb-8">
          <img 
            src="/lovable-uploads/78315fe2-71e1-49f4-9fff-b76e2ded5b01.png" 
            alt="Fair-Cut Logo" 
            className="w-40 grayscale hover:grayscale-0 transition-all duration-300"
          />
        </div>
        
        <Card className="bg-black border border-violet-500 text-white mb-6">
          <CardHeader className="border-b border-violet-800">
            <CardTitle className="text-xl text-violet-400">
              Complete Your Payment
            </CardTitle>
            <CardDescription className="text-violet-300">
              Light House Cinemas • Secure Payment
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="border border-violet-800 rounded-md p-4 mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">{bookingDetails.movie}</h3>
              <div className="text-violet-300 space-y-1 text-sm">
                <p>{bookingDetails.theater}</p>
                <p>Date: {bookingDetails.date} • Time: {bookingDetails.time}</p>
                <p>Screen: {bookingDetails.screen}</p>
                <p>
                  Seats: {bookingDetails.seats
                    .sort((a, b) => a.row.localeCompare(b.row) || a.number - b.number)
                    .map(seat => `${seat.row}${seat.number}`)
                    .join(', ')}
                </p>
              </div>
              <div className="border-t border-violet-800 mt-4 pt-4">
                <div className="flex justify-between">
                  <span className="text-violet-300">Ticket Price:</span>
                  <span className="text-white">₹{bookingDetails.totalAmount}</span>
                </div>
                <div className="flex justify-between text-green-400">
                  <span>Convenience Fee:</span>
                  <span>₹0</span>
                </div>
                <div className="flex justify-between mt-2 text-lg font-bold">
                  <span className="text-violet-300">Total Amount:</span>
                  <span className="text-white">₹{bookingDetails.totalAmount}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-violet-300 font-medium">Select Payment Method</h3>
              
              <Button 
                onClick={() => handlePayment('Credit/Debit Card')}
                className="w-full bg-violet-800 hover:bg-violet-700 justify-start"
                disabled={loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Credit/Debit Card
              </Button>
              
              <Button 
                onClick={() => handlePayment('UPI')}
                className="w-full bg-violet-800 hover:bg-violet-700 justify-start"
                disabled={loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                UPI Payment
              </Button>
              
              <Button 
                onClick={() => handlePayment('QR Code')}
                className="w-full bg-violet-800 hover:bg-violet-700 justify-start"
                disabled={loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                QR Code Payment
              </Button>
            </div>
            
            <div className="mt-6 text-center text-xs text-violet-400">
              <p>This is a test payment environment.</p>
              <p>No actual payment will be processed.</p>
              <p>Test Key ID: rzp_test_1v4w1diaSwnTNf</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Payment;
