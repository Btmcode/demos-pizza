#!/usr/bin/env python3
"""
Demos Pizza — Mobil uygulama ikonu işleme scripti (v2).
Kaynak görseli (1024x1536, transparent background) kareye kırpıp
tüm ikon boyutlarını üretir.

Bu sefer:
- Arka plan şeffaf kalır (transparent PNG)
- WebP formatında da üretir (daha küçük dosya)
- Apple touch icon, favicon, PWA icon'ları tümü aynı görseli kullanır
- Maskable icon için güvenli alan eklenmez (transparent zaten)
"""

import os
from PIL import Image

# Yollar
SRC = "/home/z/my-project/upload/Demo's Pizza mobil uygulama simgesi.png"
PUBLIC = "/home/z/my-project/public"

# Üretilecek boyutlar — tüm platformlar için
SIZES = {
    # PWA icons (manifest.json)
    "icon-192.png": 192,
    "icon-512.png": 512,
    # Apple touch icon
    "apple-icon.png": 180,
    # Favicon boyutları
    "icon-32.png": 32,
    "icon-16.png": 16,
}

def center_crop_to_square(img: Image.Image) -> Image.Image:
    """Merkezden kareye kırp — içerik ortada olsun"""
    w, h = img.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    return img.crop((left, top, left + side, top + side))

def optimize_png_transparent(img: Image.Image, path: str, size: int):
    """PNG'yi şeffaf arka planla optimize et."""
    # RGBA modunda tut (şeffaflık için)
    if img.mode != "RGBA":
        img = img.convert("RGBA")
    
    resized = img.resize((size, size), Image.LANCZOS)
    resized.save(path, "PNG", optimize=True, compress_level=9)
    file_kb = os.path.getsize(path) / 1024
    print(f"  {os.path.basename(path)}: {size}x{size} → {file_kb:.1f} KB (transparent)")

def optimize_webp_transparent(img: Image.Image, path: str, size: int):
    """WebP formatında şeffaf arka_planla üret — daha küçük dosya."""
    if img.mode != "RGBA":
        img = img.convert("RGBA")
    
    resized = img.resize((size, size), Image.LANCZOS)
    # quality=90 + method=6 = en iyi sıkıştırma
    resized.save(path, "WEBP", quality=90, method=6, lossless=False)
    file_kb = os.path.getsize(path) / 1024
    print(f"  {os.path.basename(path)}: {size}x{size} → {file_kb:.1f} KB (transparent WebP)")

def main():
    print(f"Kaynak: {SRC}")

    # Kaynak görseli aç
    src = Image.open(SRC)
    print(f"Orijinal boyut: {src.size}, mod: {src.mode}")

    # Kareye kırp (merkezden)
    square = center_crop_to_square(src)
    print(f"Kare kırpıldı: {square.size}")

    # Tüm PNG boyutları
    print("\n--- PNG (transparent) ---")
    for filename, size in SIZES.items():
        out_path = os.path.join(PUBLIC, filename)
        optimize_png_transparent(square, out_path, size)

    # WebP versiyonları (modern tarayıcılar için, daha küçük)
    print("\n--- WebP (transparent, modern tarayıcılar) ---")
    webp_sizes = {
        "icon-192.webp": 192,
        "icon-512.webp": 512,
    }
    for filename, size in webp_sizes.items():
        out_path = os.path.join(PUBLIC, filename)
        optimize_webp_transparent(square, out_path, size)

    # 1024x1024 tam çözünürlük (og:image, Apple splash screen için)
    full_path = os.path.join(PUBLIC, "icon-1024.png")
    optimize_png_transparent(square, full_path, 1024)

    print("\n✅ Tüm ikonlar üretildi (şeffaf arka plan, tam ikon)")

if __name__ == "__main__":
    main()
