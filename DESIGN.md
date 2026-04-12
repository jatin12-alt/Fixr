# Fixr Design System & Premium UI Strategy

## 🎨 Visual Identity: "The Neural Network of DevOps"
Fixr isn't just a tool; it's an intelligent layer over your infrastructure. The design should feel **living, responsive, and ultra-precise**.

### Color Palette
- **Obsidian Core**: `#030305` (Deepest background)
- **Neural Grey**: `#0A0A0F` (Surface color)
- **Cyan Signal**: `#00D4FF` (Primary Action / Success)
- **Void Purple**: `#8B5CF6` (Intelligence / AI)
- **Glitch Red**: `#FF4D4D` (Error / Alert)
- **Subtle Stroke**: `rgba(255, 255, 255, 0.05)`

### Typography
- **Heading (Display)**: `Inter` or `Outfit` (Black weight with tight letter spacing `-0.04em`)
- **Body**: `Inter` (Regular/Medium weights)
- **Technical**: `JetBrains Mono` (For pipeline logs, status indicators, and numbers)

### UI Foundations
- **Bento Grid**: Features should be organized in a sophisticated Bento layout with asymmetric sizing.
- **Glassmorphism 2.0**: High `backdrop-filter: blur(20px)`, very low opacity borders (`0.08`), and inner glows.
- **Micro-interactions**: Every button should have a "magnetic" hover effect and a subtle glow.
- **3D Depth**: Leverage the existing Three.js capability for interactive background particles or floating "Pipeline Nodes".

## 🛣️ Navigation & Layout
- **Navbar**: Floating glassmorphic header with "Active Signal" indicator (pulsing dot when pipelines are clean).
- **Sidebar (Dashboard)**: Minimalist, collapsible, using translucent layers.

## ✨ Motion Signature
- **Staggered Entrance**: Components slide in from the bottom with a strong spring (`stiffness: 100, damping: 20`).
- **Live Feed**: Terminal lines and status updates should use a "typewriter" or "fade-in-trace" effect.
- **Hover Transitions**: `all 0.4s cubic-bezier(0.4, 0, 0.2, 1)`.

## 🖼️ Screen Redesign Plan
1. **Hero**: Replace current static text with a "Command Center" visual — a large 3D logo surrounded by floating status chips.
2. **Dashboard**: Fully modular bento-style dashboard showing "Health score" with a large circular gauge.
3. **Analytics**: High-fidelity glowing line charts using Recharts with custom tooltips.
