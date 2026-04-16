import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { getProviders, serviceCategories, getReviewsForProvider, getAverageRating } from "@/lib/mockData";
import { useAuth } from "@/lib/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, IndianRupee, MessageSquare } from "lucide-react";

export default function Providers() {
  const [searchParams] = useSearchParams();
  const initialService = searchParams.get("service") || "";
  const [filter, setFilter] = useState(initialService);
  const [expandedReviews, setExpandedReviews] = useState<string | null>(null);
  const { user } = useAuth();

  const providers = useMemo(() => getProviders(filter || undefined), [filter]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-foreground">Service Providers</h1>
      <p className="mb-6 text-muted-foreground">Browse and book verified local professionals</p>

      <div className="mb-8 flex flex-wrap gap-2">
        <Button variant={filter === "" ? "default" : "outline"} size="sm" onClick={() => setFilter("")}>All</Button>
        {serviceCategories.map(cat => (
          <Button key={cat.name} variant={filter === cat.name ? "default" : "outline"} size="sm" onClick={() => setFilter(cat.name)}>
            {cat.icon} {cat.name}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {providers.map(provider => {
          const avgRating = getAverageRating(provider.id);
          const reviews = getReviewsForProvider(provider.id);
          const displayRating = avgRating !== null ? avgRating.toFixed(1) : provider.rating.toFixed(1);
          const isExpanded = expandedReviews === provider.id;

          return (
            <Card key={provider.id} className="overflow-hidden transition-shadow hover:shadow-lg">
              <CardContent className="p-6">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{provider.name}</h3>
                    <Badge variant="secondary" className="mt-1">{provider.serviceType}</Badge>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-sm font-semibold text-accent-foreground">
                    <Star className="h-3.5 w-3.5 fill-current" /> {displayRating}
                  </div>
                </div>
                <div className="mb-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> {provider.location}
                </div>
                <div className="mb-4 flex items-center gap-1 text-lg font-bold text-foreground">
                  <IndianRupee className="h-4 w-4" />{provider.priceInRupees}
                  <span className="text-sm font-normal text-muted-foreground">/ service</span>
                </div>

                {/* Reviews count */}
                {reviews.length > 0 && (
                  <button
                    onClick={() => setExpandedReviews(isExpanded ? null : provider.id)}
                    className="mb-3 flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> {reviews.length} review{reviews.length > 1 ? "s" : ""}
                  </button>
                )}

                {/* Expanded reviews */}
                {isExpanded && reviews.length > 0 && (
                  <div className="mb-4 max-h-40 space-y-2 overflow-y-auto rounded-lg border p-2">
                    {reviews.map(r => (
                      <div key={r.id} className="border-b pb-2 last:border-0">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                          ))}
                          <span className="ml-1 text-xs text-muted-foreground">by {r.userName}</span>
                        </div>
                        {r.reviewText && <p className="mt-0.5 text-xs text-muted-foreground">{r.reviewText}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {user ? (
                  <Link to={`/book?providerId=${provider.id}`}>
                    <Button className="w-full">Book Appointment</Button>
                  </Link>
                ) : (
                  <Link to="/login">
                    <Button variant="outline" className="w-full">Login to Book</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {providers.length === 0 && (
        <p className="mt-10 text-center text-muted-foreground">No providers found for this category.</p>
      )}
    </div>
  );
}
