import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { getMyAppointments, markAppointmentCompleted, addReview, hasReviewedAppointment } from "@/lib/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { IndianRupee, Calendar, Wrench, Star, Clock } from "lucide-react";
import { toast } from "sonner";

function StarRating({ rating, onRate }: { rating: number; onRate: (r: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" onClick={() => onRate(n)} className="transition-transform hover:scale-110">
          <Star className={`h-5 w-5 ${n <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
        </button>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const appointments = useMemo(() => user ? getMyAppointments(user.id) : [], [user, refreshKey]);

  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  if (!user) { navigate("/login"); return null; }

  const handleMarkComplete = (id: string) => {
    markAppointmentCompleted(id);
    setRefreshKey(k => k + 1);
    toast.success("Appointment marked as completed!");
  };

  const handleSubmitReview = (apt: typeof appointments[0]) => {
    if (reviewRating === 0) { toast.error("Please select a star rating"); return; }
    try {
      addReview({
        appointmentId: apt.id,
        userId: user.id,
        userName: user.name,
        providerId: apt.providerId,
        rating: reviewRating,
        reviewText: reviewText.trim(),
      });
      toast.success("Review submitted! Thank you.");
      setReviewingId(null);
      setReviewRating(0);
      setReviewText("");
      setRefreshKey(k => k + 1);
    } catch {
      toast.error("Already reviewed this booking.");
    }
  };

  const paymentBadge = (apt: typeof appointments[0]) => {
    const colors: Record<string, string> = {
      Paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      Failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[apt.paymentStatus] || ""}`}>{apt.paymentStatus}</span>;
  };

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
          {appointments.map(apt => {
            const reviewed = hasReviewedAppointment(apt.id);
            const canReview = apt.status === "Completed" && apt.paymentStatus !== "Failed" && !reviewed;
            return (
              <Card key={apt.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <Badge variant="secondary">{apt.serviceType}</Badge>
                    <Badge variant={apt.status === "Completed" ? "default" : "outline"}>{apt.status}</Badge>
                  </div>
                  <h3 className="mb-3 text-lg font-bold text-foreground">{apt.providerName}</h3>
                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" />{apt.serviceDate}</div>
                    <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" />{apt.timeSlot}</div>
                    <div className="flex items-center gap-2"><IndianRupee className="h-3.5 w-3.5" />₹{apt.priceInRupees}</div>
                    <div className="flex items-center gap-2"><Wrench className="h-3.5 w-3.5" />{apt.paymentMethod} — {paymentBadge(apt)}</div>
                  </div>

                  {/* Mark as completed (for demo) */}
                  {apt.status === "Pending" && apt.paymentStatus !== "Failed" && (
                    <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => handleMarkComplete(apt.id)}>
                      Mark as Completed
                    </Button>
                  )}

                  {/* Review section */}
                  {canReview && reviewingId !== apt.id && (
                    <Button size="sm" variant="secondary" className="mt-3 w-full" onClick={() => setReviewingId(apt.id)}>
                      <Star className="mr-1 h-3.5 w-3.5" /> Write a Review
                    </Button>
                  )}
                  {reviewed && (
                    <p className="mt-3 text-xs text-green-600 font-medium">✓ Review submitted</p>
                  )}
                  {reviewingId === apt.id && (
                    <div className="mt-3 space-y-2 rounded-lg border p-3">
                      <StarRating rating={reviewRating} onRate={setReviewRating} />
                      <Textarea placeholder="Write your review (optional)" value={reviewText} onChange={e => setReviewText(e.target.value)} rows={2} maxLength={500} />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSubmitReview(apt)}>Submit</Button>
                        <Button size="sm" variant="ghost" onClick={() => { setReviewingId(null); setReviewRating(0); setReviewText(""); }}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
