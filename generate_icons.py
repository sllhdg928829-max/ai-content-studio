"""Generate Chrome extension icons."""
from PIL import Image, ImageDraw

SIZES = [16, 48, 128]
ICON_DIR = "chrome-extension/icons"

import os
os.makedirs(ICON_DIR, exist_ok=True)

for size in SIZES:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    margin = max(1, size // 8)
    r = size // 2 - margin

    # Gradient-like background (blue-purple)
    cx, cy = size // 2, size // 2
    for y in range(size):
        for x in range(size):
            dx, dy = x - cx, y - cy
            dist = (dx * dx + dy * dy) ** 0.5
            if dist < r:
                ratio = dy / (r + 1) + 0.5
                r_val = int(99 + ratio * 50)
                g_val = int(66 + (1 - abs(ratio - 0.5) * 2) * 60)
                b_val = int(234 - ratio * 50)
                img.putpixel((x, y), (r_val, g_val, b_val, 255))

    # White "笔" character approximation - a simple pen icon
    pen_color = (255, 255, 255, 255)
    pw = max(1, size // 16)  # pen width

    # Pen body (diagonal line)
    if size >= 48:
        for i in range(int(r * 0.8)):
            x1 = int(cx - r * 0.4 + i * 0.7)
            y1 = int(cy + r * 0.3 - i * 0.7)
            for w in range(pw):
                for h in range(pw):
                    px, py = x1 + w, y1 + h
                    if 0 <= px < size and 0 <= py < size:
                        img.putpixel((px, py), pen_color)

        # Pen tip
        tip_x = int(cx + r * 0.4)
        tip_y = int(cy - r * 0.2)
        for i in range(pw * 2):
            for j in range(pw * 2):
                px, py = tip_x + i - pw, tip_y + j - pw
                if 0 <= px < size and 0 <= py < size:
                    img.putpixel((px, py), (255, 200, 50, 255))
    else:
        # Simple "A" for small sizes
        draw.text((size // 4, size // 4), "A", fill="white")

    filepath = os.path.join(ICON_DIR, f"icon{size}.png")
    img.save(filepath)
    print(f"Created {filepath}")

print("Done!")
