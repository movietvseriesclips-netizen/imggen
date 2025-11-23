# Image Overlay Batch Processor

A WordPress plugin for applying custom overlays—including text, shapes, logos, and graphics—to images in batch. Create, manage, and apply overlays visually, powered by an advanced Photoshop-style editor.

## Plugin Information

- **Version:** 1.7.0
- **Requires WordPress:** 5.0 or higher
- **Tested up to:** 6.x
- **License:** GPL v2 or later

## Features

### Canvas Size Support
- Multiple canvas sizes: **800x450** (standard) and **728x218** (banner)
- Size-specific overlay management and cropping

### Overlay Management
- Upload and organize overlays (PNG/JPG)
- Directory and Media Library sources supported
- Visual overlay previews
- Auto-migration of legacy overlays

### Visual Overlay Editor
- Add and style text with custom fonts
- Upload and position logos/images
- Resize, move, and delete any element
- Layer panel with drag-and-drop reordering, renaming, hiding, locking, and **nested grouping**
- **Multi-selection**: select and batch edit multiple objects
- **Blend modes**: 16 modes including Multiply, Screen, Overlay, etc., per layer or batch
- **Shape tools**: create rectangles, circles, triangles, and lines instantly
- **Gradient fills for shapes**: linear and radial, with angle, color, and opacity controls
- **Advanced opacity controls**: separate sliders for layer opacity, fill opacity, and stroke opacity
- **Eyedropper tool** for color sampling
- **Boolean operations**: Union, Subtract, Intersect, Exclude for combining shapes
- **Keyboard shortcuts**: Group (Ctrl+G), Ungroup (Ctrl+Shift+G), Duplicate (Ctrl+D), Delete, Arrow keys for movement
- **Context menu**: Right-click on layers for quick actions
- **Alignment tools**: Align Left, Center, Right, Top, Middle, Bottom (requires 2+ objects)
- **Distribution tools**: Distribute Horizontally and Vertically for even spacing (requires 3+ objects)
- **Magnetic guides**: Smart snapping to canvas edges and other objects with visual blue guide lines
- **Layer export**: Export selected layer or all layers as separate PNG files

### Font Management
- Upload and manage custom fonts (TTF, OTF, WOFF, WOFF2)
- Instantly use custom fonts for editor text layers

### Batch Image Processing
- Process multiple images from Media Library
- Apply overlays to all selected images quickly
- Progress tracking, pagination for large libraries

### Image Processing Features
- Alpha transparency, PNG/JPEG, cropping/resizing, unique filenames

### User Interface Highlights
- Photoshop-style toolbar and panel design
- Multi-select toolbar and batch controls
- Right-click context menus for quick actions
- Production-ready UI with color-coded sections, hover tooltips, and smooth animations
- Responsive on all devices

---

## NEW IN v1.7.0 (Phase 6)

### Layer Export
- **Export Selected Layer**: Export any selected layer as a PNG with transparent background
- **Export All Layers**: Batch export all layers as separate PNG files with auto-generated filenames
- Works with all object types (text, images, shapes, groups)
- Maintains transparency and layer properties in exports

### Alignment & Distribution Tools
- **Six Alignment Options**: Left, Center, Right, Top, Middle, Bottom
  - Align multiple selected objects to specific edges or centers
  - Requires 2 or more objects selected
  - Accessible via multi-select toolbar
- **Distribution Tools**: Horizontal and Vertical
  - Evenly space 3 or more selected objects
  - Perfect for creating grids and organized layouts
  - Maintains object sizes while adjusting positions

### Magnetic Guides & Snapping
- **Smart Snapping System**: Objects automatically snap to:
  - Canvas edges (left, right, top, bottom, horizontal center, vertical center)
  - Other object edges and centers
  - 10-pixel snap tolerance for smooth alignment
- **Visual Guide Lines**: Bright blue lines appear when objects align
- **Toggle Control**: Enable/disable snapping with checkbox (on by default)
- **Non-Intrusive**: Guide lines appear only during movement and clear automatically

### UI/UX Polish & Production-Ready Features
- **Hover Tooltips**: All buttons display helpful descriptions on hover
- **Color-Coded Sections**:
  - Purple gradient background for alignment tools
  - Green theme for snapping controls
  - Amber/yellow theme for export features
- **Enhanced Visual Feedback**: Smooth transitions, hover effects, and elevation
- **Professional Design**: Matches industry standards (Adobe Photoshop, Figma)
- **Accessibility**: Keyboard-friendly, proper labels, responsive design

---

## NEW IN v1.6.0 (Phase 5)

### Nested Group Support
- **Groups within groups**: Create unlimited nested group hierarchies
- **Visual indentation**: Layer panel shows group depth with indentation
- **Nest Group button**: Create child groups directly from group headers
- **Recursive cascading**: Visibility and lock states cascade through all nested levels

### Keyboard Shortcuts
- **Ctrl/Cmd + G**: Group selected layers into a new group
- **Ctrl/Cmd + Shift + G**: Ungroup selected layer from its parent group
- **Ctrl/Cmd + D**: Duplicate selected layer (with all properties)
- **Delete/Backspace**: Delete selected layer
- **Arrow Keys**: Move layer 1px (or 10px with Shift held)
- **Escape**: Deselect all or close eyedropper mode
- Shortcuts automatically skip when typing in input fields

### Right-Click Context Menu
- **Quick actions** on any layer via right-click:
  - 📋 Duplicate layer
  - 🗑️ Delete layer
  - 🔒/🔓 Toggle lock/unlock
  - 👁️ Toggle hide/show
  - ➡ Add to group (with dropdown list)
  - ⬅ Remove from group
  - 📁 Group selected (when multiple layers selected)
  - ↑↓ Bring forward / Send backward
  - ⬆⬇ Bring to front / Send to back
