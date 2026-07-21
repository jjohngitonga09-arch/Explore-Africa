import { useEffect, useState } from "react";
import { useGetHeaderGallery, useGetSiteSettings } from "@workspace/api-client-react";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1600&q=80";
const FALLBACK_ROTATE_MS = 4000;

export function HeaderCarousel() {
  const { data: headerImages } = useGetHeaderGallery();
  const { data: settings } = useGetSiteSettings();
  const rotateMs = settings?.headerCarouselIntervalMs ?? FALLBACK_ROTATE_MS;
  const [activeIndex, setActiveIndex] = useState(0);

  const images =
    headerImages && headerImages.length > 0
      ? headerImages.map((img) => img.imageUrl)
      : [FALLBACK_IMAGE];

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, rotateMs);
    return () => clearInterval(id);
  }, [images.length, rotateMs]);

  useEffect(() => {
    if (activeIndex >= images.length) setActiveIndex(0);
  }, [images.length, activeIndex]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="flex h-full transition-transform duration-1200 ease-in-out"
        style={{
          width: `${images.length * 100}%`,
          transform: `translateX(-${activeIndex * (100 / images.length)}%)`,
        }}
      >
        {images.map((src, i) => (
          <img
            key={src + i}
            src={src}
            alt="African Savanna"
            className="h-full object-cover object-center flex-shrink-0"
            style={{ width: `${100 / images.length}%` }}
          />
        ))}
      </div>
    </div>
  );
}
