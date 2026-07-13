#!/usr/bin/env python3
"""
Tüm admin route handler'larında requireAdmin() → requireAdmin(req) güncellemesi.
Her handler'da req parametresi var, bu yüzden güvenli.
"""
import os
import re

ADMIN_API_DIR = "/home/z/my-project/src/app/api/admin"

def process_file(filepath):
    with open(filepath, "r") as f:
        content = f.read()

    # requireAdmin() → requireAdmin(req)
    # Sadece handler fonksiyonlarında (req parametresi olan)
    new_content = re.sub(
        r'const auth = await requireAdmin\(\);',
        'const auth = await requireAdmin(req);',
        content
    )

    if new_content != content:
        with open(filepath, "w") as f:
            f.write(new_content)
        count = content.count("const auth = await requireAdmin();")
        print(f"  {filepath}: {count} güncelleme")
        return True
    return False

def main():
    print("Admin route handler'ları güncelleniyor...")
    total = 0
    for root, dirs, files in os.walk(ADMIN_API_DIR):
        for f in files:
            if f == "route.ts":
                filepath = os.path.join(root, f)
                if process_file(filepath):
                    total += 1
    print(f"\n✅ {total} dosya güncellendi.")

if __name__ == "__main__":
    main()
