"use client";

const TOPPINGS_LEFT = [
  "San Marzano",
  "Mozzarella di Bufala",
  "Fior di Latte",
  "Taze Basilikum",
  "Antep Fıstığı",
  "Sucuk",
  "Pastırma",
  "Burrata",
  "Siyah Trüf",
  "Prosciutto di Parma",
  "Gorgonzola",
  "Parmigiano Reggiano",
  "Roka",
  "Balsamik Glaze",
  "Çeri Domates",
];

const TOPPINGS_RIGHT = [
  "Közlenmiş Biber",
  "Mantar",
  "Jalapeño",
  "Kapya Biber",
  "Mısır",
  "Zeytin",
  "Soğan",
  "Sarımsak",
  "Kekik",
  "Pul Biber",
  "Limon",
  "Çam Fıstığı",
  "Yumurta",
  "Kaşar",
  "Lor Peyniri",
];

export function ToppingsMarquee() {
  return (
    <section className="bg-charcoal text-cream py-12 md:py-16 overflow-hidden relative">
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="font-display font-bold text-[180px] md:text-[280px] text-cream/[0.04] select-none whitespace-nowrap">
          TOPPINGS
        </span>
      </div>

      <div className="relative space-y-3">
        <div className="flex overflow-hidden">
          <div className="flex marquee-l whitespace-nowrap">
            {[...TOPPINGS_LEFT, ...TOPPINGS_LEFT].map((t, i) => (
              <span key={i} className="inline-flex items-center mx-6">
                <span className="font-display text-2xl md:text-3xl text-cream/85 italic">
                  {t}
                </span>
                <span className="ml-12 text-saffron">●</span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex overflow-hidden">
          <div className="flex marquee-r whitespace-nowrap">
            {[...TOPPINGS_RIGHT, ...TOPPINGS_RIGHT].map((t, i) => (
              <span key={i} className="inline-flex items-center mx-6">
                <span className="text-saffron">●</span>
                <span className="ml-12 font-display text-2xl md:text-3xl text-cream/85">
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
