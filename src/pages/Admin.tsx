import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { getAllAppointments, addProvider, serviceCategories } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { IndianRupee, Calendar } from "lucide-react";

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user || user.role !== "admin") {
    navigate("/");
    return null;
  }

  const [name, setName] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [rating, setRating] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const appointments = useMemo(() => getAllAppointments(), [refreshKey]);

  const handleAddProvider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !serviceType || !rating || !price || !location.trim()) {
      toast.error("Please fill all fields");
      return;
    }
    addProvider({
      name: name.trim(),
      serviceType,
      rating: parseFloat(rating),
      priceInRupees: parseInt(price),
      location: location.trim(),
    });
    toast.success("Provider added successfully!");
    setName(""); setServiceType(""); setRating(""); setPrice(""); setLocation("");
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-foreground">Admin Panel</h1>
      <p className="mb-8 text-muted-foreground">Manage providers and view all bookings</p>

      <Tabs defaultValue="providers">
        <TabsList className="mb-6">
          <TabsTrigger value="providers">Add Provider</TabsTrigger>
          <TabsTrigger value="appointments">All Appointments ({appointments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="providers">
          <Card className="max-w-lg">
            <CardHeader>
              <CardTitle>Add New Service Provider</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddProvider} className="space-y-4">
                <div>
                  <Label>Provider Name</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Rajesh Plumbing" maxLength={100} />
                </div>
                <div>
                  <Label>Service Type</Label>
                  <Select value={serviceType} onValueChange={setServiceType}>
                    <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                    <SelectContent>
                      {serviceCategories.map(cat => (
                        <SelectItem key={cat.name} value={cat.name}>{cat.icon} {cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Rating (1-5)</Label>
                    <Input type="number" min="1" max="5" step="0.1" value={rating} onChange={e => setRating(e.target.value)} placeholder="4.5" />
                  </div>
                  <div>
                    <Label>Price (₹)</Label>
                    <Input type="number" min="1" value={price} onChange={e => setPrice(e.target.value)} placeholder="500" />
                  </div>
                </div>
                <div>
                  <Label>Location</Label>
                  <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Area, City" maxLength={100} />
                </div>
                <Button type="submit" className="w-full">Add Provider</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          {appointments.length === 0 ? (
            <p className="text-muted-foreground">No appointments yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {appointments.map(apt => (
                <Card key={apt.id}>
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <Badge variant="secondary">{apt.serviceType}</Badge>
                      <Badge variant={apt.status === "Completed" ? "default" : "outline"}>{apt.status}</Badge>
                    </div>
                    <h3 className="font-bold text-foreground">{apt.providerName}</h3>
                    <p className="text-sm text-muted-foreground">Customer: {apt.customerName}</p>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {apt.serviceDate}</div>
                      <div className="flex items-center gap-1"><IndianRupee className="h-3.5 w-3.5" /> ₹{apt.priceInRupees} — {apt.paymentMethod}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
