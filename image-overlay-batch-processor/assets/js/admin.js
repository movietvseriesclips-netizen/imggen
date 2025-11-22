jQuery(document).ready(function($) {

    var selectedOverlay = null;
    var selectedOverlaySource = null;
    var selectedOverlayId = null;
    var selectedOverlayData = null;
    var selectedImages = [];
    var selectedCanvasSize = '800x450';
    var currentPage = 1;
    var totalPages = 1;
    var isLoading = false;
    var isMediaLibraryOverlay = false; // Track if overlay is from media lib modal

    // By default, load directory overlays
    loadDirectoryOverlays();

    $('#iobp-canvas-size').on('change', function() {
        selectedCanvasSize = $(this).val();
        $('#iobp-current-canvas-size').text(selectedCanvasSize);
        resetOverlaySelection();
        loadDirectoryOverlays();
        updateProcessButton();
    });

    $('#iobp-upload-btn').on('click', function() {
        var fileInput = $('#iobp-overlay-upload')[0];
        if (!fileInput.files.length) {
            alert('Please select a file');
            return;
        }
        var formData = new FormData();
        formData.append('action', 'iobp_upload_overlay');
        formData.append('nonce', iobpData.nonce);
        formData.append('canvas_size', selectedCanvasSize);
        formData.append('overlay', fileInput.files[0]);
        $.ajax({
            url: iobpData.ajaxUrl,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                if (response.success) {
                    alert('Overlay uploaded successfully');
                    fileInput.value = '';
                    loadDirectoryOverlays();
                } else {
                    alert('Error: ' + response.data);
                }
            },
            error: function() {
                alert('Upload failed');
            }
        });
    });

    // Media library overlay selection
    var overlayMediaFrame = null;
    $('#iobp-load-overlay-from-library').on('click', function(e) {
        e.preventDefault();
        if (overlayMediaFrame) {
            overlayMediaFrame.open();
            return;
        }
        overlayMediaFrame = wp.media({
            title: 'Select Overlay from Media Library',
            button: { text: 'Use this Overlay' },
            multiple: false,
            library: { type: 'image' }
        });
        overlayMediaFrame.on('select', function() {
            var attachment = overlayMediaFrame.state().get('selection').first().toJSON();
            var config = iobpData.canvasSizes[selectedCanvasSize];
            if (attachment.width !== config.canvas_width || attachment.height !== config.canvas_height) {
                alert('Selected image dimensions (' + attachment.width + 'x' + attachment.height + ') do not match canvas size (' + config.canvas_width + 'x' + config.canvas_height + '). Please select an image with matching dimensions.');
                return;
            }
            selectedOverlay = attachment.filename || attachment.title;
            selectedOverlaySource = 'media_library';
            selectedOverlayId = attachment.id;
            selectedOverlayData = {
                id: attachment.id,
                filename: attachment.filename || attachment.title,
                url: attachment.url,
                source: 'media_library'
            };
            isMediaLibraryOverlay = true;
            $('#iobp-selected-overlay-name').text(selectedOverlayData.filename);
            updateProcessButton();
            // Explicitly show only the selected overlay
            renderMediaLibraryOverlay(selectedOverlayData);
        });
        overlayMediaFrame.open();
    });

    function loadDirectoryOverlays() {
        isMediaLibraryOverlay = false;
        $.ajax({
            url: iobpData.ajaxUrl,
            type: 'POST',
            data: {
                action: 'iobp_get_overlays',
                nonce: iobpData.nonce,
                canvas_size: selectedCanvasSize
            },
            success: function(response) {
                if (response.success && !isMediaLibraryOverlay) {
                    renderOverlays(response.data);
                }
            }
        });
    }

    function renderMediaLibraryOverlay(overlay) {
        // Only the one overlay is shown
        renderOverlays([overlay]);
    }

    function renderOverlays(overlays) {
        var html = '';
        if (!overlays || overlays.length === 0) {
            html = '<p>No overlays available for ' + selectedCanvasSize + '</p>';
        } else {
            overlays.forEach(function(overlay) {
                var isSelected = (overlay.source === selectedOverlaySource &&
                                (overlay.source === 'media_library' ? overlay.id === selectedOverlayId : overlay.filename === selectedOverlay));
                html += '<div class="iobp-overlay-item' + (isSelected ? ' selected' : '') + '" ';
                html += 'data-filename="' + overlay.filename + '" ';
                html += 'data-source="' + overlay.source + '" ';
                if (overlay.source === 'media_library') {
                    html += 'data-id="' + overlay.id + '" ';
                }
                html += '>';
                html += '<img src="' + overlay.url + '" alt="' + overlay.filename + '">';
                html += '<div class="overlay-name">' + overlay.filename + '</div>';
                if (overlay.source === 'directory') {
                    html += '<a href="#" class="delete-overlay" data-filename="' + overlay.filename + '">Delete</a>';
                }
                html += '</div>';
            });
        }
        $('#iobp-overlay-list').html(html);
    }

    // Select overlay
    $(document).on('click', '.iobp-overlay-item', function(e) {
        if ($(e.target).hasClass('delete-overlay')) {
            return;
        }
        $('.iobp-overlay-item').removeClass('selected');
        $(this).addClass('selected');
        selectedOverlay = $(this).data('filename');
        selectedOverlaySource = $(this).data('source');
        selectedOverlayId = $(this).data('id') || null;
        if (selectedOverlaySource === 'media_library') {
            selectedOverlayData = {
                id: selectedOverlayId,
                filename: selectedOverlay,
                url: $(this).find('img').attr('src'),
                source: 'media_library'
            };
        } else {
            selectedOverlayData = null;
        }
        $('#iobp-selected-overlay-name').text(selectedOverlay);
        updateProcessButton();
    });

    $(document).on('click', '.delete-overlay', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm('Delete this overlay?')) {
            return;
        }
        var filename = $(this).data('filename');
        $.ajax({
            url: iobpData.ajaxUrl,
            type: 'POST',
            data: {
                action: 'iobp_delete_overlay',
                nonce: iobpData.nonce,
                filename: filename,
                canvas_size: selectedCanvasSize
            },
            success: function(response) {
                if (response.success) {
                    if (selectedOverlay === filename && selectedOverlaySource === 'directory') {
                        resetOverlaySelection();
                        updateProcessButton();
                    }
                    loadDirectoryOverlays();
                } else {
                    alert('Delete failed');
                }
            }
        });
    });

    function resetOverlaySelection() {
        selectedOverlay = null;
        selectedOverlaySource = null;
        selectedOverlayId = null;
        selectedOverlayData = null;
        isMediaLibraryOverlay = false;
        $('#iobp-selected-overlay-name').text('None');
        $('.iobp-overlay-item').removeClass('selected');
    }

    // ------ Image selection and batch actions unchanged ------
    $('#iobp-load-images').on('click', function() {
        currentPage = 1;
        $('#iobp-image-list').html('');
        loadMediaLibrary(currentPage, false);
    });
    $(document).on('click', '#iobp-load-more', function() {
        if (currentPage < totalPages && !isLoading) {
            currentPage++;
            loadMediaLibrary(currentPage, true);
        }
    });
    $(document).on('click', '#iobp-prev-page', function() {
        if (currentPage > 1 && !isLoading) {
            currentPage--;
            loadMediaLibrary(currentPage, false);
        }
    });
    $(document).on('click', '#iobp-next-page', function() {
        if (currentPage < totalPages && !isLoading) {
            currentPage++;
            loadMediaLibrary(currentPage, false);
        }
    });
    function loadMediaLibrary(page, append) {
        if (isLoading) return;
        isLoading = true;
        $('#iobp-load-images').prop('disabled', true).text('Loading...');
        $('#iobp-pagination-controls button').prop('disabled', true);
        $.ajax({
            url: iobpData.ajaxUrl,
            type: 'POST',
            data: { action: 'iobp_get_media_library', nonce: iobpData.nonce, page: page },
            success: function(response) {
                if (response.success) {
                    var data = response.data;
                    totalPages = data.total_pages;
                    renderImages(data.images, append);
                    updatePaginationControls(data);
                }
                $('#iobp-load-images').prop('disabled', false).text('Load Media Library');
                isLoading = false;
            },
            error: function() {
                $('#iobp-load-images').prop('disabled', false).text('Load Media Library');
                alert('Failed to load images');
                isLoading = false;
            }
        });
    }
    function renderImages(images, append) {
        var html = '';
        var timestamp = new Date().getTime();
        if (images.length === 0 && !append) {
            html = '<p>No images found in media library</p>';
            $('#iobp-image-list').html(html);
            return;
        }
        images.forEach(function(image) {
            var cacheBustedUrl = image.url + '?t=' + timestamp;
            html += '<div class="iobp-image-item" data-id="' + image.id + '">';
            html += '<img src="' + cacheBustedUrl + '" alt="' + image.title + '">';
            html += '<div class="image-title">' + image.title + '</div>';
            html += '</div>';
        });
        if (append) {
            $('#iobp-image-list').append(html);
        } else {
            $('#iobp-image-list').html(html);
        }
    }
    function updatePaginationControls(data) {
        var html = '<div id="iobp-pagination-info">';
        html += 'Page ' + data.page + ' of ' + data.total_pages;
        html += ' (Total images: ' + data.total + ')';
        html += '</div>';
        html += '<div id="iobp-pagination-buttons">';
        html += '<button id="iobp-prev-page" type="button"';
        if (data.page <= 1) html += ' disabled';
        html += '>« Previous</button>';
        if (data.page < data.total_pages) {
            html += '<button id="iobp-load-more" type="button">Load More</button>';
        }
        html += '<button id="iobp-next-page" type="button"';
        if (data.page >= data.total_pages) html += ' disabled';
        html += '>Next »</button>';
        html += '</div>';
        $('#iobp-pagination-controls').html(html);
    }
    $(document).on('click', '.iobp-image-item', function() {
        var imageId = $(this).data('id');
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
            selectedImages = selectedImages.filter(function(id) {
                return id !== imageId;
            });
        } else {
            $(this).addClass('selected');
            selectedImages.push(imageId);
        }
        $('#iobp-selected-count').text(selectedImages.length);
        updateProcessButton();
    });
    $('#iobp-select-all').on('click', function() {
        $('.iobp-image-item').addClass('selected');
        selectedImages = [];
        $('.iobp-image-item').each(function() {
            selectedImages.push($(this).data('id'));
        });
        $('#iobp-selected-count').text(selectedImages.length);
        updateProcessButton();
    });
    $('#iobp-deselect-all').on('click', function() {
        $('.iobp-image-item').removeClass('selected');
        selectedImages = [];
        $('#iobp-selected-count').text(0);
        updateProcessButton();
    });
    function updateProcessButton() {
        if (selectedOverlay && selectedImages.length > 0) {
            $('#iobp-process-btn').prop('disabled', false);
        } else {
            $('#iobp-process-btn').prop('disabled', true);
        }
    }
    $('#iobp-process-btn').on('click', function() {
        if (!selectedOverlay || selectedImages.length === 0) {
            alert('Please select an overlay and at least one image');
            return;
        }
        $('#iobp-process-btn').prop('disabled', true);
        $('#iobp-progress').show();
        $('#iobp-results').html('');
        var postData = {
            action: 'iobp_apply_overlay',
            nonce: iobpData.nonce,
            image_ids: selectedImages,
            canvas_size: selectedCanvasSize,
            overlay_source: selectedOverlaySource
        };
        if (selectedOverlaySource === 'media_library') {
            postData.overlay_id = selectedOverlayId;
        } else {
            postData.overlay = selectedOverlay;
        }
        $.ajax({
            url: iobpData.ajaxUrl,
            type: 'POST',
            data: postData,
            success: function(response) {
                $('#iobp-progress').hide();
                if (response.success) {
                    displayResults(response.data);
                    $('.iobp-image-item').removeClass('selected');
                    selectedImages = [];
                    $('#iobp-selected-count').text(0);
                    setTimeout(function() {
                        loadMediaLibrary(currentPage, false);
                    }, 500);
                } else {
                    alert('Processing failed: ' + response.data);
                }
                $('#iobp-process-btn').prop('disabled', false);
                updateProcessButton();
            },
            error: function() {
                $('#iobp-progress').hide();
                $('#iobp-process-btn').prop('disabled', false);
                alert('Processing failed');
            }
        });
    });
    function displayResults(results) {
        var html = '<h3>Processing Results:</h3>';
        results.forEach(function(result) {
            var className = result.success ? 'success' : 'error';
            html += '<div class="iobp-result-item ' + className + '">';
            if (result.success) {
                html += '<strong>Success:</strong> Image ID ' + result.id + ' processed. ';
                html += 'New image ID: ' + result.new_id;
            } else {
                html += '<strong>Error:</strong> Image ID ' + result.id + ' - ' + result.message;
            }
            html += '</div>';
        });
        $('#iobp-results').html(html);
    }
});