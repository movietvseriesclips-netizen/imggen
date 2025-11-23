# Development Roadmap: Advanced Overlay Edit Features

This roadmap details the implementation of Photoshop-style layer and shape management for the Editor (formerly Overlay Edit). Each phase delivers working, testable features. Testing steps are specified for each phase.

---

## Phase 1: Layer Panel & Basic Operations ✅ COMPLETED

### Goals
- Add a vertical layer panel in the editor.
- List all objects (text, images, shapes) in order.
- Layer selection, renaming, delete, hide (visibility toggle), and move up/down controls.
- Drag-and-drop reordering.
- Highlight the currently selected layer.
- **Enhanced:** Renamed "Overlay Edit" to "Editor"
- **Enhanced:** Save overlays directly to WordPress Media Library
- **Enhanced:** Load overlays from Media Library on Image Overlay page

### Testing Steps
- Add multiple text and image objects — verify each appears as a layer.
- Rename layers and confirm names change instantly.
- Hide/show any layer and ensure it disappears/appears on the canvas.
- Select a layer in the list — confirm the corresponding canvas object is selected.
- Move layers up/down and use drag-and-drop — verify the stacking order changes.
- Delete layers and ensure they are removed from both the panel and the canvas.
- **New:** Save an overlay and verify it appears in WordPress Media Library.
- **New:** Load overlay from Media Library on Image Overlay page and apply to images.

### Implementation Notes
- Overlays saved from Editor are stored in WordPress Media Library with metadata tags
- Image Overlay page now supports both directory uploads and Media Library selection
- Media Library overlays are filtered by canvas size dimensions
- Backward compatibility maintained with existing directory-based overlays

---

## Phase 2: Opacity, Lock, and Group Layers ✅ COMPLETED

### Goals
- Add per-layer opacity slider.
- Add lock/unlock toggle to prevent editing or moving a layer.
- Basic layer grouping: create group, add/remove layers, collapse/expand groups, group-level show/hide and lock.

### Testing Steps
- Adjust opacity for any layer and confirm change visually.
- Lock a layer; attempt to edit it from both the canvas and the panel — confirm it is immutable.
- Create, collapse, expand, and rename groups; drag layers in and out of groups.
- Hide/show and lock/unlock entire groups — verify all children inherit state.

### Implementation Notes
- **Opacity Control**: Each layer now has an opacity slider (0-100%) that adjusts transparency in real-time
- **Lock/Unlock**: Locked layers cannot be selected, moved, scaled, or rotated on canvas; indicated with 🔒 icon
- **Group Management**:
  - Create groups with "+ Create Group" button
  - Add layers to groups via "➡ Add to Group" button
  - Remove layers from groups with "⬅ Ungroup" button
  - Collapse/expand groups with ▶/▼ buttons
  - Groups can be renamed, hidden/shown, and locked/unlocked
  - Group visibility and lock state cascade to all child layers
  - Groups have distinct visual styling with folder icon 📁
- **Visual Indicators**:
  - Locked layers have orange background highlight
  - Hidden layers show at 50% opacity
  - Locked icon: 🔒 (locked) / 🔓 (unlocked)
  - Visibility icon: 👁️ (visible) / 👁️‍🗨️ (hidden)
- **Drag-and-Drop**: Layer reordering continues to work within and outside of groups

---

## Phase 3: Shape Tools ✅ COMPLETED

### Goals
- Add toolbar buttons to create rectangles, ellipses/circles, lines, and triangles.
- Support resizing, moving, and deleting shapes just like other objects.
- Add shape color picker and border (stroke) options.

### Testing Steps
- Add each shape type and verify it can be resized, moved, and deleted.
- Change fill and stroke color for shapes; confirm it updates.
- Verify shapes are added as layers in the panel.

### Implementation Notes
- **Shape Creation**: One-click instant creation of rectangles, circles, triangles, and lines
  - Shapes appear centered on canvas at predefined sizes
  - Rectangle: 150x100px, Circle: 60px radius, Triangle: 120x100px, Line: 150px horizontal
  - Each shape is immediately selectable and ready for manipulation
