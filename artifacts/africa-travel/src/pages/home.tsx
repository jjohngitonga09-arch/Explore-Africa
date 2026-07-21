import { Link } from "wouter";
import { ArrowRight, MapPin, Calendar, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useListTours, useGetGallery, useListVisaServices } from "@workspace/api-client-react";
import { HeaderCarousel } from "@/components/HeaderCarousel";

export default function Home() {
  const { data: tours, isLoading: toursLoading } = useListTours();
  const { data: gallery, isLoading: galleryLoading } = useGetGallery();
  const { data: visas, isLoading: visasLoading } = useListVisaServices();

  const featuredTours = tours?.slice(0, 3) || [];
  const galleryPreview = gallery?.slice(0, 6) || [];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[85vh] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <HeaderCarousel />
        <div className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto flex flex-col items-center">
          <span className="uppercase tracking-[0.3em] text-sm font-medium mb-4 text-white/90">Curated African Experiences</span>
          <h1 className="text-5xl md:text-7xl font-serif font-medium mb-6 leading-tight">
            Discover the Soul <br/>of the Continent
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl font-light">
            Exceptional safaris, breathtaking landscapes, and seamless visa assistance for the discerning traveler.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button size="lg" className="text-lg px-8 py-6 rounded-none bg-primary text-primary-foreground hover:bg-primary/90" asChild>
              <Link href="/tours">Explore Destinations</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-none bg-transparent border-white text-white hover:bg-white/10 hover:text-white" asChild>
              <Link href="/visa-services">Visa Assistance</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Tours */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-4">Curated Journeys</h2>
              <p className="text-muted-foreground text-lg">
                Handpicked itineraries designed to immerse you in the authentic beauty and culture of Africa.
              </p>
            </div>
            <Button variant="ghost" className="gap-2 shrink-0 group rounded-none" asChild>
              <Link href="/tours">
                View All Itineraries <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          {toursLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-96 bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredTours.map(tour => (
                <Link key={tour.id} href={`/tours/${tour.id}`} className="group block">
                  <Card className="h-full border-none shadow-none bg-transparent overflow-hidden rounded-none">
                    <div className="aspect-[4/5] overflow-hidden mb-4 relative">
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 duration-500" />
                      <img 
                        src={tour.coverImage || "/elephant-wild.jpg"} 
                        alt={tour.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-4 left-4 z-20 bg-background/90 backdrop-blur text-foreground px-3 py-1 text-xs font-medium uppercase tracking-wider">
                        {tour.durationDays} Days
                      </div>
                    </div>
                    <CardContent className="p-0">
                      <div className="flex items-center text-sm text-primary mb-2 font-medium tracking-wide">
                        <MapPin className="w-3.5 h-3.5 mr-1" /> 
                        {tour.destinationCountry?.name || 'Multiple Destinations'}
                      </div>
                      <h3 className="text-2xl font-serif mb-2 group-hover:text-primary transition-colors">{tour.title}</h3>
                      <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed mb-4">
                        {tour.description}
                      </p>
                      <div className="text-lg font-medium">
                        From ${tour.basePrice}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Visa Service Highlight */}
      <section className="py-24 bg-sidebar">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="aspect-square max-w-md mx-auto relative z-10">
                <img src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80" alt="Visa Services" className="w-full h-full object-cover shadow-2xl" />
              </div>
              <div className="absolute top-1/2 -right-8 w-48 h-48 bg-primary/10 rounded-full -z-0 blur-3xl hidden lg:block" />
            </div>
            <div className="order-1 lg:order-2">
              <span className="text-primary font-medium tracking-wider uppercase text-sm mb-4 block">Seamless Travel</span>
              <h2 className="text-3xl md:text-5xl font-serif mb-6 leading-tight">We Handle the Bureaucracy. You Handle the Packing.</h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Don't let complex visa requirements stand between you and your dream journey. Our dedicated visa team processes applications for top African destinations, ensuring you arrive with peace of mind.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-6 mb-10">
                {visasLoading ? (
                  <div className="col-span-2 h-24 bg-muted animate-pulse" />
                ) : visas?.slice(0, 4).map(visa => (
                  <div key={visa.id} className="flex flex-col border-l-2 border-primary/30 pl-4 py-1">
                    <span className="font-serif text-lg mb-1">{visa.name}</span>
                    <span className="text-sm text-muted-foreground">${visa.fee} Processing Fee</span>
                  </div>
                ))}
              </div>
              
              <Button size="lg" className="rounded-none px-8" asChild>
                <Link href="/visa-services">Start Visa Application</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Break / Quote */}
      <section className="relative py-32 bg-black text-center px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <img src="https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=1600&q=80" alt="Sunset" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="font-serif text-3xl md:text-4xl lg:text-5xl text-white leading-tight">
            "The only man I envy is the man who has not yet been to Africa - for he has so much to look forward to."
          </p>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="py-24 bg-background overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">Through the Lens</h2>
            <p className="text-muted-foreground text-lg">Glimpses of the unforgettable moments awaiting you.</p>
          </div>
          
          {galleryLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-square bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {galleryPreview.map((image, i) => (
                <div 
                  key={image.id} 
                  className={`relative overflow-hidden group aspect-square ${i === 0 || i === 3 ? 'md:col-span-2 md:aspect-[2/1]' : ''}`}
                >
                  <img 
                    src={image.imageUrl} 
                    alt={image.caption || "Africa"} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <p className="text-white font-serif text-lg">{image.caption || image.country?.name || 'Africa'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Button variant="outline" className="rounded-none uppercase tracking-widest text-sm px-8" asChild>
              <Link href="/gallery">View Full Gallery</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
