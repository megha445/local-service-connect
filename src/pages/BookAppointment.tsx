import { useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { getProviders, createAppointment, getBookedSlots, TIME_SLOTS } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, IndianRupee, CheckCircle2, Clock, XCircle, Loader2, CreditCard, Banknote } from "lucide-react";
import { toast } from "sonner";
import PaymentCardForm, { CardDetails, isCardValid } from "@/components/PaymentCardForm";

type PaymentMethod = "Cash on Delivery" | "Online Payment";
type BookingState = "form" | "processing" | "success" | "failed";

export default function BookAppointment() {
  const [searchParams] = useSearchParams();
  const providerId = searchParams.get("providerId") || "";
  const { user } = useAuth();
  const navigate = useNavigate();

  const provider = useMemo(() => getProviders().find(p => p.id === providerId), [providerId]);

  const [customerName, setCustomerName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState<Date>();
  const [timeSlot, setTimeSlot] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash on Delivery");
  const [bookingState, setBookingState] = useState<BookingState>("form");
  const [card, setCard] = useState<CardDetails>({ cardNumber: "", expiry: "", cvc: "" });

  const bookedSlots = useMemo(() => {
    if (!date || !provider) return [];
    return getBookedSlots(provider.id, format(date, "yyyy-MM-dd"));
  }, [date, provider]);

  if (!user) { navigate("/login"); return null; }

  if (!provider) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Provider not found. <a href="/providers" className="text-primary underline">Browse providers</a></p>
      </div>
    );
  }

  const simulateOnlinePayment = (): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 85% success rate for demo
        resolve(Math.random() < 0.85);
      }, 2000);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim() || !address.trim() || !date || !timeSlot) {
      toast.error("Please fill all fields, select a date and time slot");
      return;
    }
    if (phone.trim().length < 10) { toast.error("Enter a valid phone number"); return; }

    const currentBooked = getBookedSlots(provider.id, format(date, "yyyy-MM-dd"));
    if (currentBooked.includes(timeSlot)) {
      toast.error("This time slot was just booked by someone else. Please choose another.");
      setTimeSlot("");
      return;
    }

    if (paymentMethod === "Online Payment") {
      if (!isCardValid(card)) {
        toast.error("Please enter valid card details");
        return;
      }
      setBookingState("processing");
      const success = await simulateOnlinePayment();

      if (success) {
        createAppointment({
          userId: user.id,
          providerId: provider.id,
          providerName: provider.name,
          serviceType: provider.serviceType,
          serviceDate: format(date, "yyyy-MM-dd"),
          timeSlot,
          customerName: customerName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          priceInRupees: provider.priceInRupees,
          paymentMethod: "Online Payment",
          paymentStatus: "Paid",
        });
        setBookingState("success");
      } else {
        setBookingState("failed");
      }
    } else {
      createAppointment({
        userId: user.id,
        providerId: provider.id,
        providerName: provider.name,
        serviceType: provider.serviceType,
        serviceDate: format(date, "yyyy-MM-dd"),
        timeSlot,
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        priceInRupees: provider.priceInRupees,
        paymentMethod: "Cash on Delivery",
        paymentStatus: "Pending",
      });
      setBookingState("success");
    }
  };

  if (bookingState === "processing") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-primary" />
            <h2 className="mb-2 text-2xl font-bold text-foreground">Processing Payment...</h2>
            <p className="text-muted-foreground">Please wait while we process your ₹{provider.priceInRupees} payment.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (bookingState === "failed") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <XCircle className="mx-auto mb-4 h-16 w-16 text-destructive" />
            <h2 className="mb-2 text-2xl font-bold text-foreground">Payment Failed</h2>
            <p className="mb-4 text-muted-foreground">Your payment of ₹{provider.priceInRupees} could not be processed. No booking was made.</p>
            <div className="flex justify-center gap-3">
              <Button onClick={() => setBookingState("form")}>Try Again</Button>
              <Button variant="outline" onClick={() => navigate("/providers")}>Browse Providers</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (bookingState === "success") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
            <h2 className="mb-2 text-2xl font-bold text-foreground">Appointment Booked!</h2>
            <p className="mb-1 text-muted-foreground">
              <span className="font-semibold text-foreground">{timeSlot}</span> on <span className="font-semibold text-foreground">{date ? format(date, "dd MMMM yyyy") : ""}</span>
            </p>
            <p className="mb-4 text-muted-foreground">
              {paymentMethod === "Online Payment"
                ? <><span className="font-semibold text-green-600">₹{provider.priceInRupees} Paid</span> via Online Payment</>
                : <>Pay <span className="font-semibold text-foreground">₹{provider.priceInRupees}</span> in cash when the service is completed.</>
              }
            </p>
            <div className="flex justify-center gap-3">
              <Button onClick={() => navigate("/dashboard")}>View Dashboard</Button>
              <Button variant="outline" onClick={() => navigate("/providers")}>Browse More</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex min-h-[80vh] items-start justify-center px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Book Appointment</CardTitle>
          <CardDescription>
            {provider.name} — {provider.serviceType} — <span className="font-semibold">₹{provider.priceInRupees}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Customer Name</Label>
              <Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Your full name" maxLength={100} />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="10-digit number" maxLength={15} />
            </div>
            <div>
              <Label>Address</Label>
              <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Service address" maxLength={200} />
            </div>
            <div>
              <Label>Service Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd MMMM yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => { setDate(d); setTimeSlot(""); }}
                    disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))}
                    initialFocus
                    className="pointer-events-auto p-3"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {date && (
              <div>
                <Label className="mb-2 flex items-center gap-1">
                  <Clock className="h-4 w-4" /> Select Time Slot
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map(slot => {
                    const isBooked = bookedSlots.includes(slot);
                    const isSelected = timeSlot === slot;
                    return (
                      <Button
                        key={slot}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        disabled={isBooked}
                        onClick={() => setTimeSlot(slot)}
                        className={cn(
                          "text-xs",
                          isBooked && "cursor-not-allowed opacity-50 line-through",
                          isSelected && "ring-2 ring-primary ring-offset-2"
                        )}
                      >
                        {isBooked ? "Unavailable" : slot}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Payment Method Selection */}
            <div>
              <Label className="mb-2 block">Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)} className="grid grid-cols-2 gap-3">
                <Label
                  htmlFor="cod"
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-colors",
                    paymentMethod === "Cash on Delivery" ? "border-primary bg-primary/5" : "border-border"
                  )}
                >
                  <RadioGroupItem value="Cash on Delivery" id="cod" />
                  <Banknote className="h-4 w-4" />
                  <span className="text-sm font-medium">Cash on Delivery</span>
                </Label>
                <Label
                  htmlFor="online"
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-colors",
                    paymentMethod === "Online Payment" ? "border-primary bg-primary/5" : "border-border"
                  )}
                >
                  <RadioGroupItem value="Online Payment" id="online" />
                  <CreditCard className="h-4 w-4" />
                  <span className="text-sm font-medium">Online Payment</span>
                </Label>
              </RadioGroup>
            </div>

            {paymentMethod === "Online Payment" && (
              <PaymentCardForm card={card} onChange={setCard} />
            )}

            <div className="rounded-lg bg-accent p-3 text-sm">
              <div className="flex items-center gap-1 font-semibold text-accent-foreground">
                <IndianRupee className="h-4 w-4" /> Payment Summary
              </div>
              <p className="mt-1 text-muted-foreground">
                {paymentMethod === "Online Payment"
                  ? `Pay ₹${provider.priceInRupees} online now (test mode — simulated).`
                  : `Pay ₹${provider.priceInRupees} in cash when the service is completed.`
                }
              </p>
            </div>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={!timeSlot || (paymentMethod === "Online Payment" && !isCardValid(card))}
            >
              {paymentMethod === "Online Payment" ? `Pay ₹${provider.priceInRupees} Now` : "Confirm Booking"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