- Context menu auto-closes on action or outside click

### Boolean Operations for Shapes
- **Union** (⊕): Combine shapes into one
- **Subtract** (⊖): Remove one shape from another
- **Intersect** (⊗): Keep only overlapping area
- **Exclude** (⊘): Remove overlapping area (XOR)
- Works with rectangles, circles, triangles, ellipses, polygons, and paths
- Creates new path objects with full layer functionality
- Buttons appear in multi-select toolbar when 2+ compatible shapes selected
- Optional removal of original shapes after operation

### Enhanced Features
- **Duplicate layer**: Exact copy with all properties preserved (offset +20px)
- **Group selected**: Create group from multiple selected layers (Ctrl+G or context menu)
- **Recursive group operations**: All nested levels respect parent visibility/lock state

---

## Installation & Usage

1. Upload or clone the plugin to `/wp-content/plugins/`
2. Activate via the WordPress admin
3. Use **Image Overlay** menu:
   - **Editor**: create, edit, and manage overlays visually
   - **Batch**: select images and apply overlays in bulk

### Quick Start Guide

#### Creating an Overlay
1. Navigate to **Image Overlay → Editor**
2. Select canvas size (800x450 or 728x218)
3. Add elements:
   - **Text**: Type content, choose font, size, color
   - **Shapes**: Click shape buttons (rectangle, circle, triangle, line)
   - **Images**: Upload logos or graphics
4. Use **Layer Panel** to organize, group, and reorder elements
5. Apply **blend modes** and **gradients** for advanced effects
6. Use **keyboard shortcuts** for faster workflow
7. **Right-click** on layers for quick actions
8. **Save** to WordPress Media Library

#### Applying Overlays
1. Navigate to **Image Overlay → Image Overlay**
2. Select canvas size matching your overlay
3. Choose overlay from directory or Media Library
4. Select images from Media Library
5. Click **Apply Overlay** to batch process

See the full [Development Roadmap](DEVELOPMENT-ROADMAP.md) for feature phases and release notes.

---

## Changelog

### Version 1.7.0 - November 22, 2025
- **Phase 6 completed: Layer Export, Alignment Tools, Distribution, Magnetic Guides, UI Polish**
- Layer export feature: export selected layer or all layers as separate PNG files
- Alignment tools: Left, Center, Right, Top, Middle, Bottom (requires 2+ objects)
- Distribution tools: Horizontal and Vertical spacing (requires 3+ objects)
- Magnetic guides and snapping system with visual blue guide lines
- Snap to canvas edges and other object edges/centers
- Toggle snapping on/off with checkbox (enabled by default)
- Production-ready UI polish with color-coded sections
- Hover tooltips on all buttons with helpful descriptions
- Enhanced visual feedback: smooth transitions, hover effects, elevation
- Professional-grade UX matching industry standards
- Version bump to 1.7.0 for JavaScript cache refresh
- Full backward compatibility with all previous versions

### Version 1.6.0 - November 22, 2025
- **Phase 5 completed: Nested groups, Boolean operations, Keyboard shortcuts, Context menu**
- Nested group support with unlimited depth and visual indentation
- Keyboard shortcuts: Ctrl+G (group), Ctrl+Shift+G (ungroup), Ctrl+D (duplicate), Delete, Arrow keys (move)
- Right-click context menu on all layers with quick actions
- Boolean operations for shapes: Union, Subtract, Intersect, Exclude
- Duplicate layer feature with property preservation
- Group selected layers feature (minimum 2 layers)
- Enhanced group data structure with recursive operations
- All shortcuts skip when typing in input fields
- Context menu auto-closes on action or outside click
- Full backward compatibility with all previous versions

### Version 1.5.0 - November 22, 2025
- **Phase 4 completed: Advanced blend modes, gradients, multi-selection**
- Added 16 blend modes (Normal, Multiply, Screen, Overlay, etc.) for all layer types
- Gradient fill support for shapes (linear/radial, two stops, angle/opacity controls)
- Multi-selection with batch property edits and toolbar
- Fill and stroke opacity controls for shape layers
- UI and documentation improvements

### Version 1.4.0 - November 22, 2025
- **Phase 3 completed: Shape tools, eyedropper, advanced properties**
- Shape tools (rect, circle, triangle, line) with instant creation
- Eyedropper tool (💧) for color sampling from canvas
- Shape properties panel (fill, stroke, width, no-fill, no-stroke)
- Layer panel integration for all shapes
- Bug fixes and performance improvements

### Version 1.3.0 - November 22, 2025
- **Phase 2 completed: Opacity, lock, groups**
- Per-layer opacity sliders (0-100%)
- Layer lock/unlock toggle
- Group creation and management
- Visual indicators for locked and hidden layers

### Version 1.2.0 - November 21, 2025
- **Phase 1 completed: Layer panel, Media Library integration**
- Layer panel with drag-and-drop reordering
- Rename, hide, delete, move layers
- Save overlays to WordPress Media Library
- Load overlays from Media Library for batch processing

---

## Support

For support or feature requests, open an [issue](https://github.com/catsontv/wp-image-overlay-processor/issues) or [pull request](https://github.com/catsontv/wp-image-overlay-processor/pulls).

## Contributing

Contributions are welcome! Please see the [Development Roadmap](DEVELOPMENT-ROADMAP.md) for planned features and implementation details.

## License

GPL v2 or later