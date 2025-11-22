<div class="iobp-overlay-editor-wrap">
    <h1>Editor</h1>

    <!-- Phase 4: Multi-Selection Toolbar (hidden by default) -->
    <div id="iobp-multi-select-toolbar" class="iobp-multi-select-toolbar">
        <div class="iobp-multi-select-header">
            <span id="iobp-multi-select-count">0 objects selected</span>
        </div>
        <div class="iobp-multi-select-controls">
            <label>Blend Mode:</label>
            <select id="iobp-batch-blend-mode">
                <!-- Populated by JavaScript -->
            </select>
            
            <label>Opacity:</label>
            <input type="range" id="iobp-batch-opacity" min="0" max="100" value="100" style="width: 120px;" />
            <span id="iobp-batch-opacity-value">100%</span>
            
            <button id="iobp-batch-lock" class="button">🔒 Lock All</button>
            <button id="iobp-batch-unlock" class="button">🔓 Unlock All</button>
            <button id="iobp-batch-delete" class="button button-danger">🗑️ Delete All</button>
        </div>
    </div>

    <div class="iobp-editor-toolbar">
        <div class="iobp-control-group">
            <label>Canvas Size:</label>
            <select id="iobp-editor-canvas-size">
                <option value="800x450" selected>800x450</option>
                <option value="728x218">728x218</option>
            </select>
        </div>

        <!-- Phase 4: Blend Mode Control -->
        <div class="iobp-control-group iobp-advanced-properties">
            <label>Blend Mode:</label>
            <select id="iobp-blend-mode">
                <!-- Populated by JavaScript -->
            </select>
        </div>

        <div class="iobp-control-group">
            <label>Text:</label>
            <input type="text" id="iobp-text-input" placeholder="Enter text..." />
            <button id="iobp-add-text" class="button">Add Text</button>
        </div>

        <div class="iobp-control-group">
            <label>Font:</label>
            <select id="iobp-font-family">
                <option value="">Default</option>
            </select>
        </div>

        <div class="iobp-control-group">
            <label>Font size:</label>
            <input type="number" id="iobp-font-size" value="32" min="8" max="200" style="width: 70px;" />
            <label>Color:</label>
            <input type="color" id="iobp-font-color" value="#000000" />
            <button id="iobp-apply-text-style" class="button">Apply to selected</button>
        </div>

        <div class="iobp-control-group">
            <label>Logo:</label>
            <input type="file" id="iobp-logo-upload" accept="image/*" />
            <button id="iobp-add-logo" class="button">Add Logo</button>
        </div>

        <!-- Shape Tools -->
        <div class="iobp-control-group iobp-shape-tools">
            <label>Shapes:</label>
            <button class="button iobp-shape-tool-btn" data-shape="rectangle" title="Add Rectangle">▭</button>
            <button class="button iobp-shape-tool-btn" data-shape="circle" title="Add Circle">○</button>
            <button class="button iobp-shape-tool-btn" data-shape="triangle" title="Add Triangle">△</button>
            <button class="button iobp-shape-tool-btn" data-shape="line" title="Add Line">/</button>
        </div>

        <!-- Shape Properties -->
        <div class="iobp-control-group iobp-shape-properties">
            <label>Fill:</label>
            <input type="color" id="iobp-shape-fill" value="#3498db" />
            <label>
                <input type="checkbox" id="iobp-shape-no-fill" />
                No Fill
            </label>
            <button id="iobp-eyedropper-btn" class="button iobp-eyedropper-btn" title="Pick color from canvas">💧</button>
            <label>Stroke:</label>
            <input type="color" id="iobp-shape-stroke" value="#2c3e50" />
            <label>Width:</label>
            <input type="number" id="iobp-shape-stroke-width" value="2" min="0" max="20" style="width: 60px;" />
            <label>
                <input type="checkbox" id="iobp-shape-no-stroke" />
                No Stroke
            </label>
            <button id="iobp-apply-shape-style" class="button">Apply to selected</button>
        </div>

        <!-- Phase 4: Fill & Stroke Opacity -->
        <div class="iobp-control-group iobp-advanced-properties">
            <label>Fill Opacity:</label>
            <input type="range" id="iobp-fill-opacity" min="0" max="100" value="100" style="width: 100px;" />
            <span id="iobp-fill-opacity-value">100%</span>
            
            <label>Stroke Opacity:</label>
            <input type="range" id="iobp-stroke-opacity" min="0" max="100" value="100" style="width: 100px;" />
            <span id="iobp-stroke-opacity-value">100%</span>
        </div>

        <div class="iobp-control-group">
            <button id="iobp-start-blank" class="button">Blank Canvas</button>
            <button id="iobp-load-from-library" class="button">Load from Library</button>
        </div>

        <div class="iobp-control-group">
            <button id="iobp-delete-selected" class="button">Delete selected</button>
            <button id="iobp-clear-all" class="button">Clear all</button>
        </div>
    </div>

    <!-- Phase 4: Gradient Controls Section -->
    <div class="iobp-gradient-section">
        <h4>Gradient & Advanced Fill</h4>
        <div class="iobp-gradient-row">
            <label>Type:</label>
            <select id="iobp-gradient-type">
                <option value="none">Solid Color</option>
                <option value="linear">Linear Gradient</option>
                <option value="radial">Radial Gradient</option>
            </select>
        </div>
        
        <div id="iobp-gradient-controls" class="iobp-gradient-controls">
            <div class="iobp-gradient-row">
                <label>Color 1:</label>
                <input type="color" id="iobp-gradient-color1" value="#ffffff" class="iobp-gradient-color-input" />
                <label>Opacity:</label>
                <input type="range" id="iobp-gradient-opacity1" min="0" max="100" value="100" class="iobp-opacity-input" />
                <span id="iobp-gradient-opacity1-value">100%</span>
            </div>
            
            <div class="iobp-gradient-row">
                <label>Color 2:</label>
                <input type="color" id="iobp-gradient-color2" value="#000000" class="iobp-gradient-color-input" />
                <label>Opacity:</label>
                <input type="range" id="iobp-gradient-opacity2" min="0" max="100" value="100" class="iobp-opacity-input" />
                <span id="iobp-gradient-opacity2-value">100%</span>
            </div>
            
            <div id="iobp-gradient-angle-control" class="iobp-gradient-row">
                <label>Angle:</label>
                <input type="range" id="iobp-gradient-angle" min="0" max="360" value="0" style="width: 120px;" />
                <span id="iobp-gradient-angle-value" class="iobp-angle-display">0°</span>
            </div>
            
            <div class="iobp-gradient-row">
                <button id="iobp-apply-gradient" class="button button-primary">Apply Gradient to Selected</button>
            </div>
        </div>
    </div>

    <div class="iobp-editor-main">
        <!-- Canvas Section -->
        <div class="iobp-editor-canvas-section">
            <div class="iobp-editor-canvas-wrap">
                <canvas id="iobp-overlay-canvas" width="800" height="450"></canvas>
            </div>

            <div class="iobp-editor-footer">
                <input type="text" id="iobp-overlay-filename" placeholder="my-overlay.png" />
                <button id="iobp-save-overlay" class="button button-primary">Save to Media Library</button>
                <span id="iobp-save-status"></span>
            </div>
        </div>

        <!-- Layer Panel -->
        <div class="iobp-layer-panel">
            <div class="iobp-layer-panel-header">Layers</div>
            <div id="iobp-layer-list" class="iobp-layer-list">
                <div class="iobp-layer-empty">No layers yet. Add text, images, or shapes to get started.</div>
            </div>
        </div>
    </div>

    <div class="iobp-font-manager">
        <h3>Font Management</h3>
        <div class="iobp-font-upload-section">
            <input type="file" id="iobp-font-upload" accept=".ttf,.otf,.woff,.woff2" />
            <button id="iobp-upload-font-btn" class="button">Upload Font</button>
            <span id="iobp-font-upload-status"></span>
        </div>
        <div id="iobp-font-list" class="iobp-font-list"></div>
    </div>
</div>