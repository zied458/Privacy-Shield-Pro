#!/usr/bin/env python3
"""Create shield icons for the extension"""

from PIL import Image, ImageDraw

def create_shield_icon(size, filename):
    # Create a proper shield icon
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Shield dimensions
    center_x = size // 2
    center_y = size // 2
    width = int(size * 0.75)
    height = int(size * 0.85)
    
    # Shield coordinates
    top = center_y - height // 2 + 2
    bottom = center_y + height // 2 - 2
    left = center_x - width // 2
    right = center_x + width // 2
    
    # Create shield shape with curved bottom
    shield_points = [
        (center_x, top),                    # Top point
        (right - 4, top + 8),               # Top right curve
        (right, top + height // 3),         # Right side
        (right, bottom - height // 4),      # Right bottom
        (center_x + 4, bottom - 4),         # Bottom right curve
        (center_x, bottom),                 # Bottom point
        (center_x - 4, bottom - 4),         # Bottom left curve  
        (left, bottom - height // 4),       # Left bottom
        (left, top + height // 3),          # Left side
        (left + 4, top + 8)                 # Top left curve
    ]
    
    # Draw shield with blue color (not green!)
    draw.polygon(shield_points, fill=(33, 150, 243, 255), outline=(21, 101, 192, 255))
    
    # Add inner highlight
    inner_points = [
        (center_x, top + 4),
        (right - 8, top + 12),
        (right - 4, top + height // 3),
        (right - 4, bottom - height // 3),
        (center_x, bottom - 8),
        (left + 4, bottom - height // 3),
        (left + 4, top + height // 3),
        (left + 8, top + 12)
    ]
    draw.polygon(inner_points, fill=(66, 165, 245, 200))
    
    # Add check mark
    check_thickness = max(1, size // 12)
    check_points = [
        (center_x - size//6, center_y),
        (center_x - size//12, center_y + size//8),
        (center_x + size//5, center_y - size//6)
    ]
    
    # Draw checkmark stroke
    draw.line([check_points[0], check_points[1]], fill=(255, 255, 255, 255), width=check_thickness)
    draw.line([check_points[1], check_points[2]], fill=(255, 255, 255, 255), width=check_thickness)
    
    img.save(filename, 'PNG')
    print(f"Created shield icon: {filename} ({size}x{size})")

# Create proper shield icons
create_shield_icon(16, 'icon16.png')
create_shield_icon(48, 'icon48.png') 
create_shield_icon(128, 'icon128.png')

print("All shield icons created successfully!")