- **Shape Properties**:
  - **Fill Color**: Color picker with visual input, defaults to #3498db (blue)
  - **Stroke Color**: Border color picker, defaults to #2c3e50 (dark gray)
  - **Stroke Width**: Adjustable from 0-20px, defaults to 2px
  - **"No Fill" Checkbox**: Creates transparent fill (hollow shapes with stroke only)
  - **"No Stroke" Checkbox**: Sets stroke width to 0 (solid shapes with no border)
  - Checkboxes disable corresponding color pickers when active (50% opacity)
  - "Apply to Selected" button updates properties of existing selected shapes
- **Eyedropper Tool** (💧):
  - Click to activate color sampling mode
  - Canvas cursor changes to crosshair for precision
  - Click any point on canvas to sample exact color at that location
  - Sampled color automatically fills the Fill color input field
  - Press Escape key to deactivate and return to normal editing
  - Active state indicated by button highlight and special canvas class
- **Layer Integration**:
  - All shapes automatically added to layer panel with descriptive names
  - Auto-incrementing numbers: "Rectangle 1", "Circle 2", "Triangle 3", "Line 4"
  - Full support for Phase 2 features (opacity, lock, visibility, grouping)
  - Shapes can be renamed, reordered via drag-and-drop, and deleted
  - Layer panel treats shapes identically to text and image objects
- **Bug Fixes**:
  - Fixed timing issue where shape button handlers bound before canvas initialization
  - Added `bindShapeToolHandlers()` function called after canvas ready
  - Comprehensive console logging throughout shape creation workflow
  - Version bump to 1.4.0 to force JavaScript cache refresh on client browsers
- **User Experience**:
  - Real-time visual feedback for all property changes
  - Shape tools work seamlessly on tablet and mobile devices
  - No drawing mode — instant creation keeps workflow fast and simple
  - Full backward compatibility with Phases 1 and 2 maintained

---

## Phase 4: Advanced Properties and Blend Modes ✅ COMPLETED

### Goals
- Add per-layer blend mode selection (Normal, Multiply, Screen, Overlay, etc.).
- Support shape gradients (linear, radial) and opacity for fill and stroke.
- Implement multi-selection and batch property edits for layers.

### Testing Steps
- Change blend modes for each object and visually verify compositing changes.
- Apply gradients and different transparency/opacity settings — confirm visually correct.
- Select multiple layers and batch edit their properties (color, opacity, etc.).

### Implementation Notes
- **Blend Modes**: Complete blend mode support using Canvas `globalCompositeOperation`
  - 16 blend modes available: Normal (source-over), Multiply, Screen, Overlay, Darken, Lighten, Color Dodge, Color Burn, Hard Light, Soft Light, Difference, Exclusion, Hue, Saturation, Color, Luminosity
  - Per-object blend mode dropdown in toolbar
  - Blend mode applies to all object types (text, images, shapes)
  - Batch blend mode editor for multiple selected objects
  - Blend modes persist in layer state and survive canvas re-renders
- **Gradient Support**: Advanced gradient fills for shapes
  - **Gradient Types**: Solid Color (none), Linear Gradient, Radial Gradient
  - **Color Stops**: Two-color gradients with independent opacity controls per stop
  - **Linear Gradients**: Adjustable angle (0-360°) with visual angle display
  - **Radial Gradients**: Center-to-edge gradient spread
  - Gradient UI section with visual color pickers
  - "Apply Gradient to Selected" button for instant preview
  - Gradients work on rectangles, circles, triangles, and ellipses
  - Gradients are true Fabric.js Gradient objects, not simulated
- **Fill & Stroke Opacity**: Independent opacity controls
  - Fill opacity slider (0-100%) separate from layer opacity
  - Stroke opacity slider (0-100%) for shape borders
  - Real-time visual feedback as sliders are adjusted
  - Opacity values display as percentages next to sliders
