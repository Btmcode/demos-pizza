#!/usr/bin/env python3
"""
Demos Pizza — Mobil uygulama ikonu v3.
İkonu daha büyük yap (maskable safe area'ya göre).
Arka plan şeffaf kalır ama içerik %90+ alanı kaplar.
"""

import os
from PIL import Image, ImageDraw

SRC = "/home/z/my-project/upload/Demo's Pizza mobil uygulama simgesi.png"
PUBLIC = "/home/z/my-project/public"

def center_crop_to_square(img):
    w, h = img.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    return img.crop((left, top, left + side, top + side))

def make_icon(square, size, path, format="PNG"):
    """İkonu üret — içerik büyük, şeffaf arka plan"""
    if square.mode != "RGBA":
        square = square.convert("RGBA")
    
    # Canvas — şeffaf
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    
    # İçeriği %95 oranında yerleştir (maskable safe area = %80, biz %95 yapıyoruz)
    # Bu sayede ikon büyük görünür, beyaz kenar boşluğu olmaz
    content_size = int(size * 0.95)
    resized = square.resize((content_size, content_size), Image.LANCZOS)
    
    # Merkeze yerleştir
    offset = (size - content_size) // 2
    canvas.paste(resized, (offset, offset), resized)
    
    if format == "PNG":
        canvas.save(path, "PNG", optimize=True, compress_level=9)
    elif format == "WEBP":
        canvas.save(path, "WEBP", quality=92, method=6)
    
    file_kb = os.path.getsize(path) / 1024
    print(f"  {os.path.basename(path)}: {size}x{size} → {file_kb:.1f} KB")
    return canvas

def main():
    print(f"Kaynak: {SRC}")
    src = Image.open(SRC)
    print(f"Orijinal: {src.size}, {src.mode}")
    
    square = center_crop_to_square(src)
    print(f"Kare: {square.size}")
    
    # PNG — tüm boyutlar
    print("\n--- PNG (transparent, büyük ikon) ---")
    sizes = {
        "icon-192.png": 192,
        "icon-512.png": 512,
        "apple-icon.png": 180,
        "icon-32.png": 32,
        "icon-16.png": 16,
    }
    for filename, size in sizes.items():
        make_icon(square, size, os.path.join(PUBLIC, filename), "PNG")
    
    # WebP — modern tarayıcılar
    print("\n--- WebP (transparent, küçük dosya) ---")
    webp_sizes = {
        "icon-192.webp": 192,
        "icon-512.webp": 512,
        "icon-1024.webp": 1024,
    }
    for filename, size in webp_sizes.items():
        make_icon(square, size, os.path.join(PUBLIC, filename), "WEBP")
    
    print("\n✅ Tüm ikonlar üretildi — içerik %95 alanı kaplıyor")

if __name__ == "__main__":
    main()
