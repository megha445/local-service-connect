import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { getMyAppointments } from "@/lib/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IndianRupee, Calendar, Wrench } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const appointments = useMemo(() => user ? getMyAppointments(user.id) : [], [user]);

  if (!user) { navigate("/login"); return null; }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-foreground">My Dashboard</h1>
      <p className="mb-8 text-muted-foreground">Welcome, {user.name}! Here are your appointments.</p>

      {appointments.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center">
          <p className="mb-4 text-muted-foreground">No appointments yet.</p>
          <Button onClick={() => navigate("/providers")}>Browse Services</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {appointments.map(apt => (
            <Card key={apt.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <Badge variant="secondary">{apt.serviceType}</Badge>
                  <Badge variant={apt.status === "Completed" ? "default" : "outline"}>{apt.status}</Badge>
                </div>
                <h3 className="mb-3 text-lg font-bold text-foreground">{apt.providerName}</h3>
                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" />Service Date: {apt.serviceDate}</div>
                  <div className="flex items-center gap-2"><IndianRupee className="h-3.5 w-3.5" />₹{apt.priceInRupees}</div>
                  <div className="flex items-center gap-2"><Wrench className="h-3.5 w-3.5" />Payment: {apt.paymentMethod}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
