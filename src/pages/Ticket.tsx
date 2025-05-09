
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import QRCode from 'qrcode';

const Ticket = () => {
  const [ticketImage, setTicketImage] = useState<string | null>(null);
  const ticketRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const bookingDetailsJson = localStorage.getItem("bookingDetails");
  const bookingDetails = bookingDetailsJson ? JSON.parse(bookingDetailsJson) : null;
  
  // Generate booking ID
  const bookingId = `WPSC${Math.floor(100000 + Math.random() * 900000)}`;

  useEffect(() => {
    if (!bookingDetails) {
      navigate('/');
      return;
    }
    
    // Generate QR code
    const generateQR = async () => {
      try {
        const qrData = JSON.stringify({
          booking_id: bookingId,
          theater: bookingDetails.theater.name,
          movie: bookingDetails.movie.title,
          showtime: `${bookingDetails.showtime.time} - Screen ${bookingDetails.showtime.screen}`,
          seats: bookingDetails.seats.map((seat: any) => `${seat.row}${seat.number}`).join(', '),
        });
        
        const qrDataUrl = await QRCode.toDataURL(qrData);
        return qrDataUrl;
      } catch (error) {
        console.error("Error generating QR code:", error);
        return null;
      }
    };
    
    generateQR().then(setTicketImage);
    
    // Simulate sending email and SMS
    setTimeout(() => {
      toast.success("Ticket details sent to your email and SMS!");
    }, 2000);
    
  }, [bookingDetails, navigate, bookingId]);

  const handleDownloadTicket = () => {
    if (!ticketRef.current) return;
    
    // Use html-to-image or similar library in a real app
    toast.success("Ticket downloaded!");
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
        
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">Booking Confirmed!</h1>
          <p className="text-violet-300 mt-1">
            Your ticket has been sent to your email and phone
          </p>
        </div>
        
        {bookingDetails ? (
          <div className="mb-6">
            <Card 
              className="bg-black border border-violet-500 text-white overflow-hidden"
              ref={ticketRef}
            >
              <div className="relative">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black via-transparent to-black opacity-70"></div>
                {bookingDetails.movie.poster && (
                  <img 
                    src={bookingDetails.movie.poster} 
                    alt={bookingDetails.movie.title}
                    className="w-full h-40 object-cover opacity-50"
                  />
                )}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-xl text-white">{bookingDetails.movie.title}</h3>
                    <p className="text-violet-300 text-sm">
                      {new Date().toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div className="bg-violet-900 px-3 py-1 rounded-full text-xs font-medium">
                    CONFIRMED
                  </div>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="flex justify-between mb-4">
                  <div>
                    <div className="text-sm text-violet-300">Theater</div>
                    <div className="font-medium">{bookingDetails.theater.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-violet-300">Time</div>
                    <div className="font-medium">{bookingDetails.showtime.time}</div>
                  </div>
                </div>
                
                <div className="flex justify-between mb-4">
                  <div>
                    <div className="text-sm text-violet-300">Screen</div>
                    <div className="font-medium">{bookingDetails.showtime.screen}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-violet-300">Seats</div>
                    <div className="font-medium">
                      {bookingDetails.seats.map((seat: any) => `${seat.row}${seat.number}`).join(', ')}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-violet-800">
                  <div>
                    <div className="text-sm text-violet-300">Booking ID</div>
                    <div className="font-medium">{bookingId}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-violet-300">Total Amount</div>
                    <div className="font-medium">₹{bookingDetails.totalAmount.toFixed(2)}</div>
                  </div>
                </div>
                
                <div className="flex flex-col items-center">
                  {ticketImage && (
                    <img 
                      src={ticketImage} 
                      alt="QR Code" 
                      className="w-40 h-40 mb-2"
                    />
                  )}
                  <div className="text-xs text-center text-violet-300 mt-1">
                    Scan this QR code at the theater entrance
                  </div>
                </div>
              </CardContent>
              
              <div className="bg-violet-900 py-3 px-4 text-center text-sm">
                <span className="font-bold">✓</span> Convenience fee FREE with Fair-Cut
              </div>
            </Card>
            
            <div className="flex gap-3 mt-6">
              <Button 
                variant="outline" 
                className="flex-1 border-violet-500 text-violet-300"
                onClick={handleDownloadTicket}
              >
                Download Ticket
              </Button>
              
              <Button 
                className="flex-1 bg-violet-700 hover:bg-violet-600 text-white"
                onClick={() => navigate('/')}
              >
                Book Another
              </Button>
            </div>
            
            <div className="text-center text-violet-400 text-sm mt-6">
              Thank you for using Fair-Cut - The Convenience Fee Free Movie Booking App!
            </div>
          </div>
        ) : (
          <div className="text-center py-6 bg-black bg-opacity-50 rounded-lg border border-violet-800">
            <div className="text-violet-300">No booking details found</div>
            <Button 
              className="mt-4 bg-violet-700 hover:bg-violet-600 text-white"
              onClick={() => navigate('/')}
            >
              Book Tickets
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ticket;