- **Multi-Selection**: Photoshop-style multi-select functionality
  - Select multiple objects with Ctrl/Cmd + Click
  - Multi-select toolbar appears when 2+ objects selected
  - Shows count of selected objects
  - Batch operations available:
    - Blend mode dropdown (applies to all selected)
    - Opacity slider (applies to all selected)
    - Lock All / Unlock All buttons
    - Delete All button (with confirmation)
  - Multi-select toolbar styled with blue theme to indicate active state
  - Visual feedback shows selected object count
- **User Interface**:
  - Advanced Properties section for blend modes
  - Gradient section with collapsible controls
  - Multi-select toolbar appears/hides automatically
  - All controls follow consistent design language
  - Responsive design adjustments for mobile/tablet
- **Technical Implementation**:
  - Fabric.js Gradient API for true gradient support
  - globalCompositeOperation for blend mode rendering
  - Enhanced selection event handlers for multi-select detection
  - Batch operation functions iterate over selectedObjects array
  - Version bump to 1.5.0 for cache refresh
- **Backward Compatibility**:
  - All Phase 1, 2, and 3 features continue to work
  - Existing layers load without blend modes (default to Normal)
  - Gradients are optional — solid colors still work as before
  - No breaking changes to layer panel or group functionality

---

## Phase 5: Layer Groups & Boolean Operations ✅ COMPLETED

### Goals
- Implement nested group support.
- Add boolean operations (union, subtract, intersect, exclude) for selected shapes.
- Support grouping/ungrouping via shortcut and context menu.

### Testing Steps
- Create deep nested groups, then expand and collapse them.
- Use boolean operations on 2+ selected shapes and verify new shape layer is correct.
- Group and ungroup objects using menu and keyboard shortcuts.

### Implementation Notes
- **Nested Group Support**:
  - Groups can now contain other groups (unlimited nesting depth)
  - Visual indentation in layer panel shows group hierarchy
  - "+ Nest Group" button on group headers creates child groups
  - Collapse/expand controls work recursively through nested structure
  - Visibility and lock states cascade through all nested levels
  - Parent group visibility/lock overrides child group settings
- **Keyboard Shortcuts**:
  - **Ctrl/Cmd + G**: Group selected layers into a new group
  - **Ctrl/Cmd + Shift + G**: Ungroup selected layer from its parent group
  - **Delete/Backspace**: Delete selected layer
  - **Ctrl/Cmd + D**: Duplicate selected layer
  - **Arrow Keys**: Move selected layer (1px, or 10px with Shift)
  - **Escape**: Deselect all or close eyedropper mode
  - Keyboard shortcuts skip when typing in input fields
- **Context Menu** (Right-Click):
  - Duplicate layer
  - Delete layer
  - Toggle lock/unlock
  - Toggle hide/show
  - Add to group (submenu with group list)
  - Remove from group
  - Group selected (when multiple selected)
  - Bring forward / Send backward
  - Bring to front / Send to back
  - Context menu appears at mouse position
  - Automatically closes on outside click or action
- **Boolean Operations**:
  - Four boolean operations available: Union, Subtract, Intersect, Exclude
  - Buttons appear in multi-select toolbar when 2+ shapes selected
  - Operations work on: rectangles, circles, triangles, ellipses, polygons, paths
  - Results are new path objects with full layer functionality
  - Optional removal of original shapes after operation
  - Simplified path-based implementation for WordPress compatibility
  - Boolean operation buttons disabled for non-shape selections
- **Duplicate Layer**:
  - Creates exact copy of layer with all properties
  - Duplicates placed offset (+20px right, +20px down)
  - Name appended with " Copy"
  - Preserves: opacity, blend mode, gradients, lock state, fill/stroke
  - Works with all object types (text, images, shapes)
- **Group Selected Layers**:
  - Accessible via Ctrl/Cmd + G or context menu
  - Creates new group containing all currently selected layers
  - Minimum 2 layers required
  - Auto-numbered group name ("Group 1", "Group 2", etc.)
  - Grouped layers inherit initial group visibility/lock state
