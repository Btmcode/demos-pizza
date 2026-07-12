"use client";

import { Camera } from "lucide-react";

const GALLERY = [
  { src: "/images/demos-storefront.png", alt: "Demos Pizza — Fatih Haseki'de dükkanımız", span: "md:col-span-2 md:row-span-2" },
  { src: "/images/hero-pizza.png", alt: "Margherita pizza overhead", span: "" },
  { src: "/images/pizza-prosciutto.png", alt: "Prosciutto e burrata pizza", span: "" },
  { src: "/images/ingredients.png", alt: "Taze pizza malzemeleri", span: "md:col-span-2" },
  { src: "/images/pizza-pepperoni.png", alt: "Pepperoni pizza", span: "" },
  { src: "/images/pizza-quattro.png", alt: "Quattro formaggi", span: "" },
  { src: "/images/pizza-turkish.png", alt: "Demos Sucuklu — Türk-İtalyan sentezi", span: "" },
  { src: "/images/pizza-vegetarian.png", alt: "Vegetariana — sebze bahçesi", span: "" },
];

export function Gallery() {
  return (
    <section id="galeri" className="bg-ink py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-10 md:mb-12">
          <span className="text-yellow text-xs font-mono uppercase tracking-[0.25em]">
            {"// Galeri"}
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-2 text-white">
            Lezzetin <span className="text-gradient-gold">portresi</span>
          </h2>
          <p className="mt-3 text-white/70 max-w-xl mx-auto text-sm md:text-base">
            Her pizza bir sanat eseri. Endüstriyel fırından çıkan anları gözünüzle tadın.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[150px] md:auto-rows-[200px] gap-2.5 md:gap-3">
          {GALLERY.map((g, i) => (
            <figure
              key={i}
              className={`group relative overflow-hidden rounded-xl bg-ink-2 ${g.span}`}
            >
              <img
                src={g.src}
                alt={g.alt}
                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              <figcaption className="absolute bottom-0 inset-x-0 bg-ink/85 p-2.5 text-[11px] md:text-xs text-white translate-y-full group-hover:translate-y-0 transition-transform">
                <Camera className="h-3 w-3 inline mr-1 text-yellow" />
                {g.alt}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
