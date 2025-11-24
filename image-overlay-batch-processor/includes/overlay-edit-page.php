<div class="iobp-overlay-editor-wrap">
    <!-- Top Header Bar -->
    <div class="iobp-editor-header">
        <button id="iobp-menu-toggle" class="iobp-menu-toggle" aria-label="Toggle Menu">☰</button>
        <h1 class="iobp-editor-title">ImgGen Editor</h1>
        <div class="iobp-header-actions">
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
</div>