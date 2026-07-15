#!/usr/bin/env python3
"""
Demos Pizza — Maskable icon generator.
Maskable icon'lar için solid arka plan gerekir (şeffaflık desteklenmez).
Android/iOS maskable rendering'de beyaz arka plan oluşmasını önler.
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

def make_maskable_icon(square, size, path):
    """
    Maskable icon — solid koyu arka plan + içerik %80 safe area'da.
    Android bunu kullanır, beyaz arka plan oluşmaz.
    """
    if square.mode != "RGBA":
        square = square.convert("RGBA")
    
    # Solid koyu arka plan (#0d0500 — splash ile aynı)
    bg_color = (13, 5, 0, 255)  # #0d0500
    canvas = Image.new("RGBA", (size, size), bg_color)
    
    # İçeriği %75 oranında yerleştir (maskable safe area = %80)
    # Biraz küçük tut ki Android kesince içerik kaybolmasın
    content_size = int(size * 0.75)
    resized = square.resize((content_size, content_size), Image.LANCZOS)
    
    # Merkeze yerleştir
    offset = (size - content_size) // 2
    canvas.paste(resized, (offset, offset), resized)
    
    canvas.save(path, "PNG", optimize=True, compress_level=9)
    file_kb = os.path.getsize(path) / 1024
    print(f"  {os.path.basename(path)}: {size}x{size} → {file_kb:.1f} KB (maskable, solid bg)")

def make_any_icon(square, size, path, format="PNG"):
    """
    Any purpose icon — şeffaf arka plan, içerik büyük (%95).
    Modern tarayıcılar bunu kullanır.
    """
    if square.mode != "RGBA":
        square = square.convert("RGBA")
    
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    content_size = int(size * 0.95)
    resized = square.resize((content_size, content_size), Image.LANCZOS)
    offset = (size - content_size) // 2
    canvas.paste(resized, (offset, offset), resized)
    
    if format == "PNG":
        canvas.save(path, "PNG", optimize=True, compress_level=9)
    elif format == "WEBP":
        canvas.save(path, "WEBP", quality=92, method=6)
    
    file_kb = os.path.getsize(path) / 1024
    print(f"  {os.path.basename(path)}: {size}x{size} → {file_kb:.1f} KB (any, transparent)")

def main():
    print(f"Kaynak: {SRC}")
    src = Image.open(SRC)
    square = center_crop_to_square(src)
    print(f"Kare: {square.size}\n")
    
    # Any purpose — şeffaf, büyük ikon
    print("--- Any purpose (transparent, modern browsers) ---")
    make_any_icon(square, 192, os.path.join(PUBLIC, "icon-192.png"), "PNG")
    make_any_icon(square, 512, os.path.join(PUBLIC, "icon-512.png"), "PNG")
    make_any_icon(square, 180, os.path.join(PUBLIC, "apple-icon.png"), "PNG")
    make_any_icon(square, 32, os.path.join(PUBLIC, "icon-32.png"), "PNG")
    make_any_icon(square, 16, os.path.join(PUBLIC, "icon-16.png"), "PNG")
    make_any_icon(square, 192, os.path.join(PUBLIC, "icon-192.webp"), "WEBP")
    make_any_icon(square, 512, os.path.join(PUBLIC, "icon-512.webp"), "WEBP")
    make_any_icon(square, 1024, os.path.join(PUBLIC, "icon-1024.webp"), "WEBP")
    
    # Maskable purpose — solid arka plan, safe area
    print("\n--- Maskable purpose (solid bg, Android/iOS) ---")
    make_maskable_icon(square, 192, os.path.join(PUBLIC, "icon-maskable-192.png"))
    make_maskable_icon(square, 512, os.path.join(PUBLIC, "icon-maskable-512.png"))
    
    print("\n✅ Tüm ikonlar üretildi")

if __name__ == "__main__":
    main()
