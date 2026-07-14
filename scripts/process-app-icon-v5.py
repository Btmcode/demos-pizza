#!/usr/bin/env python3
"""
Demos Pizza — App icon v5.
Kullanıcının orijinal ikon görselini kullanır (pizza + yazı),
tamamı kare alanı doldurur (şeffaf padding yok).
Solid koyu arka plan — Android'de beyaz görünmez.
"""

import os
from PIL import Image

SRC = "/home/z/my-project/upload/Demo's Pizza mobil uygulama simgesi.png"
PUBLIC = "/home/z/my-project/public"

def center_crop_to_square(img):
    w, h = img.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    return img.crop((left, top, left + side, top + side))

def make_icon(square, size, path, format="PNG"):
    """
    Orijinal ikonu kareye kırp, solid koyu arka plan ile birleştir.
    İçerik %100 alanı doldurur (padding yok).
    """
    if square.mode != "RGBA":
        square = square.convert("RGBA")
    
    # Solid koyu arka plan (#0d0500) — maskable için gerekli
    bg_color = (13, 5, 0, 255)
    canvas = Image.new("RGBA", (size, size), bg_color)
    
    # Orijinal görseli tam boyuta getir (%100 doldur)
    resized = square.resize((size, size), Image.LANCZOS)
    
    # Görseli arka planın üzerine yapıştır (alpha ile)
    canvas.paste(resized, (0, 0), resized)
    
    if format == "PNG":
        canvas.save(path, "PNG", optimize=True, compress_level=9)
    elif format == "WEBP":
        canvas.save(path, "WEBP", quality=92, method=6)
    
    file_kb = os.path.getsize(path) / 1024
    print(f"  {os.path.basename(path)}: {size}x{size} → {file_kb:.1f} KB")

def main():
    print("Orijinal ikon, tam alan dolduracak şekilde...\n")
    
    src = Image.open(SRC)
    square = center_crop_to_square(src)
    print(f"Kaynak: {src.size} → Kare: {square.size}\n")
    
    # PNG — tüm boyutlar
    print("--- PNG ---")
    sizes = {
        "icon-192.png": 192,
        "icon-512.png": 512,
        "apple-icon.png": 180,
        "icon-32.png": 32,
        "icon-16.png": 16,
        "icon-maskable-192.png": 192,
        "icon-maskable-512.png": 512,
    }
    for filename, size in sizes.items():
        make_icon(square, size, os.path.join(PUBLIC, filename), "PNG")
    
    # WebP
    print("\n--- WebP ---")
    webp_sizes = {
        "icon-192.webp": 192,
        "icon-512.webp": 512,
        "icon-1024.webp": 1024,
    }
    for filename, size in webp_sizes.items():
        make_icon(square, size, os.path.join(PUBLIC, filename), "WEBP")
    
    print("\n✅ İkon tamam — orijinal görsel, tam alan, solid bg")

if __name__ == "__main__":
    main()
