import { useEffect } from "react";
import { useGetGallery, getGetGalleryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";

let socket: ReturnType<typeof io> | null = null;

function getSocket() {
  if (!socket) {
    socket = io({ path: "/api/socket.io", transports: ["websocket", "polling"] });
  }
  return socket;
}

export default function Gallery() {
  const { data: images, isLoading } = useGetGallery();
  const queryClient = useQueryClient();

  useEffect(() => {
    const s = getSocket();
    const handler = () => {
      queryClient.invalidateQueries({ queryKey: getGetGalleryQueryKey() });
    };
    s.on("gallery:updated", handler);
    return () => { s.off("gallery:updated", handler); };
  }, [queryClient]);

  return (
    <div className="pb-24 pt-10 min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-6">
        
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif mb-6">Inspiration Gallery</h1>
          <p className="text-lg text-muted-foreground">
            A curated visual journey through the diverse landscapes, wildlife, and cultures of Africa. Let these moments inspire your next adventure.
          </p>
        </div>

        {isLoading ? (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className={`bg-muted animate-pulse w-full ${i % 3 === 0 ? 'h-96' : i % 2 === 0 ? 'h-64' : 'h-80'}`} />
            ))}
          </div>
        ) : !images || images.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No images currently available in the gallery.</p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {images.map((image) => (
              <div key={image.id} className="break-inside-avoid group relative overflow-hidden bg-muted">
                <img 
                  src={image.imageUrl} 
                  alt={image.caption || 'Africa gallery image'} 
                  className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  {image.country && (
                    <span className="text-primary text-xs font-bold uppercase tracking-widest mb-1 block">
                      {image.country.name}
                    </span>
                  )}
                  {image.caption && (
                    <p className="text-white font-serif text-lg leading-tight">{image.caption}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
