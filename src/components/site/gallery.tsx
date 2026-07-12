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
    <section id="galeri" className="bg-charcoal text-cream py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-saffron text-xs font-mono uppercase tracking-[0.3em]">
            {"// Galeri"}
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mt-3">
            Lezzetin <span className="text-saffron italic">portresi</span>
          </h2>
          <p className="mt-4 text-cream/70 max-w-xl mx-auto">
            Her pizza bir sanat eseri. Taş fırından çıkan anları gözünüzle tadın.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] md:auto-rows-[220px] gap-3">
          {GALLERY.map((g, i) => (
            <figure
              key={i}
              className={`group relative overflow-hidden rounded-xl bg-smoke ${g.span}`}
            >
              <img
                src={g.src}
                alt={g.alt}
                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <figcaption className="absolute bottom-0 inset-x-0 p-3 text-xs text-cream/90 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all">
                <Camera className="h-3 w-3 inline mr-1 text-saffron" />
                {g.alt}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
