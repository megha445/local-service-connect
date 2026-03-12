import { useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { getProviders, createAppointment } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, IndianRupee, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

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
  const [booked, setBooked] = useState(false);

  if (!user) {
    navigate("/login");
    return null;
  }

  if (!provider) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Provider not found. <a href="/providers" className="text-primary underline">Browse providers</a></p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim() || !address.trim() || !date) {
      toast.error("Please fill all fields and select a date");
      return;
    }
    if (phone.trim().length < 10) { toast.error("Enter a valid phone number"); return; }
    createAppointment({
      userId: user.id,
      providerId: provider.id,
      providerName: provider.name,
      serviceType: provider.serviceType,
      serviceDate: format(date, "yyyy-MM-dd"),
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      priceInRupees: provider.priceInRupees,
    });
    setBooked(true);
  };

  if (booked) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-success" />
            <h2 className="mb-2 text-2xl font-bold text-foreground">Appointment Booked!</h2>
            <p className="mb-4 text-muted-foreground">
              Appointment booked successfully. Pay <span className="font-semibold text-foreground">₹{provider.priceInRupees}</span> in cash when the service is completed.
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
                    onSelect={setDate}
                    disabled={(d) => d < new Date()}
                    initialFocus
                    className="pointer-events-auto p-3"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="rounded-lg bg-accent p-3 text-sm">
              <div className="flex items-center gap-1 font-semibold text-accent-foreground">
                <IndianRupee className="h-4 w-4" /> Payment: Cash on Delivery
              </div>
              <p className="mt-1 text-muted-foreground">Pay ₹{provider.priceInRupees} in cash when the service is completed.</p>
            </div>
            <Button type="submit" className="w-full" size="lg">Confirm Booking</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
