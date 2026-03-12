import { Link } from "react-router-dom";
import { serviceCategories } from "@/lib/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Shield, Clock } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent px-4 py-20 sm:py-28">
        <div className="container mx-auto text-center">
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Find Trusted Local Service Providers{" "}
            <span className="text-primary">Near You</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Book plumbers, electricians, cleaners, and mechanics with ease. Pay cash on delivery — no hassle.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/providers">
              <Button size="lg" className="gap-2 text-base font-semibold">
                Browse Services <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="text-base font-semibold">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-2 text-center text-2xl font-bold text-foreground sm:text-3xl">Our Services</h2>
        <p className="mb-10 text-center text-muted-foreground">Choose from our range of trusted local services</p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {serviceCategories.map((cat, i) => (
            <Link to={`/providers?service=${cat.name}`} key={cat.name}>
              <Card className="group cursor-pointer border-2 border-transparent transition-all hover:border-primary/30 hover:shadow-lg" style={{ animationDelay: `${i * 100}ms` }}>
                <CardContent className="flex flex-col items-center p-8 text-center">
                  <span className="mb-4 text-5xl transition-transform group-hover:scale-110">{cat.icon}</span>
                  <h3 className="mb-1 text-lg font-bold text-foreground">{cat.name}</h3>
                  <p className="text-sm text-muted-foreground">{cat.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Why Us */}
      <section className="bg-secondary/50 px-4 py-16">
        <div className="container mx-auto">
          <h2 className="mb-10 text-center text-2xl font-bold text-foreground sm:text-3xl">Why Choose Us?</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { icon: <Star className="h-8 w-8 text-primary" />, title: "Verified Providers", desc: "All service providers are vetted and rated by customers." },
              { icon: <Shield className="h-8 w-8 text-primary" />, title: "Cash on Delivery", desc: "Pay ₹ only when the service is completed. No upfront costs." },
              { icon: <Clock className="h-8 w-8 text-primary" />, title: "Easy Scheduling", desc: "Pick a date that works for you. Quick and hassle-free booking." },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
                  {item.icon}
                </div>
                <h3 className="mb-2 text-lg font-bold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 LocalServiceConnect — College Startup MVP</p>
      </footer>
    </div>
  );
};

export default Index;
