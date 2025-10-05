#!/usr/bin/env python3
"""Create disabled (gray) icons for the extension when protection is OFF"""

from PIL import Image, ImageDraw

def create_disabled_icon(size, filename):
    # Create a gray/disabled version of the icon
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Gray shield outline (disabled state)
    center = size // 2
    shield_width = int(size * 0.7)
    shield_height = int(size * 0.8)
    
    # Shield outline points
    top = center - shield_height // 2
    bottom = center + shield_height // 2
    left = center - shield_width // 2
    right = center + shield_width // 2
    
    # Create shield shape with gray color (disabled)
    points = [
        (center, top),
        (right, top + shield_height // 4),
        (right, bottom - shield_height // 4),
        (center, bottom),
        (left, bottom - shield_height // 4),
        (left, top + shield_height // 4)
    ]
    
    # Fill with gray (disabled)
    draw.polygon(points, fill=(128, 128, 128, 200), outline=(64, 64, 64, 255))
    
    # Add an "X" or slash to indicate disabled
    line_width = max(2, size // 16)
    draw.line([(left + 5, top + 5), (right - 5, bottom - 5)], fill=(255, 0, 0, 255), width=line_width)
    draw.line([(right - 5, top + 5), (left + 5, bottom - 5)], fill=(255, 0, 0, 255), width=line_width)
    
    img.save(filename, 'PNG')
    print(f"Created disabled icon: {filename} ({size}x{size})")

# Create disabled icons
create_disabled_icon(16, 'icon16_disabled.png')
create_disabled_icon(48, 'icon48_disabled.png') 
create_disabled_icon(128, 'icon128_disabled.png')

print("All disabled icons created successfully!")