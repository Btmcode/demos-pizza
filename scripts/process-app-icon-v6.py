#!/usr/bin/env python3
"""
Demos Pizza — App icon v6.
İkonu %20 daha büyük yap — content bounding box'a kırp, tam alan doldur.
"""

import os
from PIL import Image

SRC = "/home/z/my-project/upload/Demo's Pizza mobil uygulama simgesi.png"
PUBLIC = "/home/z/my-project/public"

def crop_to_content(img):
    """Şeffaf padding'i kaldır — sadece içerik alanını al"""
    if img.mode != "RGBA":
        img = img.convert("RGBA")
    bbox = img.getbbox()
    if bbox:
        return img.crop(bbox)
    return img

def center_crop_to_square(img):
    w, h = img.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    return img.crop((left, top, left + side, top + side))

def make_icon(square, size, path, format="PNG"):
    if square.mode != "RGBA":
        square = square.convert("RGBA")
    
    # Solid koyu arka plan
    bg_color = (13, 5, 0, 255)
    canvas = Image.new("RGBA", (size, size), bg_color)
    
    # İçerik %100 doldur (padding yok — %20 büyütülmüş)
    resized = square.resize((size, size), Image.LANCZOS)
    canvas.paste(resized, (0, 0), resized)
    
    if format == "PNG":
        canvas.save(path, "PNG", optimize=True, compress_level=9)
    elif format == "WEBP":
        canvas.save(path, "WEBP", quality=92, method=6)
    
    file_kb = os.path.getsize(path) / 1024
    print(f"  {os.path.basename(path)}: {size}x{size} → {file_kb:.1f} KB")

def main():
    print("İkon %20 büyütülüyor (content crop + full bleed)...\n")
    
    src = Image.open(SRC)
    print(f"Orijinal: {src.size}")
    
    # Önce şeffaf padding'i kaldır
    cropped = crop_to_content(src)
    print(f"Content crop: {cropped.size}")
    
    # Kareye kırp
    square = center_crop_to_square(cropped)
    print(f"Kare: {square.size}\n")
    
    # PNG
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
    
    print("\n✅ İkon %20 büyütüldü — content crop + full bleed")

if __name__ == "__main__":
    main()
