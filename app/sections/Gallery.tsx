"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import { Container } from "@/app/components/Container";
import { SectionHeader } from "@/app/components/SectionHeader";
import { SITE } from "@/app/lib/site";
import { asset } from "@/app/lib/asset";

type Category = "nude" | "color" | "art" | "long";

type Item = {
  id: string;
  category: Category;
  title: string;
  src: string;
  alt?: string;
};

const ITEMS: Item[] = [
  { id: "n1", category: "nude", title: "Nude semi-permanent", alt: "Nude amande long — pose semi-permanente Lyon 6", src: "/images/gallery/nude-1.png" },
  { id: "n2", category: "nude", title: "BabyColor Rose", src: "/images/gallery/nudes-rose.png" },
  { id: "n3", category: "nude", title: "Rallongement nude", src: "/images/gallery/long2.png" },
  { id: "n4", category: "nude", title: "Nude & Fleur 3D", src: "/images/gallery/nude7.png" },

  { id: "c1", category: "color", title: "Tortoise", alt: "Manucure écaille caramel et feuilles d'or — studio Tête d'Or Lyon 6", src: "/images/gallery/couleurs1.png" },
  { id: "c2", category: "color", title: "BabyColor Ombré pêche & fleurs séchées", src: "/images/gallery/couleurs2.png" },
  { id: "c3", category: "color", title: "French jaune pailleté", src: "/images/gallery/couleurs3.png" },

  { id: "l1", category: "long", title: "Rallongement Nail Art Fleur séchée", src: "/images/gallery/couleurs4.jpeg" },
  { id: "l2", category: "long", title: "Rallongement gel Disney", src: "/images/gallery/gel-rallongement-disney.png" },

  { id: "n5", category: "nude", title: "Pop it nude french gold", src: "/images/gallery/remplissage-pop-it-nude-french-gold.png" },
  { id: "n6", category: "nude", title: "Pop it cateyes", src: "/images/gallery/remplissage-popit-cateyes.jpeg" },
  { id: "n7", category: "nude", title: "French sur ongles naturels", src: "/images/gallery/remplissage-ongles-naturels-french.jpeg" },

  { id: "a1", category: "art", title: "Fleurs roses french", src: "/images/gallery/nailart1.jpeg" },
  { id: "a2", category: "art", title: "Nail art floral", src: "/images/gallery/nailart1.png" },
  { id: "a3", category: "art", title: "Fleurs séchées coral", src: "/images/gallery/nailart2.jpeg" },
  { id: "a4", category: "art", title: "Baby Color jaunes & Fleurs blanches", src: "/images/gallery/nailart3.jpeg" },
  { id: "a5", category: "art", title: "Personnage Disney", src: "/images/gallery/nailart4.jpeg" },
  { id: "a6", category: "art", title: "Personnage Disney", src: "/images/gallery/nailart5.jpeg" },
  { id: "a7", category: "art", title: "Personnage Disney", alt: "Création nail art signature — prothésiste ongulaire Lyon 6", src: "/images/gallery/nailart6.jpeg" },
  { id: "a8", category: "art", title: "Chrome 3D semi-permanent", src: "/images/gallery/semi-permanent-chrome-3d.png" },
  { id: "a9", category: "art", title: "Nail art feuille d'or", src: "/images/gallery/semi-permanent-nail-art-feuille-dor.jpeg" },
  { id: "a10", category: "art", title: "Remplissage pop it nail art", src: "/images/gallery/remplissage-popit-nail-art.jpeg" },
  { id: "a11", category: "art", title: "Pop it Baby Color jaune", src: "/images/gallery/remplissage-popit-baby-color-jaune.jpeg" },
  { id: "a12", category: "art", title: "Pop it nail art", src: "/images/gallery/remplissage-popit-nail-art-2.jpeg" },
];

const FILTERS: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "Tout voir" },
  { id: "nude", label: "Nude & naturel" },
  { id: "color", label: "Couleur" },
  { id: "art", label: "Nail art" },
  { id: "long", label: "Rallongement" },
];

const LABELS: Record<Category, string> = {
  nude: "Nude",
  color: "Couleur",
  art: "Nail art",
  long: "Rallongement",
};

export function Gallery() {
  const [filter, setFilter] = useState<Category | "all">("all");
  const autoplay = useRef(
    Autoplay({
      delay: 4500,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
      stopOnFocusIn: true,
    })
  );
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", skipSnaps: false, dragFree: false },
    [autoplay.current]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const visible = ITEMS.filter(
    (i) => filter === "all" || i.category === filter
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (i: number) => emblaApi?.scrollTo(i),
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
    emblaApi.scrollTo(0, true);
  }, [filter, emblaApi]);

  return (
    <section id="galerie" className="relative py-24 md:py-32">
      <Container>
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            eyebrow="Portfolio"
            title="Des résultats visibles, sans compromis sur la qualité."
            intro="Quelques pièces récentes du studio. Chaque pose est unique et conçue pour vous."
          />
          <a
            href={SITE.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-sm text-[var(--color-ink)]/70 underline-offset-4 hover:text-[var(--color-ink)] hover:underline md:inline"
          >
            Voir sur Instagram →
          </a>
        </div>

        <div className="mt-10 flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`rounded-full px-5 py-2 text-sm transition-all ${
                  active
                    ? "bg-[var(--color-ink)] text-[var(--color-bg-soft)]"
                    : "bg-[var(--color-bg-soft)]/60 text-[var(--color-ink)]/80 hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-ink)]"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </Container>

      <div className="mt-10">
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {visible.map((item) => (
                <motion.figure
                  key={item.id}
                  initial={{ opacity: 0.4 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="relative shrink-0 grow-0 basis-[65%] px-2.5 sm:basis-[42%] md:basis-[32%] lg:basis-[24%] xl:basis-[20%]"
                >
                  <div className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg-soft)]/40 shadow-sm">
                    <Image
                      src={asset(item.src)}
                      alt={item.alt ?? item.title}
                      fill
                      sizes="(max-width: 640px) 65vw, (max-width: 1024px) 32vw, 22vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--color-ink)]/85 via-[var(--color-ink)]/30 to-transparent p-4 text-white">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-white/70">
                        {LABELS[item.category]}
                      </p>
                      <p className="mt-1 font-serif text-base">{item.title}</p>
                    </figcaption>
                  </div>
                </motion.figure>
              ))}
            </div>
          </div>

          <CarouselButton direction="prev" onClick={scrollPrev} />
          <CarouselButton direction="next" onClick={scrollNext} />
        </div>

        <Container>
          <div className="mt-8 flex items-center justify-center gap-2">
            {scrollSnaps.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollTo(i)}
                aria-label={`Aller à l'image ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === selectedIndex
                    ? "w-8 bg-[var(--color-ink)]"
                    : "w-1.5 bg-[var(--color-ink)]/25 hover:bg-[var(--color-ink)]/45"
                }`}
              />
            ))}
          </div>
        </Container>
      </div>
    </section>
  );
}

function CarouselButton({
  direction,
  onClick,
}: {
  direction: "prev" | "next";
  onClick: () => void;
}) {
  const isPrev = direction === "prev";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isPrev ? "Image précédente" : "Image suivante"}
      className={`absolute top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--color-line)] bg-[var(--color-bg)]/90 text-[var(--color-ink)] shadow-md backdrop-blur transition-all hover:bg-[var(--color-bg)] hover:scale-105 md:flex ${
        isPrev ? "left-4 lg:left-8" : "right-4 lg:right-8"
      }`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={isPrev ? "" : "rotate-180"}
        aria-hidden
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    </button>
  );
}
