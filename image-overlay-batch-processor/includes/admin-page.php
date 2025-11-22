<div class="wrap iobp-admin-wrap">
    <h1>Image Overlay Batch Processor</h1>
    <p>Apply overlays to multiple images at once.</p>

    <div class="iobp-section">
        <h2>Canvas Size</h2>
        <select id="iobp-canvas-size">
            <option value="800x450" selected>800x450</option>
            <option value="728x218">728x218</option>
        </select>
        <p class="description">Current canvas size: <strong id="iobp-current-canvas-size">800x450</strong></p>
    </div>

    <div class="iobp-section">
        <h2>Overlay Selection</h2>
        <div class="iobp-upload-section">
            <input type="file" id="iobp-overlay-upload" accept="image/png,image/jpeg" />
            <button id="iobp-upload-btn" class="button">Upload to Directory</button>
            <button id="iobp-load-overlay-from-library" class="button">Select from Media Library</button>
        </div>
        <div id="iobp-overlay-list" class="iobp-overlay-list"></div>
        <p>Selected overlay: <strong id="iobp-selected-overlay-name">None</strong></p>
    </div>

    <div class="iobp-section">
        <h2>Image Selection</h2>
        <button id="iobp-load-images" class="button">Load Media Library</button>
        <button id="iobp-select-all" class="button">Select All</button>
        <button id="iobp-deselect-all" class="button">Deselect All</button>
        <p>Selected images: <strong id="iobp-selected-count">0</strong></p>
        <div id="iobp-pagination-controls"></div>
        <div id="iobp-image-list" class="iobp-image-list"></div>
    </div>

    <div class="iobp-section">
        <h2>Process</h2>
        <button id="iobp-process-btn" class="button button-primary" disabled>Apply Overlay to Selected Images</button>
        <div id="iobp-progress" style="display:none;">Processing...</div>
        <div id="iobp-results"></div>
    </div>
</div>