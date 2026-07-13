#!/usr/bin/env python3
"""
Demos Pizza — Mobil uygulama ikonu işleme scripti.
Kaynak görseli (1024x1536) kareye kırpıp tüm ikon boyutlarını üretir.
Performans için PNG optimizasyonu yapar.
"""

import os
from PIL import Image, ImageDraw, ImageFilter

# Yollar
SRC = "/home/z/my-project/upload/Demo's Pizza mobil uygulama simgesi.png"
PUBLIC = "/home/z/my-project/public"

# Üretilecek boyutlar
SIZES = {
    "icon-192.png": 192,
    "icon-512.png": 512,
    "apple-icon.png": 180,
    "icon-32.png": 32,
    "icon-16.png": 16,
}

def center_crop_to_square(img: Image.Image) -> Image.Image:
    """Merkezden kareye kırp."""
    w, h = img.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    return img.crop((left, top, left + side, top + side))

def add_safe_area(img: Image.Image, bg_color: tuple) -> Image.Image:
    """
    PWA maskable icon için %10 güvenli alan ekle.
    İkon içeriği ortada %80'lik alanda kalsın, geri kalanı arka plan.
    """
    w, h = img.size
    padding = int(w * 0.10)
    canvas = Image.new("RGBA", (w + padding * 2, h + padding * 2), bg_color)
    canvas.paste(img, (padding, padding), img if img.mode == "RGBA" else None)
    return canvas

def optimize_png(img: Image.Image, path: str, size: int):
    """PNG'yi optimize et — palet modu, sıkıştırma."""
    # RGBA'dan RGB'ye (beyaz arka plan ile) — dosya boyutu küçülür
    if img.mode == "RGBA":
        # Şeffaf pikselleri siyah yap (ikon arka planı)
        bg = Image.new("RGB", img.size, (17, 17, 17))  # #111111 ink
        bg.paste(img, mask=img.split()[3])
        img = bg
    elif img.mode != "RGB":
        img = img.convert("RGB")

    img.save(path, "PNG", optimize=True, compress_level=9)
    file_kb = os.path.getsize(path) / 1024
    print(f"  {os.path.basename(path)}: {size}x{size} → {file_kb:.1f} KB")

def main():
    print(f"Kaynak: {SRC}")

    # Kaynak görseli aç
    src = Image.open(SRC)
    print(f"Orijinal boyut: {src.size}, mod: {src.mode}")

    # Kareye kırp
    square = center_crop_to_square(src)
    print(f"Kare kırpıldı: {square.size}")

    # Maskable ikon için güvenli alanlı versiyon (192 ve 512 için)
    # %10 padding ile
    INK_BG = (17, 17, 17, 255)  # #111111
    square_with_padding = add_safe_area(square, INK_BG)
    # Padding'li versiyonu tekrar orijinal boyuta küçült (192/512)
    # Böylece içerik %80 ortada, %10 border var

    # Her boyut için üret
    for filename, size in SIZES.items():
        out_path = os.path.join(PUBLIC, filename)

        if filename in ("icon-192.png", "icon-512.png"):
            # Maskable: güvenli alan ile
            resized = square_with_padding.resize((size, size), Image.LANCZOS)
        else:
            # Normal: direkt kare
            resized = square.resize((size, size), Image.LANCZOS)

        optimize_png(resized, out_path, size)

    # WebP formatında da üret (daha küçük dosya, modern tarayıcılar için)
    # Sadece 512'yi WebP yap (fallback olarak PNG kalır)
    webp_512 = square.resize((512, 512), Image.LANCZOS)
    if webp_512.mode == "RGBA":
        bg = Image.new("RGB", webp_512.size, (17, 17, 17))
        bg.paste(webp_512, mask=webp_512.split()[3])
        webp_512 = bg
    webp_path = os.path.join(PUBLIC, "icon-512.webp")
    webp_512.save(webp_path, "WEBP", quality=85, method=6)
    webp_kb = os.path.getsize(webp_path) / 1024
    print(f"  icon-512.webp: 512x512 → {webp_kb:.1f} KB")

    print("\n✅ Tüm ikonlar üretildi.")

if __name__ == "__main__":
    main()
