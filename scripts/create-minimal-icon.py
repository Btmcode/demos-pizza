#!/usr/bin/env python3
"""
Demos Pizza — Minimal app icon (Uber/e-Devlet style)
Tasarım:
- Solid siyah arka plan (#0d0500 - koyu kahve/siyah)
- Merkezde: Pizza dilimi sembolü (basit, ikonik)
- Sarı/altın renkli pizza, pembe sos damlaları
- Minimal, temiz, profesyonel
"""

import os
from PIL import Image, ImageDraw, ImageFilter
import math

PUBLIC = "/home/z/my-project/public"

def create_pizza_icon(size):
    """Minimal pizza ikonu üret - Uber tarzı, solid bg"""
    # Canvas — solid koyu arka plan
    bg_color = (13, 5, 0, 255)  # #0d0500 — çok koyu, neredeyse siyah
    img = Image.new("RGBA", (size, size), bg_color)
    draw = ImageDraw.Draw(img)
    
    cx, cy = size // 2, size // 2
    radius = int(size * 0.32)  # İkon boyutu
    
    # Pizza dilimi — üçgen şeklinde
    # Üç köşe noktası: üst, sol-alt, sağ-alt
    top = (cx, cy - radius)
    bottom_left = (cx - int(radius * 0.87), cy + int(radius * 0.5))
    bottom_right = (cx + int(radius * 0.87), cy + int(radius * 0.5))
    
    # Pizza kenarı (kabuk) — koyu sarı/altın
    crust_color = (255, 196, 0, 255)  # #FFC400
    # Önce kalın bir üçgen (kabuk)
    crust_points = [top, bottom_left, bottom_right]
    draw.polygon(crust_points, fill=crust_color)
    
    # Pizza içi (söz) — biraz daha küçük üçgen, daha açık sarı
    inner_offset = int(radius * 0.12)
    inner_top = (cx, cy - radius + inner_offset)
    inner_bl = (cx - int(radius * 0.87) + int(inner_offset * 0.8), cy + int(radius * 0.5) - int(inner_offset * 0.3))
    inner_br = (cx + int(radius * 0.87) - int(inner_offset * 0.8), cy + int(radius * 0.5) - int(inner_offset * 0.3))
    inner_color = (255, 220, 100, 255)  # Açık sarı - peynir
    
    draw.polygon([inner_top, inner_bl, inner_br], fill=inner_color)
    
    # Sos damlaları (pepperoni) — pembe noktalar
    pepperoni_color = (255, 45, 141, 255)  # #FF2D8D - pembe
    
    # 3 pepperoni noktası
    dot_radius = max(2, int(size * 0.035))
    # Üst nokta
    draw.ellipse(
        [cx - dot_radius, cy - int(radius * 0.4) - dot_radius,
         cx + dot_radius, cy - int(radius * 0.4) + dot_radius],
        fill=pepperoni_color
    )
    # Sol nokta
    draw.ellipse(
        [cx - int(radius * 0.4) - dot_radius, cy + int(radius * 0.1) - dot_radius,
         cx - int(radius * 0.4) + dot_radius, cy + int(radius * 0.1) + dot_radius],
        fill=pepperoni_color
    )
    # Sağ nokta
    draw.ellipse(
        [cx + int(radius * 0.3) - dot_radius, cy + int(radius * 0.15) - dot_radius,
         cx + int(radius * 0.3) + dot_radius, cy + int(radius * 0.15) + dot_radius],
        fill=pepperoni_color
    )
    
    # Hafif blur ile kenarları yumuşat (anti-aliasing efekti)
    if size >= 64:
        img = img.filter(ImageFilter.GaussianBlur(radius=0.5))
    
    return img

def main():
    print("Minimal Demos Pizza ikonu üretiliyor (Uber tarzı)...")
    print("Tasarım: Solid siyah bg + sarı pizza dilimi + pembe pepperoni\n")
    
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
        img = create_pizza_icon(size)
        path = os.path.join(PUBLIC, filename)
        img.save(path, "PNG", optimize=True, compress_level=9)
        file_kb = os.path.getsize(path) / 1024
        print(f"  {filename}: {size}x{size} → {file_kb:.1f} KB")
    
    # WebP versiyonları
    print("\nWebP formatında:")
    webp_sizes = {
        "icon-192.webp": 192,
        "icon-512.webp": 512,
        "icon-1024.webp": 1024,
    }
    for filename, size in webp_sizes.items():
        img = create_pizza_icon(size)
        path = os.path.join(PUBLIC, filename)
        img.save(path, "WEBP", quality=95, method=6)
        file_kb = os.path.getsize(path) / 1024
        print(f"  {filename}: {size}x{size} → {file_kb:.1f} KB")
    
    print("\n✅ Minimal ikon üretildi — Uber/e-Devlet tarzı")

if __name__ == "__main__":
    main()