- **User Experience**:
  - Right-click anywhere on layer panel for quick actions
  - Keyboard shortcuts provide professional workflow efficiency
  - Context menu provides visual alternative to keyboard shortcuts
  - All shortcuts and operations logged to console for debugging
  - Smooth transitions and visual feedback throughout
- **Technical Implementation**:
  - Enhanced group data structure supports `groups[]` array for children
  - Recursive functions handle nested group operations
  - Path-based boolean operations using Fabric.js geometry
  - Event handlers properly filter input field keystrokes
  - Version bump to 1.6.0 for JavaScript cache refresh
- **Backward Compatibility**:
  - All Phase 1-4 features continue to work
  - Existing flat groups load normally
  - No breaking changes to layer panel or canvas functionality
  - Boolean operations are purely additive (optional feature)

---

## Phase 6: UX Enhancements & Export ✅ COMPLETED

### Goals
- ~~Add keyboard shortcuts for common operations (delete, duplicate, move, group, etc.).~~ (Completed in Phase 5)
- ~~Add context menus for layers (right-click for quick actions).~~ (Completed in Phase 5)
- Support exporting individual layers or groups as separate images.
- Add alignment tools and magnetic guides.
- Polish UI for production.

### Testing Steps
- ~~Use keyboard shortcuts for all mapped features — confirm they function correctly.~~ (Completed in Phase 5)
- ~~Right-click on layers and execute context menu actions.~~ (Completed in Phase 5)
- Export selected layers/groups — confirm exports are correct and individually named.
- Test alignment and snapping guides visually when moving objects.
- Use alignment tools to align multiple selected objects.
- Use distribution tools to space objects evenly.

### Implementation Notes
- **Layer Export Feature**:
  - Export selected layer as PNG with "📥 Export Layer" button
  - Export all layers individually with "📦 Export All" button
  - Each layer exported as separate PNG file with layer name as filename
  - Transparent background maintained in exports
  - Multiple exports staggered to prevent browser blocking
  - Temporary canvas created for each export to preserve quality
  - Works with all object types (text, images, shapes, groups)
- **Alignment Tools**:
  - Six alignment options: Left, Center, Right, Top, Middle, Bottom
  - Align Left (⬅): Aligns all selected objects to leftmost edge
  - Align Center (↔): Centers all selected objects horizontally on canvas
  - Align Right (➡): Aligns all selected objects to rightmost edge
  - Align Top (⬆): Aligns all selected objects to topmost edge
  - Align Middle (↕): Centers all selected objects vertically on canvas
  - Align Bottom (⬇): Aligns all selected objects to bottommost edge
  - Requires 2+ objects selected to activate
  - Buttons appear in multi-select toolbar
  - Visual gradient background for alignment section
- **Distribution Tools**:
  - Distribute Horizontally (⬌): Evenly spaces objects left-to-right
  - Distribute Vertically (⬍): Evenly spaces objects top-to-bottom
  - Requires 3+ objects selected to activate
  - Calculates spacing based on first and last object positions
  - Maintains object sizes while adjusting positions
  - Perfect for creating even grids and layouts
- **Magnetic Guides & Snapping**:
  - Smart snapping to canvas edges (left, right, top, bottom, center)
  - Snap to other objects (edges and centers)
  - Visual guide lines appear in bright blue when objects align
  - 10-pixel snap tolerance for smooth user experience
  - Toggle on/off with "Enable Snapping" checkbox
  - Enabled by default for better precision
  - Guide lines automatically clear after object movement
  - Horizontal and vertical guide lines displayed separately
- **UI Polish & Production-Ready Features**:
  - **Tooltips**: All buttons now have hover tooltips with descriptions
  - **Visual Feedback**: Color-coded sections for different feature groups
    - Purple gradient for alignment tools
    - Green theme for snapping controls
    - Yellow/amber theme for export controls
  - **Button Hover Effects**: Smooth transitions and elevation on hover
  - **Loading States**: Animation system ready for async operations
  - **Success/Error Feedback**: Styled notification system for user feedback
  - **Responsive Tooltips**: Dark tooltips appear on button hover with arrows
  - **Icon Usage**: Emoji icons for better visual recognition (📥 📦 ⬅ ➡ ⬆ ⬇)
  - **Consistent Design Language**: All Phase 6 features follow established design patterns
  - **Accessibility**: Keyboard-friendly, proper labels, and ARIA-ready
