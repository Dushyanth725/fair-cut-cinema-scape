
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Payment = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const bookingDetailsJson = localStorage.getItem("bookingDetails");
  const bookingDetails = bookingDetailsJson ? JSON.parse(bookingDetailsJson) : null;

  useEffect(() => {
    if (!bookingDetails) {
      navigate('/');
      return;
    }

    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [bookingDetails, navigate]);

  const handlePayment = () => {
    if (!bookingDetails) return;

    setLoading(true);
    
    // Check if the theater has payment enabled (only Light House Cinemas for now)
    if (bookingDetails.theater.name !== "Light House Cinemas") {
      // For demo theaters, just show success and skip actual payment
      saveBooking();
      toast.success("Demo booking successful!");
      navigate('/ticket');
      return;
    }
    
    // For Light House Cinemas, use Razorpay
    const options = {
      key: "rzp_test_1v4w1diaSwnTNf", // Test key from your requirements
      amount: bookingDetails.totalAmount * 100, // Razorpay amount is in paise
      currency: "INR",
      name: "Fair-Cut",
      description: `Tickets for ${bookingDetails.movie.title}`,
      image: "/lovable-uploads/78315fe2-71e1-49f4-9fff-b76e2ded5b01.png",
      handler: function(response: any) {
        // Payment successful
        saveBooking(response.razorpay_payment_id);
        toast.success("Payment successful!");
        navigate('/ticket');
      },
      prefill: {
        name: "Fair-Cut Customer",
      },
      theme: {
        color: "#7e22ce",
      },
    };
    
    try {
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Razorpay error:", error);
      toast.error("Payment gateway error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveBooking = async (paymentId?: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error("User not authenticated");
      }
      
      // Format seats data for database
      const seatsData = bookingDetails.seats.map((seat: any) => ({
        row: seat.row,
        number: seat.number
      }));
      
      const { error } = await supabase
        .from('bookings')
        .insert({
          user_id: userData.user.id,
          showtime_id: bookingDetails.showtime.id,
          seats: seatsData,
          total_amount: bookingDetails.totalAmount,
          payment_status: paymentId ? 'completed' : 'pending'
        });
      
      if (error) throw error;
      
    } catch (error) {
      console.error("Error saving booking:", error);
      // Continue anyway for demo purposes
    }
  };

  // Calculate subtotal, convenience fee (0 for Fair-Cut), and total
  const subtotal = bookingDetails?.totalAmount || 0;
  const convenienceFee = 0; // This is the USP of Fair-Cut
  const total = subtotal + convenienceFee;

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
        
        <Card className="bg-black border border-violet-500 text-white mb-6">
          <CardHeader className="border-b border-violet-800">
            <CardTitle className="text-xl text-violet-400">
              Payment Details
            </CardTitle>
            <CardDescription className="text-violet-300">
              Complete your payment to confirm booking
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {bookingDetails ? (
              <div className="space-y-4">
                <div className="bg-violet-950 bg-opacity-50 rounded-md p-4">
                  <h3 className="font-bold text-white mb-2">{bookingDetails.movie.title}</h3>
                  <p className="text-sm text-violet-300">{bookingDetails.theater.name}</p>
                  <p className="text-sm text-violet-300">
                    Screen {bookingDetails.showtime.screen} • {bookingDetails.showtime.time}
                  </p>
                  <div className="mt-2">
                    <span className="text-sm text-violet-300">Seats: </span>
                    <span className="text-sm text-white">
                      {bookingDetails.seats.map((seat: any) => `${seat.row}${seat.number}`).join(', ')}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-violet-300">Subtotal</span>
                    <span className="text-white">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-violet-300">Convenience Fee</span>
                    <span className="text-green-500">₹{convenienceFee.toFixed(2)} <span className="text-xs">(FREE with Fair-Cut)</span></span>
                  </div>
                  <div className="flex justify-between border-t border-violet-800 pt-2 mt-2">
                    <span className="text-white font-bold">Total Amount</span>
                    <span className="text-white font-bold">₹{total.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="bg-violet-950 bg-opacity-50 rounded-md p-4 mt-4">
                  <h4 className="font-semibold text-violet-300 mb-2">Payment Options</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="upi" 
                        name="payment" 
                        defaultChecked 
                        className="text-violet-600 focus:ring-violet-500"
                      />
                      <label htmlFor="upi" className="ml-2 text-white">UPI Payment</label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="card" 
                        name="payment" 
                        className="text-violet-600 focus:ring-violet-500"
                      />
                      <label htmlFor="card" className="ml-2 text-white">Credit/Debit Card</label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="netbanking" 
                        name="payment" 
                        className="text-violet-600 focus:ring-violet-500"
                      />
                      <label htmlFor="netbanking" className="ml-2 text-white">Net Banking</label>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-violet-300">No booking details found</div>
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
            onClick={handlePayment}
            disabled={loading || !bookingDetails}
          >
            {loading ? "Processing..." : `Pay ₹${total.toFixed(2)}`}
          </Button>
        </div>
        
        <div className="mt-4 text-center text-sm text-violet-400">
          <span className="block">Test Card: 4111 1111 1111 1111</span>
          <span className="block">Expiry: Any future date | CVV: Any 3 digits</span>
          <span className="block">Name: Any name</span>
        </div>
      </div>
    </div>
  );
};

export default Payment;
