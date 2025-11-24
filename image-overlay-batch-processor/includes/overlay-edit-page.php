<div class="iobp-overlay-editor-wrap">
    <!-- Top Header Bar -->
    <div class="iobp-editor-header">
        <button id="iobp-menu-toggle" class="iobp-menu-toggle" aria-label="Toggle Menu">☰</button>
        <h1 class="iobp-editor-title">ImgGen Editor</h1>
        <div class="iobp-header-actions">
            <button id="iobp-undo-btn" class="iobp-btn iobp-icon-btn disabled" title="Undo (Ctrl+Z)" disabled>↶</button>
            <button id="iobp-redo-btn" class="iobp-btn iobp-icon-btn disabled" title="Redo (Ctrl+Y)" disabled>↷</button>
            <input type="text" id="iobp-overlay-filename" placeholder="my-overlay.png" class="iobp-filename-input" />
            <button id="iobp-save-overlay" class="iobp-btn iobp-btn-primary">💾 SAVE</button>
        </div>
    </div>

    <!-- Multi-Selection Toolbar (hidden by default) -->
    <div id="iobp-multi-select-toolbar" class="iobp-multi-select-toolbar">
        <div class="iobp-multi-select-header">
            <span id="iobp-multi-select-count">0 objects selected</span>
        </div>
        <div class="iobp-multi-select-controls">
            <div class="iobp-control-item">
                <label>Blend Mode</label>
                <select id="iobp-batch-blend-mode"></select>
            </div>
            <div class="iobp-control-item">
                <label>Opacity</label>
                <input type="range" id="iobp-batch-opacity" min="0" max="100" value="100" />
                <span id="iobp-batch-opacity-value">100%</span>
            </div>
            <div class="iobp-control-actions">
                <button id="iobp-batch-lock" class="iobp-btn iobp-btn-sm">Lock All</button>
                <button id="iobp-batch-unlock" class="iobp-btn iobp-btn-sm">Unlock All</button>
                <button id="iobp-batch-delete" class="iobp-btn iobp-btn-sm iobp-btn-danger">Delete All</button>
            </div>
        </div>

        <!-- Phase 6: Alignment Tools -->
        <div class="iobp-alignment-tools">
            <label>Align:</label>
            <button id="iobp-align-left" class="button iobp-align-btn" title="Align Left">⬅</button>
            <button id="iobp-align-center" class="button iobp-align-btn" title="Align Center">↔</button>
            <button id="iobp-align-right" class="button iobp-align-btn" title="Align Right">➡</button>
            <button id="iobp-align-top" class="button iobp-align-btn" title="Align Top">⬆</button>
            <button id="iobp-align-middle" class="button iobp-align-btn" title="Align Middle">↕</button>
            <button id="iobp-align-bottom" class="button iobp-align-btn" title="Align Bottom">⬇</button>

            <label style="margin-left: 15px;">Distribute:</label>
            <button id="iobp-distribute-horizontal" class="button iobp-align-btn" title="Distribute Horizontally">⬌</button>
            <button id="iobp-distribute-vertical" class="button iobp-align-btn" title="Distribute Vertically">⬍</button>
        </div>
    </div>

    <!-- Main Editor Layout -->
    <div class="iobp-editor-container">
        <!-- Left Sidebar -->
        <aside class="iobp-sidebar" id="iobp-sidebar">
            <div class="iobp-sidebar-content">

                <!-- Canvas Section -->
                <div class="iobp-sidebar-section">
                    <button class="iobp-section-header" data-section="canvas">
                        <span class="iobp-section-title">Canvas</span>
                        <span class="iobp-section-arrow">▼</span>
                    </button>
                    <div class="iobp-section-content" id="section-canvas">
                        <div class="iobp-form-group">
                            <label>Preset Sizes</label>
                            <select id="iobp-editor-canvas-size" class="iobp-input">
                                <option value="800x450" selected>800x450</option>
                                <option value="728x218">728x218</option>
                            </select>
                        </div>
                        <!-- Phase 7: Custom presets will appear here -->
                        <div id="iobp-custom-presets-container"></div>

                        <div class="iobp-form-group">
                            <button id="iobp-start-blank" class="iobp-btn iobp-btn-block">Blank Canvas</button>
                            <button id="iobp-load-from-library" class="iobp-btn iobp-btn-block">Load from Library</button>
                        </div>
                        <!-- Phase 7: Custom Canvas Size Buttons -->
                        <div class="iobp-form-group">
                            <button id="iobp-custom-size-btn" class="iobp-btn iobp-btn-block">Custom Size...</button>
                            <button id="iobp-clipboard-canvas-btn" class="iobp-btn iobp-btn-block">New from Clipboard</button>
                        </div>
                    </div>
                </div>

                <!-- Phase 8: Tool Palette Section -->
                <div class="iobp-sidebar-section">
                    <button class="iobp-section-header" data-section="tools">
                        <span class="iobp-section-title">Tool Palette</span>
                        <span class="iobp-section-arrow">▼</span>
                    </button>
                    <div class="iobp-section-content" id="section-tools">
                        <div class="iobp-form-group">
                            <label>Active Tool</label>
                            <div class="iobp-tool-palette">
                                <button class="iobp-tool-btn active" data-tool="select" title="Select Tool (V)">
                                    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>
                                    </svg>
                                </button>
                                <button class="iobp-tool-btn" data-tool="brush" title="Brush Tool (B)">
                                    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34c-.39-.39-1.02-.39-1.41 0L9 12.25 11.75 15l8.96-8.96c.39-.39.39-1.02 0-1.41z"/>
                                    </svg>
                                </button>
                                <button class="iobp-tool-btn" data-tool="eraser" title="Eraser Tool (E)">
                                    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M16.24 3.56l4.95 4.94c.78.79.78 2.05 0 2.84L12 20.53a4.008 4.008 0 0 1-5.66 0L2.81 17c-.78-.79-.78-2.05 0-2.84l10.6-10.6c.79-.78 2.05-.78 2.83 0M4.22 15.58l3.54 3.53c.78.79 2.04.79 2.83 0l3.53-3.53-6.36-6.36-3.54 3.53c-.78.79-.78 2.05 0 2.83z"/>
                                    </svg>
                                </button>
                                <button class="iobp-tool-btn" data-tool="bucket" title="Paint Bucket Tool (G)">
                                    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                                    </svg>
                                </button>
                                <button class="iobp-tool-btn" data-tool="wand" title="Magic Wand Tool (W)">
                                    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
                                    </svg>
                                </button>
                                <button class="iobp-tool-btn" data-tool="zoom" title="Zoom Tool (Z)">
                                    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                                        <path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div class="iobp-form-group">
                            <label>Colors</label>
                            <div class="iobp-color-swatches">
                                <div class="iobp-color-swatch-container">
                                    <input type="color" id="iobp-foreground-color" value="#000000" class="iobp-swatch-input" title="Foreground Color" />
                                    <input type="color" id="iobp-background-color" value="#ffffff" class="iobp-swatch-input iobp-swatch-bg" title="Background Color" />
                                </div>
                                <div class="iobp-color-actions">
                                    <button id="iobp-swap-colors" class="iobp-btn-icon" title="Swap Colors (X)">⇄</button>
                                    <button id="iobp-reset-colors" class="iobp-btn-icon" title="Reset to Black/White (D)">◐</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Phase 8: Brush Tool Settings -->
                <div class="iobp-sidebar-section" id="iobp-brush-settings" style="display: none;">
                    <button class="iobp-section-header" data-section="brush-options">
                        <span class="iobp-section-title">Brush Settings</span>
                        <span class="iobp-section-arrow">▼</span>
                    </button>
                    <div class="iobp-section-content" id="section-brush-options">
                        <div class="iobp-form-group">
                            <label>Size (px)</label>
                            <div class="iobp-range-group">
                                <input type="range" id="iobp-brush-size" min="1" max="500" value="20" class="iobp-range" />
                                <span id="iobp-brush-size-value" class="iobp-range-value">20px</span>
                            </div>
                        </div>
                        <div class="iobp-form-group">
                            <label>Hardness (%)</label>
                            <div class="iobp-range-group">
                                <input type="range" id="iobp-brush-hardness" min="0" max="100" value="100" class="iobp-range" />
                                <span id="iobp-brush-hardness-value" class="iobp-range-value">100%</span>
                            </div>
                        </div>
                        <div class="iobp-form-group">
                            <label>Opacity (%)</label>
                            <div class="iobp-range-group">
                                <input type="range" id="iobp-brush-opacity" min="0" max="100" value="100" class="iobp-range" />
                                <span id="iobp-brush-opacity-value" class="iobp-range-value">100%</span>
                            </div>
                        </div>
                        <div class="iobp-form-group">
                            <label>Flow (%)</label>
                            <div class="iobp-range-group">
                                <input type="range" id="iobp-brush-flow" min="0" max="100" value="100" class="iobp-range" />
                                <span id="iobp-brush-flow-value" class="iobp-range-value">100%</span>
                            </div>
                        </div>
                        <div class="iobp-form-group">
                            <label>Blend Mode</label>
                            <select id="iobp-brush-blend-mode" class="iobp-input">
                                <option value="source-over">Normal</option>
                                <option value="multiply">Multiply</option>
                                <option value="screen">Screen</option>
                                <option value="overlay">Overlay</option>
                                <option value="darken">Darken</option>
                                <option value="lighten">Lighten</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Phase 8: Eraser Tool Settings -->
                <div class="iobp-sidebar-section" id="iobp-eraser-settings" style="display: none;">
                    <button class="iobp-section-header" data-section="eraser-options">
                        <span class="iobp-section-title">Eraser Settings</span>
                        <span class="iobp-section-arrow">▼</span>
                    </button>
                    <div class="iobp-section-content" id="section-eraser-options">
                        <div class="iobp-form-group">
                            <label>Mode</label>
                            <select id="iobp-eraser-mode" class="iobp-input">
                                <option value="brush">Brush (Soft)</option>
                                <option value="pencil">Pencil (Hard)</option>
                                <option value="magic">Magic Eraser</option>
                            </select>
                        </div>
                        <div class="iobp-form-group" id="iobp-eraser-size-group">
                            <label>Size (px)</label>
                            <div class="iobp-range-group">
                                <input type="range" id="iobp-eraser-size" min="1" max="500" value="20" class="iobp-range" />
                                <span id="iobp-eraser-size-value" class="iobp-range-value">20px</span>
                            </div>
                        </div>
                        <div class="iobp-form-group" id="iobp-eraser-opacity-group">
                            <label>Opacity (%)</label>
                            <div class="iobp-range-group">
                                <input type="range" id="iobp-eraser-opacity" min="0" max="100" value="100" class="iobp-range" />
                                <span id="iobp-eraser-opacity-value" class="iobp-range-value">100%</span>
                            </div>
                        </div>
                        <div class="iobp-form-group" id="iobp-eraser-tolerance-group" style="display: none;">
                            <label>Tolerance</label>
                            <div class="iobp-range-group">
                                <input type="range" id="iobp-eraser-tolerance" min="0" max="255" value="32" class="iobp-range" />
                                <span id="iobp-eraser-tolerance-value" class="iobp-range-value">32</span>
                            </div>
                        </div>
                        <div class="iobp-form-group" id="iobp-eraser-contiguous-group" style="display: none;">
                            <label class="iobp-checkbox">
                                <input type="checkbox" id="iobp-eraser-contiguous" checked />
                                <span>Contiguous</span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Phase 8: Paint Bucket Settings -->
                <div class="iobp-sidebar-section" id="iobp-bucket-settings" style="display: none;">
                    <button class="iobp-section-header" data-section="bucket-options">
                        <span class="iobp-section-title">Paint Bucket Settings</span>
                        <span class="iobp-section-arrow">▼</span>
                    </button>
                    <div class="iobp-section-content" id="section-bucket-options">
                        <div class="iobp-form-group">
                            <label>Fill Type</label>
                            <select id="iobp-bucket-fill-type" class="iobp-input">
                                <option value="color">Foreground Color</option>
                                <option value="pattern">Pattern</option>
                            </select>
                        </div>
                        <div class="iobp-form-group">
                            <label>Tolerance</label>
                            <div class="iobp-range-group">
                                <input type="range" id="iobp-bucket-tolerance" min="0" max="255" value="32" class="iobp-range" />
                                <span id="iobp-bucket-tolerance-value" class="iobp-range-value">32</span>
                            </div>
                        </div>
                        <div class="iobp-form-group">
                            <label>Fill Opacity (%)</label>
                            <div class="iobp-range-group">
                                <input type="range" id="iobp-bucket-opacity" min="0" max="100" value="100" class="iobp-range" />
                                <span id="iobp-bucket-opacity-value" class="iobp-range-value">100%</span>
                            </div>
                        </div>
                        <div class="iobp-form-group">
                            <label class="iobp-checkbox">
                                <input type="checkbox" id="iobp-bucket-contiguous" checked />
                                <span>Contiguous</span>
                            </label>
                        </div>
                        <div class="iobp-form-group">
                            <label class="iobp-checkbox">
                                <input type="checkbox" id="iobp-bucket-antialias" checked />
                                <span>Anti-alias</span>
                            </label>
                        </div>
                        <div class="iobp-form-group">
                            <label class="iobp-checkbox">
                                <input type="checkbox" id="iobp-bucket-all-layers" />
                                <span>Sample All Layers</span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Phase 8: Magic Wand Settings -->
                <div class="iobp-sidebar-section" id="iobp-wand-settings" style="display: none;">
                    <button class="iobp-section-header" data-section="wand-options">
                        <span class="iobp-section-title">Magic Wand Settings</span>
                        <span class="iobp-section-arrow">▼</span>
                    </button>
                    <div class="iobp-section-content" id="section-wand-options">
                        <div class="iobp-form-group">
                            <label>Tolerance</label>
                            <div class="iobp-range-group">
                                <input type="range" id="iobp-wand-tolerance" min="0" max="255" value="32" class="iobp-range" />
                                <span id="iobp-wand-tolerance-value" class="iobp-range-value">32</span>
                            </div>
                        </div>
                        <div class="iobp-form-group">
                            <label class="iobp-checkbox">
                                <input type="checkbox" id="iobp-wand-contiguous" checked />
                                <span>Contiguous</span>
                            </label>
                        </div>
                        <div class="iobp-form-group">
                            <label class="iobp-checkbox">
                                <input type="checkbox" id="iobp-wand-antialias" checked />
                                <span>Anti-alias</span>
                            </label>
                        </div>
                        <div class="iobp-form-group">
                            <label class="iobp-checkbox">
                                <input type="checkbox" id="iobp-wand-sample-all" />
                                <span>Sample All Layers</span>
                            </label>
                        </div>
                        <div class="iobp-form-group">
                            <label>Selection Mode</label>
                            <div class="iobp-selection-mode-btns">
                                <button class="iobp-btn iobp-btn-sm active" data-mode="new" title="New Selection">New</button>
                                <button class="iobp-btn iobp-btn-sm" data-mode="add" title="Add to Selection (+Shift)">Add</button>
                                <button class="iobp-btn iobp-btn-sm" data-mode="subtract" title="Subtract from Selection (+Alt)">Subtract</button>
                                <button class="iobp-btn iobp-btn-sm" data-mode="intersect" title="Intersect with Selection">Intersect</button>
                            </div>
                        </div>
                        <div class="iobp-form-group">
                            <button id="iobp-clear-selection" class="iobp-btn iobp-btn-block">Clear Selection</button>
                        </div>
                    </div>
                </div>

                <!-- Text Section -->
                <div class="iobp-sidebar-section">
                    <button class="iobp-section-header" data-section="text">
                        <span class="iobp-section-title">Text</span>
                        <span class="iobp-section-arrow">▼</span>
                    </button>
                    <div class="iobp-section-content" id="section-text">
                        <div class="iobp-form-group">
                            <label>Add Text</label>
                            <div class="iobp-input-group">
                                <input type="text" id="iobp-text-input" placeholder="Enter text..." class="iobp-input" />
                                <button id="iobp-add-text" class="iobp-btn">Add</button>
                            </div>
                        </div>
                        <div class="iobp-form-group">
                            <label>Font Family</label>
                            <select id="iobp-font-family" class="iobp-input">
                                <option value="">Default</option>
                            </select>
                        </div>
                        <div class="iobp-form-group">
                            <label>Font Size</label>
                            <input type="number" id="iobp-font-size" value="32" min="8" max="200" class="iobp-input" />
                        </div>
                        <div class="iobp-form-group">
                            <label>Text Color</label>
                            <input type="color" id="iobp-font-color" value="#000000" class="iobp-color-input" />
                        </div>
                        <div class="iobp-form-group">
                            <button id="iobp-apply-text-style" class="iobp-btn iobp-btn-block">Apply to Selected</button>
                        </div>
                    </div>
                </div>

                <!-- Shapes Section -->
                <div class="iobp-sidebar-section">
                    <button class="iobp-section-header" data-section="shapes">
                        <span class="iobp-section-title">Shapes</span>
                        <span class="iobp-section-arrow">▼</span>
                    </button>
                    <div class="iobp-section-content" id="section-shapes">
                        <div class="iobp-form-group">
                            <label>Add Shape</label>
                            <div class="iobp-shape-grid">
                                <button class="iobp-shape-btn" data-shape="rectangle" title="Rectangle">▭</button>
                                <button class="iobp-shape-btn" data-shape="circle" title="Circle">○</button>
                                <button class="iobp-shape-btn" data-shape="triangle" title="Triangle">△</button>
                                <button class="iobp-shape-btn" data-shape="line" title="Line">/</button>
                            </div>
                        </div>
                        <div class="iobp-form-group">
                            <label>Fill Color</label>
                            <div class="iobp-color-row">
                                <input type="color" id="iobp-shape-fill" value="#3498db" class="iobp-color-input" />
                                <label class="iobp-checkbox">
                                    <input type="checkbox" id="iobp-shape-no-fill" />
                                    <span>No Fill</span>
                                </label>
                            </div>
                        </div>
                        <div class="iobp-form-group">
                            <label>Fill Opacity</label>
                            <div class="iobp-range-group">
                                <input type="range" id="iobp-fill-opacity" min="0" max="100" value="100" class="iobp-range" />
                                <span id="iobp-fill-opacity-value" class="iobp-range-value">100%</span>
                            </div>
                        </div>
                        <div class="iobp-form-group">
                            <label>Stroke Color</label>
                            <input type="color" id="iobp-shape-stroke" value="#2c3e50" class="iobp-color-input" />
                        </div>
                        <div class="iobp-form-group">
                            <label>Stroke Width</label>
                            <input type="number" id="iobp-shape-stroke-width" value="2" min="0" max="20" class="iobp-input" />
                        </div>
                        <div class="iobp-form-group">
                            <label>Stroke Opacity</label>
                            <div class="iobp-range-group">
                                <input type="range" id="iobp-stroke-opacity" min="0" max="100" value="100" class="iobp-range" />
                                <span id="iobp-stroke-opacity-value" class="iobp-range-value">100%</span>
                            </div>
                        </div>
                        <div class="iobp-form-group">
                            <label class="iobp-checkbox">
                                <input type="checkbox" id="iobp-shape-no-stroke" />
                                <span>No Stroke</span>
                            </label>
                        </div>
                        <div class="iobp-form-group">
                            <button id="iobp-eyedropper-btn" class="iobp-btn iobp-btn-block">Pick Color from Canvas</button>
                            <button id="iobp-apply-shape-style" class="iobp-btn iobp-btn-block">Apply to Selected</button>
                        </div>
                    </div>
                </div>

                <!-- Gradient Section -->
                <div class="iobp-sidebar-section">
                    <button class="iobp-section-header" data-section="gradient">
                        <span class="iobp-section-title">Gradient & Fill</span>
                        <span class="iobp-section-arrow">▼</span>
                    </button>
                    <div class="iobp-section-content" id="section-gradient">
                        <div class="iobp-form-group">
                            <label>Gradient Type</label>
                            <select id="iobp-gradient-type" class="iobp-input">
                                <option value="none">Solid Color</option>
                                <option value="linear">Linear Gradient</option>
                                <option value="radial">Radial Gradient</option>
                            </select>
                        </div>
                        <div id="iobp-gradient-controls">
                            <div class="iobp-form-group">
                                <label>Color 1</label>
                                <input type="color" id="iobp-gradient-color1" value="#ffffff" class="iobp-color-input" />
                            </div>
                            <div class="iobp-form-group">
                                <label>Opacity 1</label>
                                <div class="iobp-range-group">
                                    <input type="range" id="iobp-gradient-opacity1" min="0" max="100" value="100" class="iobp-range" />
                                    <span id="iobp-gradient-opacity1-value" class="iobp-range-value">100%</span>
                                </div>
                            </div>
                            <div class="iobp-form-group">
                                <label>Color 2</label>
                                <input type="color" id="iobp-gradient-color2" value="#000000" class="iobp-color-input" />
                            </div>
                            <div class="iobp-form-group">
                                <label>Opacity 2</label>
                                <div class="iobp-range-group">
                                    <input type="range" id="iobp-gradient-opacity2" min="0" max="100" value="100" class="iobp-range" />
                                    <span id="iobp-gradient-opacity2-value" class="iobp-range-value">100%</span>
                                </div>
                            </div>
                            <div id="iobp-gradient-angle-control" class="iobp-form-group">
                                <label>Angle</label>
                                <div class="iobp-range-group">
                                    <input type="range" id="iobp-gradient-angle" min="0" max="360" value="0" class="iobp-range" />
                                    <span id="iobp-gradient-angle-value" class="iobp-range-value">0°</span>
                                </div>
                            </div>
                            <div class="iobp-form-group">
                                <button id="iobp-apply-gradient" class="iobp-btn iobp-btn-block">Apply Gradient</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Images Section -->
                <div class="iobp-sidebar-section">
                    <button class="iobp-section-header" data-section="images">
                        <span class="iobp-section-title">Images</span>
                        <span class="iobp-section-arrow">▼</span>
                    </button>
                    <div class="iobp-section-content" id="section-images">
                        <div class="iobp-form-group">
                            <label>Add Logo/Image</label>
                            <input type="file" id="iobp-logo-upload" accept="image/*" class="iobp-file-input" />
                            <button id="iobp-add-logo" class="iobp-btn iobp-btn-block">Upload Image</button>
                        </div>
                    </div>
                </div>

                <!-- Properties Section -->
                <div class="iobp-sidebar-section">
                    <button class="iobp-section-header" data-section="properties">
                        <span class="iobp-section-title">Properties</span>
                        <span class="iobp-section-arrow">▼</span>
                    </button>
                    <div class="iobp-section-content" id="section-properties">
                        <div class="iobp-form-group">
                            <label>Blend Mode</label>
                            <select id="iobp-blend-mode" class="iobp-input"></select>
                        </div>
                        <div class="iobp-form-group">
                            <button id="iobp-delete-selected" class="iobp-btn iobp-btn-block">Delete Selected</button>
                            <button id="iobp-clear-all" class="iobp-btn iobp-btn-block iobp-btn-danger">Clear All</button>
                        </div>
                    </div>
                </div>

                <!-- Phase 6: Snapping & Guides Section -->
                <div class="iobp-sidebar-section">
                    <button class="iobp-section-header" data-section="snapping">
                        <span class="iobp-section-title">Snapping & Guides</span>
                        <span class="iobp-section-arrow">▼</span>
                    </button>
                    <div class="iobp-section-content" id="section-snapping">
                        <div class="iobp-form-group">
                            <label class="iobp-checkbox">
                                <input type="checkbox" id="iobp-snapping-enabled" checked />
                                <span>Enable Magnetic Guides</span>
                            </label>
                            <p style="font-size: 11px; color: #a0a0a0; margin-top: 6px;">
                                Automatically align objects to canvas edges and other objects
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Phase 6: Export Section -->
                <div class="iobp-sidebar-section">
                    <button class="iobp-section-header" data-section="export">
                        <span class="iobp-section-title">Export Layers</span>
                        <span class="iobp-section-arrow">▼</span>
                    </button>
                    <div class="iobp-section-content" id="section-export">
                        <div class="iobp-form-group">
                            <button id="iobp-export-selected" class="iobp-btn iobp-btn-block">Export Selected Layer</button>
                            <button id="iobp-export-all-layers" class="iobp-btn iobp-btn-block">Export All Layers</button>
                            <p style="font-size: 11px; color: #a0a0a0; margin-top: 6px;">
                                Export layers as separate PNG files
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Font Management Section -->
                <div class="iobp-sidebar-section">
                    <button class="iobp-section-header" data-section="fonts">
                        <span class="iobp-section-title">Font Management</span>
                        <span class="iobp-section-arrow">▼</span>
                    </button>
                    <div class="iobp-section-content" id="section-fonts">
                        <div class="iobp-form-group">
                            <label>Upload Font</label>
                            <input type="file" id="iobp-font-upload" accept=".ttf,.otf,.woff,.woff2" class="iobp-file-input" />
                            <button id="iobp-upload-font-btn" class="iobp-btn iobp-btn-block">Upload Font</button>
                            <span id="iobp-font-upload-status" class="iobp-status-text"></span>
                        </div>
                        <div id="iobp-font-list" class="iobp-font-list"></div>
                    </div>
                </div>

            </div>
        </aside>

        <!-- Canvas Area -->
        <main class="iobp-canvas-area">
            <div class="iobp-canvas-wrapper">
                <div class="iobp-canvas-container">
                    <canvas id="iobp-overlay-canvas" width="800" height="450"></canvas>
                </div>
            </div>
            <div id="iobp-save-status" class="iobp-save-status"></div>
        </main>

        <!-- Right Sidebar - Layers -->
        <aside class="iobp-layers-sidebar">
            <div class="iobp-layers-header">
                <h3>🎨 Layers</h3>
            </div>
            <div id="iobp-layer-list" class="iobp-layer-list">
                <div class="iobp-layer-empty">No layers yet. Add text, images, or shapes to get started.</div>
            </div>
        </aside>
    </div>

    <!-- Mobile Menu Overlay -->
    <div class="iobp-sidebar-overlay" id="iobp-sidebar-overlay"></div>

    <!-- Phase 7: Custom Canvas Size Dialog -->
    <div id="iobp-custom-size-modal" class="iobp-modal">
        <div class="iobp-modal-content">
            <div class="iobp-modal-header">
                <h2>Custom Canvas Size</h2>
                <button class="iobp-modal-close">&times;</button>
            </div>
            <div class="iobp-modal-body">
                <!-- Clipboard Detection Banner -->
                <div id="iobp-clipboard-banner" class="iobp-clipboard-banner" style="display: none;">
                    <span id="iobp-clipboard-info"></span>
                    <button id="iobp-use-clipboard-size" class="iobp-btn iobp-btn-sm">Use These Dimensions</button>
                </div>

                <!-- Clipboard Image Preview -->
                <div id="iobp-clipboard-preview-container" style="display: none; margin: 10px 0; text-align: center;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Clipboard Preview:</label>
                    <img id="iobp-clipboard-preview" style="max-width: 100%; max-height: 200px; border: 1px solid #ddd; border-radius: 4px;" />
                </div>

                <!-- Dimensions Input -->
                <div class="iobp-form-row">
                    <div class="iobp-form-group">
                        <label>Width (px)</label>
                        <input type="number" id="iobp-custom-width" class="iobp-input" value="1920" min="100" max="4000" />
                    </div>
                    <div class="iobp-form-group">
                        <label>Height (px)</label>
                        <input type="number" id="iobp-custom-height" class="iobp-input" value="1080" min="100" max="4000" />
                    </div>
                </div>

                <!-- Constrain Proportions -->
                <div class="iobp-form-group">
                    <label class="iobp-checkbox">
                        <input type="checkbox" id="iobp-constrain-proportions" />
                        <span>🔒 Constrain Proportions</span>
                    </label>
                </div>

                <!-- Orientation Toggle -->
                <div class="iobp-form-group">
                    <label>Orientation</label>
                    <div class="iobp-orientation-toggle">
                        <button id="iobp-orientation-landscape" class="iobp-btn iobp-btn-sm active">Landscape</button>
                        <button id="iobp-orientation-portrait" class="iobp-btn iobp-btn-sm">Portrait</button>
                    </div>
                </div>

                <!-- Paste Clipboard Image -->
                <div id="iobp-paste-option" class="iobp-form-group" style="display: none;">
                    <label class="iobp-checkbox">
                        <input type="checkbox" id="iobp-paste-clipboard-image" />
                        <span>Paste clipboard image to canvas</span>
                    </label>
                </div>

                <!-- Save as Preset -->
                <div class="iobp-form-group">
                    <label>Save as Preset (optional)</label>
                    <input type="text" id="iobp-preset-name" class="iobp-input" placeholder="e.g., Instagram Post" />
                </div>
            </div>
            <div class="iobp-modal-footer">
                <button id="iobp-cancel-custom-size" class="iobp-btn">Cancel</button>
                <button id="iobp-apply-custom-size" class="iobp-btn iobp-btn-primary">Create Canvas</button>
            </div>
        </div>
    </div>

    <!-- Zoom Tool Context Menu -->
    <div id="iobp-zoom-context-menu" class="iobp-zoom-context-menu" style="display: none;">
        <div class="iobp-context-menu-item" data-action="zoom-in">
            <span>Zoom In</span>
        </div>
        <div class="iobp-context-menu-item" data-action="zoom-out">
            <span>Zoom Out</span>
        </div>
        <div class="iobp-context-menu-separator"></div>
        <div class="iobp-context-menu-item" data-action="fit-screen">
            <span>Fit on Screen</span>
        </div>
        <div class="iobp-context-menu-item" data-action="actual-pixels">
            <span>Actual Pixels</span>
        </div>
    </div>
</div>