import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { getProviders, serviceCategories } from "@/lib/mockData";
import { useAuth } from "@/lib/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, IndianRupee } from "lucide-react";

export default function Providers() {
  const [searchParams] = useSearchParams();
  const initialService = searchParams.get("service") || "";
  const [filter, setFilter] = useState(initialService);
  const { user } = useAuth();

  const providers = useMemo(() => getProviders(filter || undefined), [filter]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-foreground">Service Providers</h1>
      <p className="mb-6 text-muted-foreground">Browse and book verified local professionals</p>

      {/* Filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        <Button variant={filter === "" ? "default" : "outline"} size="sm" onClick={() => setFilter("")}>All</Button>
        {serviceCategories.map(cat => (
          <Button key={cat.name} variant={filter === cat.name ? "default" : "outline"} size="sm" onClick={() => setFilter(cat.name)}>
            {cat.icon} {cat.name}
          </Button>
        ))}
      </div>

      {/* Providers Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {providers.map(provider => (
          <Card key={provider.id} className="overflow-hidden transition-shadow hover:shadow-lg">
            <CardContent className="p-6">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{provider.name}</h3>
                  <Badge variant="secondary" className="mt-1">{provider.serviceType}</Badge>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-sm font-semibold text-accent-foreground">
                  <Star className="h-3.5 w-3.5 fill-current" /> {provider.rating}
                </div>
              </div>
              <div className="mb-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> {provider.location}
              </div>
              <div className="mb-4 flex items-center gap-1 text-lg font-bold text-foreground">
                <IndianRupee className="h-4 w-4" />{provider.priceInRupees}
                <span className="text-sm font-normal text-muted-foreground">/ service</span>
              </div>
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
        ))}
      </div>

      {providers.length === 0 && (
        <p className="mt-10 text-center text-muted-foreground">No providers found for this category.</p>
      )}
    </div>
  );
}
