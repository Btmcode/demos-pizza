"use client";

const TOPPINGS_LEFT = [
  "San Marzano", "Mozzarella", "Taze Basilikum", "Antep Fıstığı",
  "Sucuk", "Pastırma", "Burrata", "Prosciutto",
  "Gorgonzola", "Parmesan", "Roka", "Balsamik",
];

const TOPPINGS_RIGHT = [
  "Közlenmiş Biber", "Mantar", "Jalapeño", "Kapya Biber",
  "Mısır", "Zeytin", "Soğan", "Sarımsak",
  "Kekik", "Pul Biber", "Limon", "Çam Fıstığı",
];

export function ToppingsMarquee() {
  return (
    <section className="bg-ink text-white py-10 md:py-12 overflow-hidden border-y border-ink-2">
      <div className="space-y-2.5">
        <div className="flex overflow-hidden">
          <div className="flex marquee-l whitespace-nowrap">
            {[...TOPPINGS_LEFT, ...TOPPINGS_LEFT].map((t, i) => (
              <span key={i} className="inline-flex items-center mx-5">
                <span className="font-display text-xl md:text-2xl text-white/85 italic">
                  {t}
                </span>
                <span className="ml-10 text-yellow text-xs">●</span>
              </span>
            ))}
          </div>
        </div>
        <div className="flex overflow-hidden">
          <div className="flex marquee-r whitespace-nowrap">
            {[...TOPPINGS_RIGHT, ...TOPPINGS_RIGHT].map((t, i) => (
              <span key={i} className="inline-flex items-center mx-5">
                <span className="text-yellow text-xs">●</span>
                <span className="ml-10 font-display text-xl md:text-2xl text-white/85">
                  {t}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
