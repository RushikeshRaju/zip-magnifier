import os
import base64
from PIL import Image

src_path = r"C:\Users\HP\.gemini\antigravity-ide\brain\2d49ec7f-55f8-41b2-94d3-0834c423ecbc\.user_uploaded\media_1789497973346.png"
dest_dir = os.path.abspath(r"artifacts\projectlens\public")
os.makedirs(dest_dir, exist_ok=True)

im = Image.open(src_path).convert("RGBA")

# Get bounding box of visible content
alpha = im.split()[-1]
thresh_alpha = alpha.point(lambda p: 255 if p > 5 else 0)
bbox = thresh_alpha.getbbox()

cropped = im.crop(bbox)
cw, ch = cropped.size

# Square canvas with 6% padding for optimal browser tab framing
margin = 0.06
max_dim = max(cw, ch)
canvas_dim = int(max_dim * (1 + 2 * margin))

master = Image.new("RGBA", (canvas_dim, canvas_dim), (0, 0, 0, 0))
offset_x = (canvas_dim - cw) // 2
offset_y = (canvas_dim - ch) // 2
master.paste(cropped, (offset_x, offset_y), cropped)

# 1. High-res 512x512 PNG
p512 = master.resize((512, 512), Image.Resampling.LANCZOS)
p512_path = os.path.join(dest_dir, "favicon-512x512.png")
p512.save(p512_path, "PNG")
p512.save(os.path.join(dest_dir, "favicon.png"), "PNG")

# 2. Apple touch icon (180x180)
p180 = master.resize((180, 180), Image.Resampling.LANCZOS)
p180.save(os.path.join(dest_dir, "apple-touch-icon.png"), "PNG")

# 3. Standard favicon sizes (32x32 and 16x16)
p32 = master.resize((32, 32), Image.Resampling.LANCZOS)
p32.save(os.path.join(dest_dir, "favicon-32x32.png"), "PNG")

p16 = master.resize((16, 16), Image.Resampling.LANCZOS)
p16.save(os.path.join(dest_dir, "favicon-16x16.png"), "PNG")

# 4. Standard multi-size ICO (16, 32, 48)
master.save(
    os.path.join(dest_dir, "favicon.ico"),
    format="ICO",
    sizes=[(16, 16), (32, 32), (48, 48)],
)

# 5. Crisp vector-wrapped SVG for modern browsers
with open(p512_path, "rb") as f:
    b64_data = base64.b64encode(f.read()).decode("utf-8")

svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <image href="data:image/png;base64,{b64_data}" width="512" height="512" />
</svg>
'''
with open(os.path.join(dest_dir, "favicon.svg"), "w", encoding="utf-8") as f:
    f.write(svg_content)

print("Favicon assets generated successfully in:", dest_dir)
