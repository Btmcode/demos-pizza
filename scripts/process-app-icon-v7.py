#!/usr/bin/env python3
"""
Demos Pizza — App icon v7.
%5 daha büyük — content'i crop ettikten sonra biraz zoom yap.
"""

import os
from PIL import Image

SRC = "/home/z/my-project/upload/Demo's Pizza mobil uygulama simgesi.png"
PUBLIC = "/home/z/my-project/public"

def crop_to_content(img):
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

def zoom_content(img, zoom_pct=5):
    """İçeriği zoom yap — merkezi %zoom_pct büyüt, kenarları kes"""
    if zoom_pct <= 0:
        return img
    w, h = img.size
    # Zoom yapılacak miktar — her kenardan kesilecek
    crop_amount_w = int(w * zoom_pct / 100 / 2)
    crop_amount_h = int(h * zoom_pct / 100 / 2)
    left = crop_amount_w
    top = crop_amount_h
    right = w - crop_amount_w
    bottom = h - crop_amount_h
    cropped = img.crop((left, top, right, bottom))
    # Orijinal boyuta geri getir
    return cropped.resize((w, h), Image.LANCZOS)

def make_icon(square, size, path, format="PNG"):
    if square.mode != "RGBA":
        square = square.convert("RGBA")
    
    bg_color = (13, 5, 0, 255)
    canvas = Image.new("RGBA", (size, size), bg_color)
    
    resized = square.resize((size, size), Image.LANCZOS)
    canvas.paste(resized, (0, 0), resized)
    
    if format == "PNG":
        canvas.save(path, "PNG", optimize=True, compress_level=9)
    elif format == "WEBP":
        canvas.save(path, "WEBP", quality=92, method=6)
    
    file_kb = os.path.getsize(path) / 1024
    print(f"  {os.path.basename(path)}: {size}x{size} → {file_kb:.1f} KB")

def main():
    print("İkon %5 daha büyütülüyor (zoom content)...\n")
    
    src = Image.open(SRC)
    cropped = crop_to_content(src)
    square = center_crop_to_square(cropped)
    
    # %5 zoom yap — içerik daha büyük görünsün
    zoomed = zoom_content(square, zoom_pct=5)
    print(f"Content crop + zoom: {zoomed.size}\n")
    
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
        make_icon(zoomed, size, os.path.join(PUBLIC, filename), "PNG")
    
    print("\n--- WebP ---")
    webp_sizes = {
        "icon-192.webp": 192,
        "icon-512.webp": 512,
        "icon-1024.webp": 1024,
    }
    for filename, size in webp_sizes.items():
        make_icon(zoomed, size, os.path.join(PUBLIC, filename), "WEBP")
    
    print("\n✅ İkon %5 büyütüldü (zoom content)")

if __name__ == "__main__":
    main()
