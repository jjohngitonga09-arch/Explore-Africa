import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-8xl font-serif font-bold text-primary mb-4">404</h1>
      <h2 className="text-3xl font-serif mb-6">Destination Not Found</h2>
      <p className="text-muted-foreground max-w-md mb-8 text-lg">
        The journey you are looking for has been moved, removed, or never existed in the first place.
      </p>
      <Button size="lg" className="rounded-none px-8 py-6" asChild>
        <Link href="/">Return to Homepage</Link>
      </Button>
    </div>
  );
}