- **Technical Implementation**:
  - Snapping uses Fabric.js bounding rectangles for accurate collision detection
  - Guide lines drawn on canvas contextTop layer (non-persistent overlay)
  - Alignment functions calculate bounding boxes for all selected objects
  - Distribution algorithm sorts objects and calculates even spacing
  - Export uses temporary Fabric.js canvas for clean, isolated rendering
  - Version bump to 1.7.0 for JavaScript cache refresh
- **User Experience**:
  - Professional-grade alignment tools matching industry standards (Adobe, Figma)
  - Magnetic guides provide tactile feedback without being intrusive
  - Export workflow is simple and intuitive
  - All features accessible via clear, labeled buttons
  - Multi-select toolbar now comprehensive control center
  - Smooth animations and transitions throughout
- **Backward Compatibility**:
  - All Phase 1-5 features continue to work perfectly
  - Snapping can be disabled for users who prefer manual positioning
  - Export is non-destructive (original layers unchanged)
  - No breaking changes to any existing functionality

---

**After each phase, perform manual tests according to the above steps and verify no regressions in previously delivered features. QA and user feedback are encouraged at all major steps.**

---

## Version History

### Phase 1 - November 21, 2025
- ✅ Layer panel with full functionality
- ✅ Renamed "Overlay Edit" to "Editor" throughout the plugin
- ✅ Save functionality now saves directly to WordPress Media Library
- ✅ Image Overlay page can load overlays from both directory and Media Library
- ✅ Overlays tagged with metadata for easy filtering
- ✅ Backward compatibility maintained with existing directory-based overlays
- ✅ Responsive design for mobile and tablet

### Phase 2 - November 22, 2025
- ✅ Per-layer opacity slider with real-time visual feedback (0-100%)
- ✅ Lock/unlock toggle for layers to prevent editing
- ✅ Visual indicators for locked (orange highlight) and hidden (50% opacity) layers
- ✅ Canvas-level lock enforcement prevents locked objects from being modified
- ✅ Group creation and management system
- ✅ Add/remove layers to/from groups
- ✅ Collapse/expand groups for better organization
- ✅ Group-level visibility and lock controls that cascade to children
- ✅ Group renaming functionality
- ✅ Visual distinction for groups with folder icons and nested styling
- ✅ "Add to Group" dropdown menu for ungrouped layers
- ✅ Full backward compatibility with Phase 1 features

### Phase 3 - November 22, 2025
- ✅ Shape tools: Rectangle, Circle, Triangle, Line with one-click creation
- ✅ Shapes appear instantly centered on canvas at predefined sizes
- ✅ Shape properties panel: fill color, stroke color, stroke width (0-20px)
- ✅ "No Fill" checkbox for hollow shapes (transparent fill, stroke only)
- ✅ "No Stroke" checkbox for solid shapes (no border, fill only)
- ✅ Eyedropper tool (💧) for sampling colors directly from canvas
- ✅ "Apply to Selected" button for updating existing shape properties
- ✅ Full layer panel integration with auto-named layers
- ✅ All Phase 2 features work with shapes (opacity, lock, visibility, grouping)
- ✅ Comprehensive console logging for debugging
- ✅ Bug fix: Shape handler binding timing issue resolved
- ✅ Version bump to 1.4.0 for JavaScript cache refresh
- ✅ Full backward compatibility with Phases 1 and 2

### Phase 4 - November 22, 2025
- ✅ Blend mode support: 16 modes (Normal, Multiply, Screen, Overlay, Darken, Lighten, Color Dodge, Color Burn, Hard Light, Soft Light, Difference, Exclusion, Hue, Saturation, Color, Luminosity)
- ✅ Per-layer blend mode dropdown in toolbar
- ✅ Gradient support for shapes: Linear and Radial gradients
- ✅ Two-color gradient stops with independent opacity controls (0-100%)
- ✅ Linear gradient angle control (0-360°) with visual display
- ✅ Radial gradient center-to-edge spread
- ✅ Fill opacity and stroke opacity independent controls
- ✅ Multi-selection support with Ctrl/Cmd + Click
- ✅ Multi-select toolbar with batch operations:
  - Batch blend mode editor
  - Batch opacity slider
  - Lock All / Unlock All buttons
  - Delete All button with confirmation
- ✅ Real-time visual feedback for all gradient and opacity changes
- ✅ "Apply Gradient to Selected" button for instant preview
- ✅ Gradient UI section with collapsible controls
- ✅ Advanced Properties section for blend modes
- ✅ Version bump to 1.5.0 for JavaScript cache refresh
- ✅ Full backward compatibility with Phases 1, 2, and 3
- ✅ Responsive design maintained for mobile and tablet

### Phase 5 - November 22, 2025
- ✅ Nested group support: groups can contain other groups (unlimited depth)
- ✅ "+ Nest Group" button on group headers for creating child groups
- ✅ Visual indentation showing group hierarchy in layer panel
- ✅ Recursive visibility and lock cascading through all nested levels
- ✅ Keyboard shortcuts:
  - Ctrl/Cmd + G: Group selected layers
  - Ctrl/Cmd + Shift + G: Ungroup selected layer
  - Delete/Backspace: Delete layer
  - Ctrl/Cmd + D: Duplicate layer
  - Arrow keys: Move layer (1px or 10px with Shift)
  - Escape: Deselect or close eyedropper
- ✅ Right-click context menu on layers:
  - Duplicate, Delete, Lock/Unlock, Hide/Show
  - Add to group, Remove from group, Group selected
  - Bring forward/backward, Bring to front/back
- ✅ Boolean operations for shapes (Union, Subtract, Intersect, Exclude)
- ✅ Boolean operation buttons in multi-select toolbar
- ✅ Boolean operations work on rectangles, circles, triangles, ellipses, polygons, paths
- ✅ Results are new path objects with full layer functionality
- ✅ Duplicate layer feature with property preservation
- ✅ Group selected layers feature (minimum 2 layers)
- ✅ Enhanced group data structure with `groups[]` array
- ✅ Recursive functions for nested group operations
- ✅ Version bump to 1.6.0 for JavaScript cache refresh
- ✅ Full backward compatibility with Phases 1, 2, 3, and 4
- ✅ All keyboard shortcuts skip when typing in input fields
- ✅ Context menu auto-closes on outside click or action

### Phase 6 - November 22, 2025
- ✅ Layer export feature: export selected layer as PNG with transparent background
- ✅ Export all layers: batch export all layers as separate PNG files
- ✅ Alignment tools: Left, Center, Right, Top, Middle, Bottom (requires 2+ objects)
- ✅ Distribution tools: Horizontal and Vertical distribution (requires 3+ objects)
- ✅ Magnetic guides and snapping system with visual feedback
- ✅ Snap to canvas edges (left, right, top, bottom, center)
- ✅ Snap to other objects (edges and centers)
- ✅ Blue guide lines appear when objects align
- ✅ Toggle snapping on/off with checkbox (enabled by default)
- ✅ Production-ready UI polish:
  - Hover tooltips on all buttons
  - Color-coded feature sections (purple gradient for alignment, green for snapping, amber for export)
  - Smooth hover effects with elevation
  - Loading state animation system
  - Success/error feedback styling
- ✅ Alignment tools in multi-select toolbar with gradient background
- ✅ Export buttons with intuitive icons (📥 📦)
- ✅ Enhanced visual feedback throughout the interface
- ✅ Professional-grade UX matching industry standards (Adobe, Figma)
- ✅ Version bump to 1.7.0 for JavaScript cache refresh
- ✅ Full backward compatibility with all previous phases
- ✅ All features accessible, keyboard-friendly, and responsive

---

For ongoing feedback, please use the GitHub Issues and Pull Requests in this repository.

---

_Last updated: November 22, 2025 (Phase 6 Completed)_