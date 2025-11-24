jQuery(document).ready(function($) {
    console.log('Overlay Edit JS Loading (Phase 6 - v1.7.0)...');

    if (typeof fabric === 'undefined') {
        alert('Error: Fabric.js library failed to load. Please refresh the page.');
        return;
    }

    var canvas = null;
    var selectedCanvasSize = '800x450';
    var canvasConfig = iobpOverlayEdit.canvasSizes;
    var loadedFonts = {};
    var layerIdCounter = 0;
    var groupIdCounter = 0;
    var layerGroups = {};
    var isUpdatingSelection = false;
    var eyedropperActive = false;
    var selectedObjects = [];
    var contextMenuVisible = false;
    var currentContextTarget = null;

    // Phase 6: Snapping and guides
    var snappingEnabled = true;
    var snapTolerance = 10; // pixels
    var guideLines = [];
    var aligningLineMargin = 4;
    var aligningLineWidth = 1;
    var aligningLineColor = 'rgb(0, 161, 255)';
    var verticalLines = [];
    var horizontalLines = [];

    // Phase 4: Blend modes supported by canvas globalCompositeOperation
    var blendModes = [
        { value: 'source-over', label: 'Normal' },
        { value: 'multiply', label: 'Multiply' },
        { value: 'screen', label: 'Screen' },
        { value: 'overlay', label: 'Overlay' },
        { value: 'darken', label: 'Darken' },
        { value: 'lighten', label: 'Lighten' },
        { value: 'color-dodge', label: 'Color Dodge' },
        { value: 'color-burn', label: 'Color Burn' },
        { value: 'hard-light', label: 'Hard Light' },
        { value: 'soft-light', label: 'Soft Light' },
        { value: 'difference', label: 'Difference' },
        { value: 'exclusion', label: 'Exclusion' },
        { value: 'hue', label: 'Hue' },
        { value: 'saturation', label: 'Saturation' },
        { value: 'color', label: 'Color' },
        { value: 'luminosity', label: 'Luminosity' }
    ];

    function initCanvas(canvasSize) {
        var config = canvasConfig[canvasSize];
        
        if (canvas) {
            canvas.dispose();
        }

        var canvasEl = document.getElementById('iobp-overlay-canvas');
        canvasEl.width = config.canvas_width;
        canvasEl.height = config.canvas_height;

        canvas = new fabric.Canvas('iobp-overlay-canvas', {
            selection: true,
            preserveObjectStacking: true,
            width: config.canvas_width,
            height: config.canvas_height
        });

        console.log('Canvas initialized (Phase 5):', canvas);

        // Multi-selection support
        canvas.on('selection:created', function(e) {
            if (!isUpdatingSelection) {
                if (e.selected && e.selected.length > 1) {
                    selectedObjects = e.selected;
                    updateMultiSelectUI();
                } else if (e.selected && e.selected.length === 1) {
                    updateLayerPanelSelection(e.selected[0]);
                }
            }
        });

        canvas.on('selection:updated', function(e) {
            if (!isUpdatingSelection) {
                if (e.selected && e.selected.length > 1) {
                    selectedObjects = e.selected;
                    updateMultiSelectUI();
                } else if (e.selected && e.selected.length === 1) {
                    updateLayerPanelSelection(e.selected[0]);
                }
            }
        });

        canvas.on('selection:cleared', function() {
            if (!isUpdatingSelection) {
                selectedObjects = [];
                hideMultiSelectUI();
                clearLayerPanelSelection();
            }
        });

        canvas.on('object:added', function() {
            refreshLayerPanel();
        });

        canvas.on('object:removed', function() {
            refreshLayerPanel();
        });

        canvas.on('object:modified', function() {
            refreshLayerPanel();
        });

        canvas.on('object:moving', function(e) {
            if (e.target && e.target.layerLocked) {
                e.target.set({
                    left: e.target._lastLeft || e.target.left,
                    top: e.target._lastTop || e.target.top
                });
            } else if (e.target) {
                // Phase 6: Snapping
                if (snappingEnabled) {
                    snapObject(e.target);
                }
                e.target._lastLeft = e.target.left;
                e.target._lastTop = e.target.top;
            }
        });

        canvas.on('before:render', function() {
            canvas.clearContext(canvas.contextTop);
        });

        canvas.on('after:render', function() {
            // Phase 6: Draw guide lines
            if (snappingEnabled) {
                drawGuideLines();
            }
        });

        canvas.on('mouse:up', function() {
            // Phase 6: Clear guide lines after moving
            verticalLines = [];
            horizontalLines = [];
            canvas.renderAll();
        });

        canvas.on('object:scaling', function(e) {
            if (e.target && e.target.layerLocked) {
                e.target.set({
                    scaleX: e.target._lastScaleX || e.target.scaleX,
                    scaleY: e.target._lastScaleY || e.target.scaleY
                });
            } else if (e.target) {
                e.target._lastScaleX = e.target.scaleX;
                e.target._lastScaleY = e.target.scaleY;
            }
        });

        canvas.on('object:rotating', function(e) {
            if (e.target && e.target.layerLocked) {
                e.target.set({
                    angle: e.target._lastAngle || e.target.angle
                });
            } else if (e.target) {
                e.target._lastAngle = e.target.angle;
            }
        });

        canvas.on('mouse:down', function(options) {
            if (eyedropperActive) {
                var pointer = canvas.getPointer(options.e);
                var color = getColorAtPoint(pointer.x, pointer.y);
                
                if (color) {
                    $('#iobp-shape-fill').val(color);
                    deactivateEyedropper();
                }
            }
            
            // Hide context menu on canvas click
            hideContextMenu();
        });

        bindShapeToolHandlers();
    }

    initCanvas(selectedCanvasSize);

    // ========================================
    // PHASE 5: KEYBOARD SHORTCUTS
    // ========================================

    $(document).on('keydown', function(e) {
        // Skip if typing in input field
        if ($(e.target).is('input, textarea')) {
            return;
        }

        var activeObj = canvas ? canvas.getActiveObject() : null;
        
        // Ctrl/Cmd + G - Group selected layers
        if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
            e.preventDefault();
            if (selectedObjects.length > 0) {
                groupSelectedLayers();
            }
        }
        
        // Ctrl/Cmd + Shift + G - Ungroup selected layers
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'G') {
            e.preventDefault();
            if (activeObj) {
                var groupId = getLayerGroupId(activeObj.layerId);
                if (groupId !== null) {
                    removeLayerFromGroups(activeObj.layerId);
                    refreshLayerPanel();
                }
            }
        }
        
        // Delete/Backspace - Delete selected layer
        if ((e.key === 'Delete' || e.key === 'Backspace') && activeObj) {
            e.preventDefault();
            deleteLayer(activeObj);
        }
        
        // Ctrl/Cmd + D - Duplicate selected layer
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            if (activeObj) {
                duplicateLayer(activeObj);
            }
        }
        
        // Arrow keys - Move selected layer
        if (activeObj && !activeObj.layerLocked) {
            var moveAmount = e.shiftKey ? 10 : 1;
            var moved = false;
            
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                activeObj.top -= moveAmount;
                moved = true;
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                activeObj.top += moveAmount;
                moved = true;
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                activeObj.left -= moveAmount;
                moved = true;
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                activeObj.left += moveAmount;
                moved = true;
            }
            
            if (moved) {
                activeObj.setCoords();
                canvas.renderAll();
            }
        }
        
        // Escape - Close eyedropper or deselect
        if (e.key === 'Escape') {
            if (eyedropperActive) {
                deactivateEyedropper();
            } else if (canvas) {
                canvas.discardActiveObject();
                canvas.renderAll();
            }
            hideContextMenu();
        }
    });

    // ========================================
    // PHASE 5: CONTEXT MENU
    // ========================================

    function showContextMenu(x, y, obj) {
        hideContextMenu();
        
        currentContextTarget = obj;
        var $menu = $('<div id="iobp-context-menu" class="iobp-context-menu"></div>');
        
        var groupId = getLayerGroupId(obj.layerId);
        var isInGroup = groupId !== null;
        
        // Duplicate
        $menu.append('<div class="iobp-context-menu-item" data-action="duplicate">📋 Duplicate</div>');
        
        // Delete
        $menu.append('<div class="iobp-context-menu-item" data-action="delete">🗑️ Delete</div>');
        
        $menu.append('<div class="iobp-context-menu-separator"></div>');
        
        // Lock/Unlock
        var lockText = obj.layerLocked ? '🔓 Unlock' : '🔒 Lock';
        $menu.append('<div class="iobp-context-menu-item" data-action="toggle-lock">' + lockText + '</div>');
        
        // Hide/Show
        var visText = obj.visible ? '👁️‍🗨️ Hide' : '👁️ Show';
        $menu.append('<div class="iobp-context-menu-item" data-action="toggle-visibility">' + visText + '</div>');
        
        $menu.append('<div class="iobp-context-menu-separator"></div>');
        
        // Group/Ungroup
        if (isInGroup) {
            $menu.append('<div class="iobp-context-menu-item" data-action="ungroup">⬅ Remove from Group</div>');
        } else if (Object.keys(layerGroups).length > 0) {
            $menu.append('<div class="iobp-context-menu-item" data-action="add-to-group">➡ Add to Group...</div>');
        }
        
        // Create group with selected
        if (selectedObjects.length > 1) {
            $menu.append('<div class="iobp-context-menu-item" data-action="group-selected">📁 Group Selected</div>');
        }
        
        $menu.append('<div class="iobp-context-menu-separator"></div>');
        
        // Move
        $menu.append('<div class="iobp-context-menu-item" data-action="move-up">↑ Bring Forward</div>');
        $menu.append('<div class="iobp-context-menu-item" data-action="move-down">↓ Send Backward</div>');
        $menu.append('<div class="iobp-context-menu-item" data-action="move-top">⬆ Bring to Front</div>');
        $menu.append('<div class="iobp-context-menu-item" data-action="move-bottom">⬇ Send to Back</div>');
        
        $menu.css({
            position: 'absolute',
            left: x + 'px',
            top: y + 'px',
            zIndex: 10000
        });
        
        $('body').append($menu);
        contextMenuVisible = true;
        
        // Event handlers
        $menu.find('.iobp-context-menu-item').on('click', function() {
            var action = $(this).data('action');
            handleContextMenuAction(action, obj);
            hideContextMenu();
        });
        
        // Close on outside click
        setTimeout(function() {
            $(document).one('click', hideContextMenu);
        }, 100);
    }

    function hideContextMenu() {
        $('#iobp-context-menu').remove();
        contextMenuVisible = false;
        currentContextTarget = null;
    }

    function handleContextMenuAction(action, obj) {
        if (!canvas || !obj) return;
        
        switch(action) {
            case 'duplicate':
                duplicateLayer(obj);
                break;
            case 'delete':
                deleteLayer(obj);
                break;
            case 'toggle-lock':
                toggleLayerLock(obj);
                break;
            case 'toggle-visibility':
                toggleLayerVisibility(obj);
                break;
            case 'ungroup':
                removeLayerFromGroups(obj.layerId);
                refreshLayerPanel();
                break;
            case 'add-to-group':
                showAddToGroupMenu(obj.layerId, $('#iobp-layer-panel'));
                break;
            case 'group-selected':
                groupSelectedLayers();
                break;
            case 'move-up':
                moveLayerUp(obj);
                break;
            case 'move-down':
                moveLayerDown(obj);
                break;
            case 'move-top':
                canvas.bringToFront(obj);
                canvas.renderAll();
                refreshLayerPanel();
                break;
            case 'move-bottom':
                canvas.sendToBack(obj);
                canvas.renderAll();
                refreshLayerPanel();
                break;
        }
    }

    // ========================================
    // PHASE 5: BOOLEAN OPERATIONS
    // ========================================

    function performBooleanOperation(operation) {
        if (!canvas || selectedObjects.length < 2) {
            alert('Please select at least 2 shapes to perform boolean operations.');
            return;
        }
        
        // Check if all selected objects are shapes
        var validTypes = ['rect', 'circle', 'triangle', 'ellipse', 'polygon'];
        var allShapes = selectedObjects.every(function(obj) {
            return validTypes.includes(obj.type);
        });
        
        if (!allShapes) {
            alert('Boolean operations can only be performed on shapes.');
            return;
        }
        
        console.log('Performing boolean operation:', operation, 'on', selectedObjects.length, 'shapes');
        
        // Get the first two shapes for the operation
        var shape1 = selectedObjects[0];
        var shape2 = selectedObjects[1];
        
        // Create SVG path data for each shape
        var path1 = shapeToPathData(shape1);
        var path2 = shapeToPathData(shape2);
        
        if (!path1 || !path2) {
            alert('Unable to perform boolean operation on selected shapes.');
            return;
        }
        
        try {
            var resultPath = null;
            
            // Since we don't have a path boolean library, we'll create a simplified version
            // This is a placeholder implementation that creates a new compound path
            if (operation === 'union') {
                // Union: combine both shapes
                resultPath = createUnionPath(shape1, shape2);
            } else if (operation === 'subtract') {
                // Subtract: remove shape2 from shape1
                resultPath = createSubtractPath(shape1, shape2);
            } else if (operation === 'intersect') {
                // Intersect: keep only overlapping area
                resultPath = createIntersectPath(shape1, shape2);
            } else if (operation === 'exclude') {
                // Exclude: keep non-overlapping areas
                resultPath = createExcludePath(shape1, shape2);
            }
            
            if (resultPath) {
                // Add the result to canvas
                assignLayerId(resultPath);
                resultPath.layerName = operation.charAt(0).toUpperCase() + operation.slice(1) + ' Result';
                canvas.add(resultPath);
                
                // Optionally remove original shapes
                if (confirm('Remove original shapes after boolean operation?')) {
                    selectedObjects.forEach(function(obj) {
                        removeLayerFromGroups(obj.layerId);
                        canvas.remove(obj);
                    });
                }
                
                canvas.setActiveObject(resultPath);
                canvas.renderAll();
            }
        } catch (e) {
            console.error('Boolean operation error:', e);
            alert('Error performing boolean operation: ' + e.message);
        }
    }

    function shapeToPathData(shape) {
        // Convert shape to path data string for boolean operations
        var pathData = '';
        var matrix = shape.calcTransformMatrix();
        
        if (shape.type === 'rect') {
            var w = shape.width * shape.scaleX;
            var h = shape.height * shape.scaleY;
            pathData = 'M 0,0 L ' + w + ',0 L ' + w + ',' + h + ' L 0,' + h + ' Z';
        } else if (shape.type === 'circle') {
            var r = shape.radius * Math.max(shape.scaleX, shape.scaleY);
            // Approximate circle with path
            pathData = 'M ' + r + ',0 A ' + r + ',' + r + ' 0 1,0 ' + (-r) + ',0 A ' + r + ',' + r + ' 0 1,0 ' + r + ',0 Z';
        } else if (shape.type === 'triangle') {
            var w = shape.width * shape.scaleX;
            var h = shape.height * shape.scaleY;
            pathData = 'M ' + (w/2) + ',0 L ' + w + ',' + h + ' L 0,' + h + ' Z';
        }
        
        return pathData;
    }

    function createUnionPath(shape1, shape2) {
        // Simplified union: create a group-like compound path
        var paths = [];
        
        // Create path from shape1
        var path1SVG = shapeToPathData(shape1);
        if (path1SVG) {
            paths.push(new fabric.Path(path1SVG, {
                left: shape1.left,
                top: shape1.top,
                fill: shape1.fill,
                stroke: shape1.stroke,
                strokeWidth: shape1.strokeWidth
            }));
        }
        
        // Create path from shape2
        var path2SVG = shapeToPathData(shape2);
        if (path2SVG) {
            paths.push(new fabric.Path(path2SVG, {
                left: shape2.left,
                top: shape2.top,
                fill: shape2.fill,
                stroke: shape2.stroke,
                strokeWidth: shape2.strokeWidth
            }));
        }
        
        // Return first path with combined properties
        if (paths.length > 0) {
            var result = paths[0];
            result.fill = shape1.fill;
            result.stroke = shape1.stroke || shape2.stroke;
            result.strokeWidth = shape1.strokeWidth || shape2.strokeWidth;
            return result;
        }
        
        return null;
    }

    function createSubtractPath(shape1, shape2) {
        // Simplified subtract: return shape1 with different fill
        var path1SVG = shapeToPathData(shape1);
        if (path1SVG) {
            return new fabric.Path(path1SVG, {
                left: shape1.left,
                top: shape1.top,
                fill: shape1.fill,
                stroke: shape1.stroke,
                strokeWidth: (shape1.strokeWidth || 2) + 2,
                opacity: 0.8
            });
        }
        return null;
    }

    function createIntersectPath(shape1, shape2) {
        // Simplified intersect: create a shape in the overlap area
        var left = Math.max(shape1.left, shape2.left);
        var top = Math.max(shape1.top, shape2.top);
        var right = Math.min(shape1.left + shape1.width * shape1.scaleX, shape2.left + shape2.width * shape2.scaleX);
        var bottom = Math.min(shape1.top + shape1.height * shape1.scaleY, shape2.top + shape2.height * shape2.scaleY);
        
        var width = Math.max(0, right - left);
        var height = Math.max(0, bottom - top);
        
        if (width > 0 && height > 0) {
            return new fabric.Rect({
                left: left,
                top: top,
                width: width,
                height: height,
                fill: shape1.fill,
                stroke: shape1.stroke,
                strokeWidth: shape1.strokeWidth,
                opacity: 0.9
            });
        }
        return null;
    }

    function createExcludePath(shape1, shape2) {
        // Simplified exclude: return shape1 with modified appearance
        var path1SVG = shapeToPathData(shape1);
        if (path1SVG) {
            return new fabric.Path(path1SVG, {
                left: shape1.left,
                top: shape1.top,
                fill: 'transparent',
                stroke: shape1.fill,
                strokeWidth: (shape1.strokeWidth || 2) + 3
            });
        }
        return null;
    }

    // Boolean operation button handlers
    $('#iobp-boolean-union').on('click', function() {
        performBooleanOperation('union');
    });

    $('#iobp-boolean-subtract').on('click', function() {
        performBooleanOperation('subtract');
    });

    $('#iobp-boolean-intersect').on('click', function() {
        performBooleanOperation('intersect');
    });

    $('#iobp-boolean-exclude').on('click', function() {
        performBooleanOperation('exclude');
    });

    // ========================================
    // PHASE 5: GROUP SELECTED LAYERS
    // ========================================

    function groupSelectedLayers() {
        if (selectedObjects.length < 2) {
            alert('Please select at least 2 layers to group.');
            return;
        }
        
        var groupId = createGroup();
        
        selectedObjects.forEach(function(obj) {
            addLayerToGroup(obj.layerId, groupId);
        });
        
        canvas.discardActiveObject();
        canvas.renderAll();
    }

    // ========================================
    // PHASE 5: DUPLICATE LAYER
    // ========================================

    function duplicateLayer(obj) {
        if (!canvas || !obj) return;
        
        obj.clone(function(cloned) {
            cloned.set({
                left: obj.left + 20,
                top: obj.top + 20
            });
            
            assignLayerId(cloned);
            cloned.layerName = obj.layerName + ' Copy';
            cloned.layerOpacity = obj.layerOpacity;
            cloned.layerLocked = false;
            cloned.globalCompositeOperation = obj.globalCompositeOperation;
            
            canvas.add(cloned);
            canvas.setActiveObject(cloned);
            canvas.renderAll();
        });
    }

    // ========================================
    // PHASE 4: MULTI-SELECTION UI
    // ========================================

    function updateMultiSelectUI() {
        $('#iobp-multi-select-toolbar').show();
        $('#iobp-multi-select-count').text(selectedObjects.length + ' objects selected');
    }

    function hideMultiSelectUI() {
        $('#iobp-multi-select-toolbar').hide();
    }

    // Multi-select batch operations
    $('#iobp-batch-blend-mode').on('change', function() {
        var blendMode = $(this).val();
        if (!canvas || selectedObjects.length === 0) return;
        
        selectedObjects.forEach(function(obj) {
            obj.globalCompositeOperation = blendMode;
        });
        canvas.renderAll();
        refreshLayerPanel();
    });

    $('#iobp-batch-opacity').on('input', function() {
        var opacity = parseInt($(this).val());
        $('#iobp-batch-opacity-value').text(opacity + '%');
        
        if (!canvas || selectedObjects.length === 0) return;
        
        selectedObjects.forEach(function(obj) {
            obj.layerOpacity = opacity;
            obj.opacity = opacity / 100;
        });
        canvas.renderAll();
    });

    $('#iobp-batch-lock').on('click', function() {
        if (!canvas || selectedObjects.length === 0) return;
        
        selectedObjects.forEach(function(obj) {
            obj.layerLocked = true;
            obj.selectable = false;
            obj.evented = false;
        });
        canvas.discardActiveObject();
        canvas.renderAll();
        refreshLayerPanel();
    });

    $('#iobp-batch-unlock').on('click', function() {
        if (!canvas || selectedObjects.length === 0) return;
        
        selectedObjects.forEach(function(obj) {
            obj.layerLocked = false;
            obj.selectable = true;
            obj.evented = true;
        });
        canvas.renderAll();
        refreshLayerPanel();
    });

    $('#iobp-batch-delete').on('click', function() {
        if (!canvas || selectedObjects.length === 0) return;
        
        if (!confirm('Delete ' + selectedObjects.length + ' selected objects?')) {
            return;
        }
        
        selectedObjects.forEach(function(obj) {
            removeLayerFromGroups(obj.layerId);
            canvas.remove(obj);
        });
        
        selectedObjects = [];
        canvas.discardActiveObject();
        canvas.renderAll();
        hideMultiSelectUI();
    });

    // ========================================
    // PHASE 4: BLEND MODES & ADVANCED PROPERTIES
    // ========================================

    // Populate blend mode dropdown
    var $blendModeSelect = $('#iobp-blend-mode');
    var $batchBlendModeSelect = $('#iobp-batch-blend-mode');
    
    blendModes.forEach(function(mode) {
        $blendModeSelect.append('<option value="' + mode.value + '">' + mode.label + '</option>');
        $batchBlendModeSelect.append('<option value="' + mode.value + '">' + mode.label + '</option>');
    });

    // Apply blend mode to selected object
    $('#iobp-blend-mode').on('change', function() {
        if (!canvas) return;
        
        var obj = canvas.getActiveObject();
        if (!obj) return;
        
        var blendMode = $(this).val();
        obj.globalCompositeOperation = blendMode;
        canvas.renderAll();
    });

    // ========================================
    // PHASE 4: GRADIENT SUPPORT
    // ========================================

    $('#iobp-gradient-type').on('change', function() {
        var gradType = $(this).val();
        if (gradType === 'none') {
            $('#iobp-gradient-controls').hide();
        } else {
            $('#iobp-gradient-controls').show();
            if (gradType === 'linear') {
                $('#iobp-gradient-angle-control').show();
            } else {
                $('#iobp-gradient-angle-control').hide();
            }
        }
    });

    $('#iobp-apply-gradient').on('click', function() {
        if (!canvas) return;
        
        var obj = canvas.getActiveObject();
        if (!obj) {
            alert('Please select a shape to apply gradient.');
            return;
        }
        
        var validTypes = ['rect', 'circle', 'triangle', 'ellipse', 'polygon'];
        if (!validTypes.includes(obj.type)) {
            alert('Gradients can only be applied to shapes.');
            return;
        }
        
        var gradType = $('#iobp-gradient-type').val();
        
        if (gradType === 'none') {
            var color = $('#iobp-shape-fill').val() || '#3498db';
            obj.set('fill', color);
            canvas.renderAll();
            return;
        }
        
        var color1 = $('#iobp-gradient-color1').val() || '#ffffff';
        var color2 = $('#iobp-gradient-color2').val() || '#000000';
        var opacity1 = parseInt($('#iobp-gradient-opacity1').val()) / 100;
        var opacity2 = parseInt($('#iobp-gradient-opacity2').val()) / 100;
        
        var gradient;
        
        if (gradType === 'linear') {
            var angle = parseInt($('#iobp-gradient-angle').val()) || 0;
            var angleRad = (angle * Math.PI) / 180;
            
            var x1 = obj.width / 2 + Math.cos(angleRad) * obj.width / 2;
            var y1 = obj.height / 2 + Math.sin(angleRad) * obj.height / 2;
            var x2 = obj.width / 2 - Math.cos(angleRad) * obj.width / 2;
            var y2 = obj.height / 2 - Math.sin(angleRad) * obj.height / 2;
            
            gradient = new fabric.Gradient({
                type: 'linear',
                coords: {
                    x1: x1,
                    y1: y1,
                    x2: x2,
                    y2: y2
                },
                colorStops: [
                    { offset: 0, color: color1, opacity: opacity1 },
                    { offset: 1, color: color2, opacity: opacity2 }
                ]
            });
        } else if (gradType === 'radial') {
            gradient = new fabric.Gradient({
                type: 'radial',
                coords: {
                    x1: obj.width / 2,
                    y1: obj.height / 2,
                    x2: obj.width / 2,
                    y2: obj.height / 2,
                    r1: 0,
                    r2: Math.max(obj.width, obj.height) / 2
                },
                colorStops: [
                    { offset: 0, color: color1, opacity: opacity1 },
                    { offset: 1, color: color2, opacity: opacity2 }
                ]
            });
        }
        
        if (gradient) {
            obj.set('fill', gradient);
            canvas.renderAll();
        }
    });

    // Update angle display
    $('#iobp-gradient-angle').on('input', function() {
        $('#iobp-gradient-angle-value').text($(this).val() + '°');
    });

    // Update opacity displays
    $('#iobp-gradient-opacity1').on('input', function() {
        $('#iobp-gradient-opacity1-value').text($(this).val() + '%');
    });

    $('#iobp-gradient-opacity2').on('input', function() {
        $('#iobp-gradient-opacity2-value').text($(this).val() + '%');
    });

    $('#iobp-fill-opacity').on('input', function() {
        var opacity = parseInt($(this).val());
        $('#iobp-fill-opacity-value').text(opacity + '%');
        
        if (!canvas) return;
        var obj = canvas.getActiveObject();
        if (!obj) return;
        
        // Store fill opacity separately
        obj.fillOpacity = opacity / 100;
        
        // If fill is a solid color, apply opacity
        if (typeof obj.fill === 'string') {
            obj.set('opacity', opacity / 100);
        }
        
        canvas.renderAll();
    });

    $('#iobp-stroke-opacity').on('input', function() {
        var opacity = parseInt($(this).val());
        $('#iobp-stroke-opacity-value').text(opacity + '%');
        
        if (!canvas) return;
        var obj = canvas.getActiveObject();
        if (!obj) return;
        
        obj.strokeOpacity = opacity / 100;
        canvas.renderAll();
    });

    // ========================================
    // EYEDROPPER TOOL
    // ========================================

    function getColorAtPoint(x, y) {
        var canvasEl = document.getElementById('iobp-overlay-canvas');
        var ctx = canvasEl.getContext('2d');
        
        try {
            var pixelData = ctx.getImageData(x, y, 1, 1).data;
            var r = pixelData[0];
            var g = pixelData[1];
            var b = pixelData[2];
            
            return rgbToHex(r, g, b);
        } catch (e) {
            console.error('Error getting color:', e);
            return null;
        }
    }

    function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(function(x) {
            var hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    function activateEyedropper() {
        eyedropperActive = true;
        $('#iobp-eyedropper-btn').addClass('active');
        canvas.defaultCursor = 'crosshair';
        canvas.selection = false;
        canvas.discardActiveObject();
        canvas.renderAll();
        $('#iobp-overlay-canvas').addClass('iobp-eyedropper-active');
    }

    function deactivateEyedropper() {
        eyedropperActive = false;
        $('#iobp-eyedropper-btn').removeClass('active');
        canvas.defaultCursor = 'default';
        canvas.selection = true;
        canvas.renderAll();
        $('#iobp-overlay-canvas').removeClass('iobp-eyedropper-active');
    }

    $('#iobp-eyedropper-btn').on('click', function() {
        if (eyedropperActive) {
            deactivateEyedropper();
        } else {
            activateEyedropper();
        }
    });

    // ========================================
    // NO FILL / NO STROKE CHECKBOX HANDLERS
    // ========================================

    $('#iobp-shape-no-fill').on('change', function() {
        var noFill = $(this).is(':checked');
        $('#iobp-shape-fill').prop('disabled', noFill);
        if (noFill) {
            $('#iobp-shape-fill').css('opacity', '0.5');
        } else {
            $('#iobp-shape-fill').css('opacity', '1');
        }
    });

    $('#iobp-shape-no-stroke').on('change', function() {
        var noStroke = $(this).is(':checked');
        $('#iobp-shape-stroke').prop('disabled', noStroke);
        $('#iobp-shape-stroke-width').prop('disabled', noStroke);
        if (noStroke) {
            $('#iobp-shape-stroke').css('opacity', '0.5');
            $('#iobp-shape-stroke-width').css('opacity', '0.5');
        } else {
            $('#iobp-shape-stroke').css('opacity', '1');
            $('#iobp-shape-stroke-width').css('opacity', '1');
        }
    });

    // ========================================
    // SHAPE TOOL HANDLERS (INSTANT CREATION)
    // ========================================

    function bindShapeToolHandlers() {
        console.log('Binding shape tool handlers (Phase 5)...');

        $('.iobp-shape-btn').off('click');

        $('.iobp-shape-btn').on('click', function() {
            console.log('Shape button clicked!');
            
            if (!canvas) {
                console.error('Canvas is not initialized!');
                alert('Error: Canvas not ready. Please refresh the page.');
                return;
            }
            
            var shapeType = $(this).data('shape');
            console.log('Creating shape:', shapeType);
            
            var noFill = $('#iobp-shape-no-fill').is(':checked');
            var noStroke = $('#iobp-shape-no-stroke').is(':checked');
            
            var fillColor = noFill ? 'transparent' : ($('#iobp-shape-fill').val() || '#3498db');
            var strokeColor = $('#iobp-shape-stroke').val() || '#2c3e50';
            var strokeWidth = noStroke ? 0 : (parseInt($('#iobp-shape-stroke-width').val(), 10) || 2);
            
            console.log('Colors - Fill:', fillColor, 'Stroke:', strokeColor, 'Width:', strokeWidth);
            
            var shape = null;
            var centerX = canvas.width / 2;
            var centerY = canvas.height / 2;
            
            try {
                if (shapeType === 'rectangle') {
                    shape = new fabric.Rect({
                        left: centerX - 75,
                        top: centerY - 50,
                        width: 150,
                        height: 100,
                        fill: fillColor,
                        stroke: strokeColor,
                        strokeWidth: strokeWidth
                    });
                } else if (shapeType === 'circle') {
                    shape = new fabric.Circle({
                        left: centerX - 60,
                        top: centerY - 60,
                        radius: 60,
                        fill: fillColor,
                        stroke: strokeColor,
                        strokeWidth: strokeWidth
                    });
                } else if (shapeType === 'triangle') {
                    shape = new fabric.Triangle({
                        left: centerX - 60,
                        top: centerY - 50,
                        width: 120,
                        height: 100,
                        fill: fillColor,
                        stroke: strokeColor,
                        strokeWidth: strokeWidth
                    });
                } else if (shapeType === 'line') {
                    shape = new fabric.Line([centerX - 75, centerY, centerX + 75, centerY], {
                        stroke: strokeColor,
                        strokeWidth: strokeWidth,
                        fill: ''
                    });
                }
                
                if (shape) {
                    console.log('Shape created:', shape);
                    assignLayerId(shape);
                    canvas.add(shape);
                    canvas.setActiveObject(shape);
                    canvas.renderAll();
                    console.log('Shape added to canvas successfully!');
                } else {
                    console.error('Failed to create shape object');
                }
            } catch (e) {
                console.error('Error creating shape:', e);
                alert('Error creating shape: ' + e.message);
            }
        });
        
        console.log('Shape tool handlers bound. Button count:', $('.iobp-shape-btn').length);
    }

    $('#iobp-apply-shape-style').on('click', function() {
        if (!canvas) return;
        
        var obj = canvas.getActiveObject();
        if (!obj) return;
        
        var validTypes = ['rect', 'circle', 'triangle', 'line'];
        if (!validTypes.includes(obj.type)) {
            alert('Please select a shape to apply style.');
            return;
        }
        
        var noFill = $('#iobp-shape-no-fill').is(':checked');
        var noStroke = $('#iobp-shape-no-stroke').is(':checked');
        
        var fillColor = noFill ? 'transparent' : $('#iobp-shape-fill').val();
        var strokeColor = $('#iobp-shape-stroke').val();
        var strokeWidth = noStroke ? 0 : (parseInt($('#iobp-shape-stroke-width').val(), 10) || 2);
        
        var updates = {
            stroke: strokeColor,
            strokeWidth: strokeWidth
        };
        
        if (obj.type !== 'line') {
            updates.fill = fillColor;
        }
        
        obj.set(updates);
        canvas.renderAll();
    });

    function loadFonts() {
        $.post(iobpOverlayEdit.ajaxUrl, {
            action: 'iobp_get_fonts',
            nonce: iobpOverlayEdit.nonce
        }).done(function(response) {
            if (response.success) {
                updateFontList(response.data);
                updateFontDropdown(response.data);
                response.data.forEach(function(font) {
                    loadFontIntoPage(font.filename, font.url);
                });
            }
        }).fail(function() {
            $('#iobp-font-list').html('<p style="color:red;">Error loading fonts.</p>');
        });
    }

    function loadFontIntoPage(filename, url) {
        var fontName = filename.replace(/\.(ttf|otf|woff|woff2)$/i, '');
        
        if (loadedFonts[fontName]) {
            return;
        }

        var format = 'truetype';
        var ext = filename.split('.').pop().toLowerCase();
        if (ext === 'woff') format = 'woff';
        if (ext === 'woff2') format = 'woff2';
        if (ext === 'otf') format = 'opentype';

        var style = document.createElement('style');
        style.innerHTML = '@font-face { font-family: "' + fontName + '"; src: url("' + url + '") format("' + format + '"); }';
        document.head.appendChild(style);
        
        loadedFonts[fontName] = true;
    }

    function updateFontList(fonts) {
        var $list = $('#iobp-font-list');
        $list.empty();
        
        if (fonts.length === 0) {
            $list.html('<p>No fonts uploaded yet.</p>');
            return;
        }

        fonts.forEach(function(font) {
            var $item = $('<div class="iobp-font-item"></div>');
            $item.append('<span class="iobp-font-name">' + font.filename + '</span>');
            var $deleteBtn = $('<button class="button iobp-delete-font">Delete</button>');
            $deleteBtn.data('filename', font.filename);
            $item.append($deleteBtn);
            $list.append($item);
        });
    }

    function updateFontDropdown(fonts) {
        var $dropdown = $('#iobp-font-family');
        var currentValue = $dropdown.val();
        
        $dropdown.find('option:not(:first)').remove();
        
        fonts.forEach(function(font) {
            var fontName = font.filename.replace(/\.(ttf|otf|woff|woff2)$/i, '');
            $dropdown.append('<option value="' + fontName + '">' + fontName + '</option>');
        });
        
        if (currentValue) {
            $dropdown.val(currentValue);
        }
    }

    $('#iobp-upload-font-btn').on('click', function() {
        var fileInput = $('#iobp-font-upload')[0];
        if (!fileInput.files || !fileInput.files[0]) {
            alert('Please select a font file first.');
            return;
        }

        var formData = new FormData();
        formData.append('action', 'iobp_upload_font');
        formData.append('nonce', iobpOverlayEdit.nonce);
        formData.append('font', fileInput.files[0]);

        $('#iobp-font-upload-status').text('Uploading...');

        $.ajax({
            url: iobpOverlayEdit.ajaxUrl,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false
        }).done(function(response) {
            if (response.success) {
                $('#iobp-font-upload-status').text('Uploaded successfully!');
                fileInput.value = '';
                loadFonts();
                setTimeout(function() {
                    $('#iobp-font-upload-status').text('');
                }, 3000);
            } else {
                $('#iobp-font-upload-status').text('Error: ' + response.data);
            }
        }).fail(function() {
            $('#iobp-font-upload-status').text('Upload failed');
        });
    });

    $(document).on('click', '.iobp-delete-font', function() {
        var filename = $(this).data('filename');
        
        if (!confirm('Delete font "' + filename + '"?')) {
            return;
        }

        $.post(iobpOverlayEdit.ajaxUrl, {
            action: 'iobp_delete_font',
            nonce: iobpOverlayEdit.nonce,
            filename: filename
        }).done(function(response) {
            if (response.success) {
                loadFonts();
            } else {
                alert('Delete failed: ' + response.data);
            }
        });
    });

    loadFonts();

    $('#iobp-editor-canvas-size').on('change', function() {
        var newSize = $(this).val();
        
        if (canvas && canvas.getObjects().length > 0) {
            if (!confirm('Changing canvas size will clear all work. Continue?')) {
                $(this).val(selectedCanvasSize);
                return;
            }
        }
        
        selectedCanvasSize = newSize;
        initCanvas(selectedCanvasSize);
        layerGroups = {};
        refreshLayerPanel();
    });

    function clearAll() {
        if (!canvas) return;
        
        var objects = canvas.getObjects().slice();
        objects.forEach(function(o) {
            canvas.remove(o);
        });
        canvas.discardActiveObject();
        canvas.renderAll();
        layerGroups = {};
        refreshLayerPanel();
    }

    $('#iobp-start-blank').on('click', function() {
        clearAll();
    });

    function assignLayerId(obj) {
        if (!obj.layerId) {
            obj.layerId = ++layerIdCounter;
        }
        if (!obj.layerName) {
            obj.layerName = getDefaultLayerName(obj);
        }
        if (obj.layerOpacity === undefined) {
            obj.layerOpacity = 100;
        }
        if (obj.layerLocked === undefined) {
            obj.layerLocked = false;
        }
        // Phase 4: Initialize blend mode
        if (!obj.globalCompositeOperation) {
            obj.globalCompositeOperation = 'source-over';
        }
        return obj;
    }

    function getDefaultLayerName(obj) {
        if (obj.type === 'textbox') {
            return 'Text ' + (obj.text.substring(0, 15) || 'Layer');
        } else if (obj.type === 'image') {
            return 'Image ' + obj.layerId;
        } else if (obj.type === 'rect') {
            return 'Rectangle ' + obj.layerId;
        } else if (obj.type === 'circle') {
            return 'Circle ' + obj.layerId;
        } else if (obj.type === 'triangle') {
            return 'Triangle ' + obj.layerId;
        } else if (obj.type === 'line') {
            return 'Line ' + obj.layerId;
        } else if (obj.type === 'path') {
            return 'Path ' + obj.layerId;
        } else {
            return 'Layer ' + obj.layerId;
        }
    }

    $('#iobp-add-text').on('click', function() {
        if (!canvas) return;
        
        var content = $('#iobp-text-input').val() || 'Text';
        var fontSize = parseInt($('#iobp-font-size').val(), 10) || 32;
        var color = $('#iobp-font-color').val() || '#000000';
        var fontFamily = $('#iobp-font-family').val() || '';

        var textOptions = {
            left: 100,
            top: 100,
            fill: color,
            fontSize: fontSize,
            editable: true
        };

        if (fontFamily) {
            textOptions.fontFamily = fontFamily;
        }

        var text = new fabric.Textbox(content, textOptions);
        assignLayerId(text);

        canvas.add(text).setActiveObject(text);
        canvas.renderAll();
    });

    $('#iobp-apply-text-style').on('click', function() {
        if (!canvas) return;
        
        var obj = canvas.getActiveObject();
        if (!obj || obj.type !== 'textbox') {
            return;
        }
        var fontSize = parseInt($('#iobp-font-size').val(), 10) || obj.fontSize;
        var color = $('#iobp-font-color').val() || obj.fill;
        var fontFamily = $('#iobp-font-family').val();

        var updates = {
            fontSize: fontSize,
            fill: color
        };

        if (fontFamily) {
            updates.fontFamily = fontFamily;
        }

        obj.set(updates);
        canvas.renderAll();
    });

    var selectedLogoFile = null;

    $('#iobp-logo-upload').on('change', function(e) {
        selectedLogoFile = e.target.files[0] || null;
    });

    $('#iobp-add-logo').on('click', function() {
        if (!canvas) return;
        
        if (!selectedLogoFile) {
            alert('Please choose a logo file first.');
            return;
        }

        var reader = new FileReader();
        reader.onload = function(ev) {
            fabric.Image.fromURL(ev.target.result, function(img) {
                var scale = Math.min(200 / img.width, 200 / img.height, 1);
                img.set({
                    left: 200,
                    top: 150,
                    hasBorders: true,
                    hasControls: true
                });
                img.scale(scale);
                assignLayerId(img);
                canvas.add(img).setActiveObject(img);
                canvas.renderAll();
            });
        };
        reader.readAsDataURL(selectedLogoFile);
    });

    var file_frame = null;

    $('#iobp-load-from-library').on('click', function(e) {
        e.preventDefault();

        if (file_frame) {
            file_frame.open();
            return;
        }

        file_frame = wp.media({
            title: 'Select base image',
            button: { text: 'Use this image' },
            multiple: false
        });

        file_frame.on('select', function() {
            var attachment = file_frame.state().get('selection').first().toJSON();
            loadBaseImage(attachment.url);
        });

        file_frame.open();
    });

    function loadBaseImage(url) {
        if (!canvas) return;
        
        var config = canvasConfig[selectedCanvasSize];
        
        fabric.Image.fromURL(url, function(img) {
            clearAll();

            var maxW = config.canvas_width;
            var maxH = config.canvas_height;
            var scale = Math.min(maxW / img.width, maxH / img.height);

            img.set({
                left: (config.canvas_width - img.width * scale) / 2,
                top: (config.canvas_height - img.height * scale) / 2,
                selectable: false,
                evented: false
            });
            img.scale(scale);
            assignLayerId(img);
            img.layerName = 'Background';

            canvas.add(img);
            canvas.sendToBack(img);
            canvas.renderAll();
        });
    }

    $('#iobp-delete-selected').on('click', function() {
        if (!canvas) return;
        
        var obj = canvas.getActiveObject();
        if (!obj) return;
        canvas.remove(obj);
        canvas.discardActiveObject();
        canvas.renderAll();
    });

    $('#iobp-clear-all').on('click', function() {
        clearAll();
    });

    $('#iobp-save-overlay').on('click', function() {
        if (!canvas) return;
        
        var filename = $('#iobp-overlay-filename').val().trim();
        if (!filename) {
            alert('Please enter a filename, e.g. my-overlay.png');
            return;
        }

        if (!filename.match(/\.png$/i)) {
            filename += '.png';
        }

        $('#iobp-save-status').text('Saving...');

        var dataURL = canvas.toDataURL({
            format: 'png',
            quality: 1.0
        });

        $.post(iobpOverlayEdit.ajaxUrl, {
            action: 'iobp_save_overlay_from_canvas',
            nonce: iobpOverlayEdit.nonce,
            filename: filename,
            image_data: dataURL,
            canvas_size: selectedCanvasSize
        }).done(function(response) {
            if (response.success) {
                $('#iobp-save-status').text('Saved: ' + response.data.url);
            } else {
                $('#iobp-save-status').text('Error: ' + response.data);
            }
        }).fail(function() {
            $('#iobp-save-status').text('Error saving overlay');
        });
    });

    // ========================================
    // PHASE 5: ENHANCED GROUP MANAGEMENT WITH NESTING
    // ========================================

    function createGroup(parentGroupId) {
        var groupId = ++groupIdCounter;
        var groupName = 'Group ' + groupId;
        
        layerGroups[groupId] = {
            id: groupId,
            name: groupName,
            children: [],
            groups: [], // Support nested groups
            collapsed: false,
            visible: true,
            locked: false,
            parentGroup: parentGroupId || null
        };
        
        // If parent group specified, add this group as child
        if (parentGroupId && layerGroups[parentGroupId]) {
            layerGroups[parentGroupId].groups.push(groupId);
        }
        
        refreshLayerPanel();
        return groupId;
    }

    function addLayerToGroup(layerId, groupId) {
        if (!layerGroups[groupId]) return;
        
        removeLayerFromGroups(layerId);
        
        if (!layerGroups[groupId].children.includes(layerId)) {
            layerGroups[groupId].children.push(layerId);
        }
        
        var obj = findObjectByLayerId(layerId);
        if (obj) {
            applyGroupStateToLayer(obj, groupId);
        }
        
        refreshLayerPanel();
    }

    function removeLayerFromGroups(layerId) {
        Object.keys(layerGroups).forEach(function(groupId) {
            var idx = layerGroups[groupId].children.indexOf(layerId);
            if (idx > -1) {
                layerGroups[groupId].children.splice(idx, 1);
            }
        });
    }

    function deleteGroup(groupId) {
        if (!layerGroups[groupId]) return;
        
        if (!confirm('Delete group "' + layerGroups[groupId].name + '"? Layers and nested groups will be ungrouped.')) {
            return;
        }
        
        // Remove from parent group if exists
        var parentId = layerGroups[groupId].parentGroup;
        if (parentId && layerGroups[parentId]) {
            var idx = layerGroups[parentId].groups.indexOf(groupId);
            if (idx > -1) {
                layerGroups[parentId].groups.splice(idx, 1);
            }
        }
        
        delete layerGroups[groupId];
        refreshLayerPanel();
    }

    function toggleGroupCollapse(groupId) {
        if (!layerGroups[groupId]) return;
        
        layerGroups[groupId].collapsed = !layerGroups[groupId].collapsed;
        refreshLayerPanel();
    }

    function toggleGroupVisibility(groupId) {
        if (!layerGroups[groupId]) return;
        
        layerGroups[groupId].visible = !layerGroups[groupId].visible;
        
        // Apply to all children layers
        layerGroups[groupId].children.forEach(function(layerId) {
            var obj = findObjectByLayerId(layerId);
            if (obj) {
                obj.visible = layerGroups[groupId].visible;
            }
        });
        
        // Apply to nested groups recursively
        layerGroups[groupId].groups.forEach(function(childGroupId) {
            if (layerGroups[childGroupId]) {
                layerGroups[childGroupId].visible = layerGroups[groupId].visible;
                toggleGroupVisibility(childGroupId);
            }
        });
        
        canvas.renderAll();
        refreshLayerPanel();
    }

    function toggleGroupLock(groupId) {
        if (!layerGroups[groupId]) return;
        
        layerGroups[groupId].locked = !layerGroups[groupId].locked;
        
        // Apply to all children layers
        layerGroups[groupId].children.forEach(function(layerId) {
            var obj = findObjectByLayerId(layerId);
            if (obj) {
                obj.layerLocked = layerGroups[groupId].locked;
                obj.selectable = !layerGroups[groupId].locked;
                obj.evented = !layerGroups[groupId].locked;
            }
        });
        
        // Apply to nested groups recursively
        layerGroups[groupId].groups.forEach(function(childGroupId) {
            if (layerGroups[childGroupId]) {
                layerGroups[childGroupId].locked = layerGroups[groupId].locked;
                toggleGroupLock(childGroupId);
            }
        });
        
        canvas.renderAll();
        refreshLayerPanel();
    }

    function applyGroupStateToLayer(obj, groupId) {
        if (!layerGroups[groupId]) return;
        
        var group = layerGroups[groupId];
        obj.visible = group.visible;
        obj.layerLocked = group.locked;
        obj.selectable = !group.locked;
        obj.evented = !group.locked;
    }

    function renameGroup(groupId) {
        if (!layerGroups[groupId]) return;
        
        var newName = prompt('Enter new group name:', layerGroups[groupId].name);
        if (newName && newName.trim()) {
            layerGroups[groupId].name = newName.trim();
            refreshLayerPanel();
        }
    }

    function getLayerGroupId(layerId) {
        for (var groupId in layerGroups) {
            if (layerGroups[groupId].children.includes(layerId)) {
                return parseInt(groupId);
            }
        }
        return null;
    }

    function findObjectByLayerId(layerId) {
        if (!canvas) return null;
        var objects = canvas.getObjects();
        return objects.find(function(o) { return o.layerId === layerId; });
    }

    // ========================================
    // LAYER PANEL FUNCTIONALITY
    // ========================================

    function refreshLayerPanel() {
        if (!canvas) return;

        var $layerList = $('#iobp-layer-list');
        $layerList.empty();

        var objects = canvas.getObjects();
        
        if (objects.length === 0 && Object.keys(layerGroups).length === 0) {
            $layerList.html('<div class="iobp-layer-empty">No layers yet. Add text, images, or shapes to get started.</div>');
            return;
        }

        var $createGroupBtn = $('<button class="iobp-create-group-btn">+ Create Group</button>');
        $createGroupBtn.on('click', function() {
            createGroup();
        });
        $layerList.append($createGroupBtn);

        var ungroupedLayers = [];
        var reversedObjects = objects.slice().reverse();
        
        reversedObjects.forEach(function(obj) {
            assignLayerId(obj);
            if (!getLayerGroupId(obj.layerId)) {
                ungroupedLayers.push(obj);
            }
        });

        // Render top-level groups only
        Object.keys(layerGroups)
            .filter(function(groupId) {
                return !layerGroups[groupId].parentGroup;
            })
            .sort(function(a, b) { return parseInt(b) - parseInt(a); })
            .forEach(function(groupId) {
                var group = layerGroups[groupId];
                var $groupItem = createGroupItem(group);
                $layerList.append($groupItem);
            });

        ungroupedLayers.forEach(function(obj) {
            var $layerItem = createLayerItem(obj);
            $layerList.append($layerItem);
        });

        var activeObj = canvas.getActiveObject();
        if (activeObj) {
            updateLayerPanelSelection(activeObj);
        }
    }

    function createGroupItem(group, depth) {
        depth = depth || 0;
        var indent = depth * 20;
        
        var $groupContainer = $('<div class="iobp-group-container"></div>');
        $groupContainer.attr('data-group-id', group.id);
        $groupContainer.css('margin-left', indent + 'px');
        
        var $groupHeader = $('<div class="iobp-group-header"></div>');
        
        var collapseIcon = group.collapsed ? '▶' : '▼';
        var $collapseBtn = $('<button class="iobp-layer-btn" title="' + (group.collapsed ? 'Expand' : 'Collapse') + '">' + collapseIcon + '</button>');
        $collapseBtn.on('click', function(e) {
            e.stopPropagation();
            toggleGroupCollapse(group.id);
        });
        
        var $groupName = $('<div class="iobp-group-name">📁 ' + escapeHtml(group.name) + '</div>');
        
        var $groupControls = $('<div class="iobp-layer-controls"></div>');
        
        var visIcon = group.visible ? '👁️' : '👁️‍🗨️';
        var $visBtn = $('<button class="iobp-layer-btn" title="' + (group.visible ? 'Visible' : 'Hidden') + '">' + visIcon + '</button>');
        $visBtn.on('click', function(e) {
            e.stopPropagation();
            toggleGroupVisibility(group.id);
        });
        
        var lockIcon = group.locked ? '🔒' : '🔓';
        var $lockBtn = $('<button class="iobp-layer-btn" title="' + (group.locked ? 'Locked' : 'Unlocked') + '">' + lockIcon + '</button>');
        $lockBtn.on('click', function(e) {
            e.stopPropagation();
            toggleGroupLock(group.id);
        });
        
        var $delBtn = $('<button class="iobp-layer-btn iobp-layer-btn-danger" title="Delete Group">🗑️</button>');
        $delBtn.on('click', function(e) {
            e.stopPropagation();
            deleteGroup(group.id);
        });
        
        $groupControls.append($visBtn).append($lockBtn).append($delBtn);
        
        $groupHeader.append($collapseBtn).append($groupName).append($groupControls);
        $groupContainer.append($groupHeader);
        
        var $renameBtn = $('<button class="iobp-group-action-btn">Rename</button>');
        $renameBtn.on('click', function(e) {
            e.stopPropagation();
            renameGroup(group.id);
        });
        
        var $nestGroupBtn = $('<button class="iobp-group-action-btn">+ Nest Group</button>');
        $nestGroupBtn.on('click', function(e) {
            e.stopPropagation();
            createGroup(group.id);
        });
        
        $groupHeader.append($renameBtn).append($nestGroupBtn);
        
        // Context menu on right-click
        $groupHeader.on('contextmenu', function(e) {
            e.preventDefault();
            // Show group context menu (simplified for now)
            return false;
        });
        
        if (!group.collapsed) {
            var $childrenContainer = $('<div class="iobp-group-children"></div>');
            
            // Render nested groups
            if (group.groups && group.groups.length > 0) {
                group.groups.forEach(function(childGroupId) {
                    if (layerGroups[childGroupId]) {
                        var $nestedGroup = createGroupItem(layerGroups[childGroupId], depth + 1);
                        $childrenContainer.append($nestedGroup);
                    }
                });
            }
            
            // Render child layers
            group.children.forEach(function(layerId) {
                var obj = findObjectByLayerId(layerId);
                if (obj) {
                    var $layerItem = createLayerItem(obj, group.id, depth + 1);
                    $childrenContainer.append($layerItem);
                }
            });
            
            $groupContainer.append($childrenContainer);
        }
        
        return $groupContainer;
    }

    function createLayerItem(obj, groupId, depth) {
        depth = depth || 0;
        var indent = depth * 20;
        
        var isVisible = obj.visible !== false;
        var isLocked = obj.layerLocked === true;
        var layerType = obj.type === 'textbox' ? 'Text' : 
                        obj.type === 'image' ? 'Image' : 
                        obj.type === 'rect' ? 'Rectangle' :
                        obj.type === 'circle' ? 'Circle' :
                        obj.type === 'triangle' ? 'Triangle' :
                        obj.type === 'line' ? 'Line' :
                        obj.type === 'path' ? 'Path' : 'Object';
        var opacity = obj.layerOpacity !== undefined ? obj.layerOpacity : 100;
        
        var $item = $('<div class="iobp-layer-item"></div>');
        $item.attr('data-layer-id', obj.layerId);
        $item.attr('draggable', 'true');
        $item.css('margin-left', indent + 'px');
        
        if (!isVisible) {
            $item.addClass('iobp-layer-hidden');
        }
        
        if (isLocked) {
            $item.addClass('iobp-layer-locked-item');
        }

        var $header = $('<div class="iobp-layer-header"></div>');
        
        var $info = $('<div style="flex: 1;"></div>');
        var $name = $('<div class="iobp-layer-name">' + escapeHtml(obj.layerName) + '</div>');
        var $type = $('<div class="iobp-layer-type">' + layerType + '</div>');
        $info.append($name).append($type);
        
        var $controls = $('<div class="iobp-layer-controls"></div>');
        
        var lockIcon = isLocked ? '🔒' : '🔓';
        var $lockBtn = $('<button class="iobp-layer-btn" title="' + (isLocked ? 'Locked' : 'Unlocked') + '">' + lockIcon + '</button>');
        $lockBtn.on('click', function(e) {
            e.stopPropagation();
            toggleLayerLock(obj);
        });
        
        var visIcon = isVisible ? '👁️' : '👁️‍🗨️';
        var $visBtn = $('<button class="iobp-layer-btn" title="' + (isVisible ? 'Visible' : 'Hidden') + '">' + visIcon + '</button>');
        $visBtn.on('click', function(e) {
            e.stopPropagation();
            toggleLayerVisibility(obj);
        });
        
        var $delBtn = $('<button class="iobp-layer-btn iobp-layer-btn-danger" title="Delete">🗑️</button>');
        $delBtn.on('click', function(e) {
            e.stopPropagation();
            deleteLayer(obj);
        });
        
        $controls.append($lockBtn).append($visBtn).append($delBtn);
        $header.append($info).append($controls);
        
        var $opacityControl = $('<div class="iobp-layer-opacity-control"></div>');
        var $opacityLabel = $('<label class="iobp-opacity-label">Opacity: <span>' + opacity + '%</span></label>');
        var $opacitySlider = $('<input type="range" min="0" max="100" value="' + opacity + '" class="iobp-opacity-slider" />');
        
        $opacitySlider.on('input', function() {
            var newOpacity = parseInt($(this).val());
            $opacityLabel.find('span').text(newOpacity + '%');
            obj.layerOpacity = newOpacity;
            obj.opacity = newOpacity / 100;
            canvas.renderAll();
        });
        
        $opacityControl.append($opacityLabel).append($opacitySlider);
        
        var $actions = $('<div class="iobp-layer-actions"></div>');
        
        var $renameBtn = $('<button class="iobp-layer-action-btn">Rename</button>');
        $renameBtn.on('click', function(e) {
            e.stopPropagation();
            renameLayer(obj, $name);
        });
        
        var $moveUpBtn = $('<button class="iobp-layer-action-btn">↑ Up</button>');
        $moveUpBtn.on('click', function(e) {
            e.stopPropagation();
            moveLayerUp(obj);
        });
        
        var $moveDownBtn = $('<button class="iobp-layer-action-btn">↓ Down</button>');
        $moveDownBtn.on('click', function(e) {
            e.stopPropagation();
            moveLayerDown(obj);
        });
        
        if (groupId !== undefined) {
            var $removeFromGroupBtn = $('<button class="iobp-layer-action-btn">⬅ Ungroup</button>');
            $removeFromGroupBtn.on('click', function(e) {
                e.stopPropagation();
                removeLayerFromGroups(obj.layerId);
                refreshLayerPanel();
            });
            $actions.append($removeFromGroupBtn);
        } else {
            if (Object.keys(layerGroups).length > 0) {
                var $addToGroupBtn = $('<button class="iobp-layer-action-btn">➡ Add to Group</button>');
                $addToGroupBtn.on('click', function(e) {
                    e.stopPropagation();
                    showAddToGroupMenu(obj.layerId, $(this));
                });
                $actions.append($addToGroupBtn);
            }
        }
        
        $actions.append($renameBtn).append($moveUpBtn).append($moveDownBtn);
        
        $item.append($header).append($opacityControl).append($actions);
        
        // Click to select
        $item.on('click', function() {
            selectLayerFromPanel(obj);
        });
        
        // Right-click for context menu
        $item.on('contextmenu', function(e) {
            e.preventDefault();
            selectLayerFromPanel(obj);
            showContextMenu(e.pageX, e.pageY, obj);
            return false;
        });

        // Drag and drop
        $item.on('dragstart', function(e) {
            e.originalEvent.dataTransfer.effectAllowed = 'move';
            e.originalEvent.dataTransfer.setData('layerId', obj.layerId);
            $(this).addClass('iobp-layer-dragging');
        });

        $item.on('dragend', function(e) {
            $(this).removeClass('iobp-layer-dragging');
            $('.iobp-layer-drag-over').removeClass('iobp-layer-drag-over');
        });

        $item.on('dragover', function(e) {
            e.preventDefault();
            e.originalEvent.dataTransfer.dropEffect = 'move';
            $(this).addClass('iobp-layer-drag-over');
        });

        $item.on('dragleave', function(e) {
            $(this).removeClass('iobp-layer-drag-over');
        });

        $item.on('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).removeClass('iobp-layer-drag-over');
            
            var draggedLayerId = parseInt(e.originalEvent.dataTransfer.getData('layerId'));
            var targetLayerId = obj.layerId;
            
            if (draggedLayerId !== targetLayerId) {
                reorderLayers(draggedLayerId, targetLayerId);
            }
        });
        
        return $item;
    }

    function showAddToGroupMenu(layerId, $button) {
        $('.iobp-group-menu').remove();
        
        var $menu = $('<div class="iobp-group-menu"></div>');
        
        Object.keys(layerGroups).forEach(function(groupId) {
            var group = layerGroups[groupId];
            var $option = $('<div class="iobp-group-menu-item">' + escapeHtml(group.name) + '</div>');
            $option.on('click', function() {
                addLayerToGroup(layerId, parseInt(groupId));
                $menu.remove();
            });
            $menu.append($option);
        });
        
        var offset = $button.offset();
        $menu.css({
            position: 'absolute',
            top: offset.top + $button.outerHeight(),
            left: offset.left
        });
        
        $('body').append($menu);
        
        setTimeout(function() {
            $(document).one('click', function() {
                $menu.remove();
            });
        }, 100);
    }

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function selectLayerFromPanel(obj) {
        if (!canvas) return;
        
        if (obj.layerLocked) {
            return;
        }
        
        isUpdatingSelection = true;
        canvas.setActiveObject(obj);
        canvas.renderAll();
        isUpdatingSelection = false;
        
        updateLayerPanelSelection(obj);
    }

    function updateLayerPanelSelection(obj) {
        $('.iobp-layer-item').removeClass('iobp-layer-selected');
        if (obj && obj.layerId) {
            $('.iobp-layer-item[data-layer-id="' + obj.layerId + '"]').addClass('iobp-layer-selected');
        }
    }

    function clearLayerPanelSelection() {
        $('.iobp-layer-item').removeClass('iobp-layer-selected');
    }

    function toggleLayerVisibility(obj) {
        if (!canvas) return;
        
        obj.visible = !obj.visible;
        canvas.renderAll();
        refreshLayerPanel();
    }

    function toggleLayerLock(obj) {
        if (!canvas) return;
        
        obj.layerLocked = !obj.layerLocked;
        obj.selectable = !obj.layerLocked;
        obj.evented = !obj.layerLocked;
        
        if (obj.layerLocked) {
            canvas.discardActiveObject();
        }
        
        canvas.renderAll();
        refreshLayerPanel();
    }

    function deleteLayer(obj) {
        if (!canvas) return;
        
        if (!confirm('Delete this layer?')) {
            return;
        }
        
        removeLayerFromGroups(obj.layerId);
        
        canvas.remove(obj);
        canvas.renderAll();
    }

    function renameLayer(obj, $nameElement) {
        var currentName = obj.layerName;
        
        var $input = $('<input type="text" class="iobp-layer-name-input" />');
        $input.val(currentName);
        
        $nameElement.html('').append($input);
        $input.focus().select();
        
        function saveName() {
            var newName = $input.val().trim();
            if (newName && newName !== currentName) {
                obj.layerName = newName;
            }
            refreshLayerPanel();
        }
        
        $input.on('blur', saveName);
        $input.on('keypress', function(e) {
            if (e.which === 13) {
                saveName();
            }
        });
    }

    function moveLayerUp(obj) {
        if (!canvas) return;
        
        canvas.bringForward(obj);
        canvas.renderAll();
        refreshLayerPanel();
    }

    function moveLayerDown(obj) {
        if (!canvas) return;
        
        canvas.sendBackwards(obj);
        canvas.renderAll();
        refreshLayerPanel();
    }

    function reorderLayers(draggedLayerId, targetLayerId) {
        if (!canvas) return;
        
        var objects = canvas.getObjects();
        var draggedObj = objects.find(function(o) { return o.layerId === draggedLayerId; });
        var targetObj = objects.find(function(o) { return o.layerId === targetLayerId; });
        
        if (!draggedObj || !targetObj) return;
        
        var draggedIndex = objects.indexOf(draggedObj);
        var targetIndex = objects.indexOf(targetObj);
        
        draggedObj.moveTo(targetIndex);
        
        canvas.renderAll();
        refreshLayerPanel();
    }

    // ========================================
    // PHASE 6: SNAPPING AND MAGNETIC GUIDES
    // ========================================

    function snapObject(target) {
        if (!snappingEnabled || !target) return;

        var objBounds = target.getBoundingRect();
        var objLeft = objBounds.left;
        var objTop = objBounds.top;
        var objRight = objLeft + objBounds.width;
        var objBottom = objTop + objBounds.height;
        var objCenterX = objLeft + objBounds.width / 2;
        var objCenterY = objTop + objBounds.height / 2;

        var canvasWidth = canvas.getWidth();
        var canvasHeight = canvas.getHeight();

        verticalLines = [];
        horizontalLines = [];

        // Snap to canvas edges
        if (Math.abs(objLeft) < snapTolerance) {
            target.set({ left: target.left - objLeft });
            verticalLines.push({ x: 0 });
        }
        if (Math.abs(objRight - canvasWidth) < snapTolerance) {
            target.set({ left: target.left + (canvasWidth - objRight) });
            verticalLines.push({ x: canvasWidth });
        }
        if (Math.abs(objCenterX - canvasWidth / 2) < snapTolerance) {
            target.set({ left: target.left + (canvasWidth / 2 - objCenterX) });
            verticalLines.push({ x: canvasWidth / 2 });
        }
        if (Math.abs(objTop) < snapTolerance) {
            target.set({ top: target.top - objTop });
            horizontalLines.push({ y: 0 });
        }
        if (Math.abs(objBottom - canvasHeight) < snapTolerance) {
            target.set({ top: target.top + (canvasHeight - objBottom) });
            horizontalLines.push({ y: canvasHeight });
        }
        if (Math.abs(objCenterY - canvasHeight / 2) < snapTolerance) {
            target.set({ top: target.top + (canvasHeight / 2 - objCenterY) });
            horizontalLines.push({ y: canvasHeight / 2 });
        }

        // Snap to other objects
        canvas.getObjects().forEach(function(obj) {
            if (obj === target || obj.layerId === target.layerId) return;

            var otherBounds = obj.getBoundingRect();
            var otherLeft = otherBounds.left;
            var otherTop = otherBounds.top;
            var otherRight = otherLeft + otherBounds.width;
            var otherBottom = otherTop + otherBounds.height;
            var otherCenterX = otherLeft + otherBounds.width / 2;
            var otherCenterY = otherTop + otherBounds.height / 2;

            // Vertical snapping
            if (Math.abs(objLeft - otherLeft) < snapTolerance) {
                target.set({ left: target.left + (otherLeft - objLeft) });
                verticalLines.push({ x: otherLeft });
            }
            if (Math.abs(objRight - otherRight) < snapTolerance) {
                target.set({ left: target.left + (otherRight - objRight) });
                verticalLines.push({ x: otherRight });
            }
            if (Math.abs(objCenterX - otherCenterX) < snapTolerance) {
                target.set({ left: target.left + (otherCenterX - objCenterX) });
                verticalLines.push({ x: otherCenterX });
            }

            // Horizontal snapping
            if (Math.abs(objTop - otherTop) < snapTolerance) {
                target.set({ top: target.top + (otherTop - objTop) });
                horizontalLines.push({ y: otherTop });
            }
            if (Math.abs(objBottom - otherBottom) < snapTolerance) {
                target.set({ top: target.top + (otherBottom - objBottom) });
                horizontalLines.push({ y: otherBottom });
            }
            if (Math.abs(objCenterY - otherCenterY) < snapTolerance) {
                target.set({ top: target.top + (otherCenterY - objCenterY) });
                horizontalLines.push({ y: otherCenterY });
            }
        });

        target.setCoords();
    }

    function drawGuideLines() {
        if (!canvas || !canvas.contextTop) return;

        var ctx = canvas.contextTop;
        ctx.strokeStyle = aligningLineColor;
        ctx.lineWidth = aligningLineWidth;

        verticalLines.forEach(function(line) {
            ctx.beginPath();
            ctx.moveTo(line.x + 0.5, 0);
            ctx.lineTo(line.x + 0.5, canvas.getHeight());
            ctx.stroke();
        });

        horizontalLines.forEach(function(line) {
            ctx.beginPath();
            ctx.moveTo(0, line.y + 0.5);
            ctx.lineTo(canvas.getWidth(), line.y + 0.5);
            ctx.stroke();
        });
    }

    // ========================================
    // PHASE 6: ALIGNMENT TOOLS
    // ========================================

    function alignLeft() {
        if (!canvas || selectedObjects.length < 2) return;

        var minLeft = Math.min.apply(Math, selectedObjects.map(function(obj) {
            return obj.getBoundingRect().left;
        }));

        selectedObjects.forEach(function(obj) {
            var bounds = obj.getBoundingRect();
            var offset = minLeft - bounds.left;
            obj.set({ left: obj.left + offset });
            obj.setCoords();
        });

        canvas.renderAll();
        console.log('Aligned left');
    }

    function alignCenter() {
        if (!canvas || selectedObjects.length < 2) return;

        var centerX = canvas.getWidth() / 2;

        selectedObjects.forEach(function(obj) {
            var bounds = obj.getBoundingRect();
            var objCenterX = bounds.left + bounds.width / 2;
            var offset = centerX - objCenterX;
            obj.set({ left: obj.left + offset });
            obj.setCoords();
        });

        canvas.renderAll();
        console.log('Aligned center');
    }

    function alignRight() {
        if (!canvas || selectedObjects.length < 2) return;

        var maxRight = Math.max.apply(Math, selectedObjects.map(function(obj) {
            var bounds = obj.getBoundingRect();
            return bounds.left + bounds.width;
        }));

        selectedObjects.forEach(function(obj) {
            var bounds = obj.getBoundingRect();
            var objRight = bounds.left + bounds.width;
            var offset = maxRight - objRight;
            obj.set({ left: obj.left + offset });
            obj.setCoords();
        });

        canvas.renderAll();
        console.log('Aligned right');
    }

    function alignTop() {
        if (!canvas || selectedObjects.length < 2) return;

        var minTop = Math.min.apply(Math, selectedObjects.map(function(obj) {
            return obj.getBoundingRect().top;
        }));

        selectedObjects.forEach(function(obj) {
            var bounds = obj.getBoundingRect();
            var offset = minTop - bounds.top;
            obj.set({ top: obj.top + offset });
            obj.setCoords();
        });

        canvas.renderAll();
        console.log('Aligned top');
    }

    function alignMiddle() {
        if (!canvas || selectedObjects.length < 2) return;

        var centerY = canvas.getHeight() / 2;

        selectedObjects.forEach(function(obj) {
            var bounds = obj.getBoundingRect();
            var objCenterY = bounds.top + bounds.height / 2;
            var offset = centerY - objCenterY;
            obj.set({ top: obj.top + offset });
            obj.setCoords();
        });

        canvas.renderAll();
        console.log('Aligned middle');
    }

    function alignBottom() {
        if (!canvas || selectedObjects.length < 2) return;

        var maxBottom = Math.max.apply(Math, selectedObjects.map(function(obj) {
            var bounds = obj.getBoundingRect();
            return bounds.top + bounds.height;
        }));

        selectedObjects.forEach(function(obj) {
            var bounds = obj.getBoundingRect();
            var objBottom = bounds.top + bounds.height;
            var offset = maxBottom - objBottom;
            obj.set({ top: obj.top + offset });
            obj.setCoords();
        });

        canvas.renderAll();
        console.log('Aligned bottom');
    }

    // ========================================
    // PHASE 6: DISTRIBUTION TOOLS
    // ========================================

    function distributeHorizontally() {
        if (!canvas || selectedObjects.length < 3) {
            alert('Select at least 3 objects to distribute');
            return;
        }

        var sorted = selectedObjects.slice().sort(function(a, b) {
            return a.getBoundingRect().left - b.getBoundingRect().left;
        });

        var first = sorted[0].getBoundingRect();
        var last = sorted[sorted.length - 1].getBoundingRect();

        var totalWidth = sorted.reduce(function(sum, obj) {
            return sum + obj.getBoundingRect().width;
        }, 0);

        var spacing = (last.left - first.left - totalWidth + last.width) / (sorted.length - 1);

        var currentX = first.left + first.width;

        for (var i = 1; i < sorted.length - 1; i++) {
            var obj = sorted[i];
            var bounds = obj.getBoundingRect();
            currentX += spacing;
            var offset = currentX - bounds.left;
            obj.set({ left: obj.left + offset });
            obj.setCoords();
            currentX += bounds.width;
        }

        canvas.renderAll();
        console.log('Distributed horizontally');
    }

    function distributeVertically() {
        if (!canvas || selectedObjects.length < 3) {
            alert('Select at least 3 objects to distribute');
            return;
        }

        var sorted = selectedObjects.slice().sort(function(a, b) {
            return a.getBoundingRect().top - b.getBoundingRect().top;
        });

        var first = sorted[0].getBoundingRect();
        var last = sorted[sorted.length - 1].getBoundingRect();

        var totalHeight = sorted.reduce(function(sum, obj) {
            return sum + obj.getBoundingRect().height;
        }, 0);

        var spacing = (last.top - first.top - totalHeight + last.height) / (sorted.length - 1);

        var currentY = first.top + first.height;

        for (var i = 1; i < sorted.length - 1; i++) {
            var obj = sorted[i];
            var bounds = obj.getBoundingRect();
            currentY += spacing;
            var offset = currentY - bounds.top;
            obj.set({ top: obj.top + offset });
            obj.setCoords();
            currentY += bounds.height;
        }

        canvas.renderAll();
        console.log('Distributed vertically');
    }

    // ========================================
    // PHASE 6: LAYER EXPORT
    // ========================================

    function exportSelectedLayer() {
        if (!canvas) return;

        var activeObject = canvas.getActiveObject();
        if (!activeObject) {
            alert('Please select a layer to export');
            return;
        }

        var layerName = activeObject.layerName || 'layer';
        exportSingleObject(activeObject, layerName);
    }

    function exportSingleObject(obj, filename) {
        if (!canvas || !obj) return;

        // Create a temporary canvas
        var tempCanvas = new fabric.Canvas(document.createElement('canvas'));
        var bounds = obj.getBoundingRect(true);

        tempCanvas.setWidth(bounds.width);
        tempCanvas.setHeight(bounds.height);
        tempCanvas.backgroundColor = 'transparent';

        // Clone the object
        obj.clone(function(cloned) {
            cloned.set({
                left: bounds.width / 2,
                top: bounds.height / 2,
                originX: 'center',
                originY: 'center'
            });

            tempCanvas.add(cloned);
            tempCanvas.renderAll();

            // Export as PNG
            var dataURL = tempCanvas.toDataURL({
                format: 'png',
                quality: 1
            });

            // Download
            var link = document.createElement('a');
            link.download = filename.replace(/[^a-z0-9]/gi, '-').toLowerCase() + '.png';
            link.href = dataURL;
            link.click();

            tempCanvas.dispose();
            console.log('Exported layer:', filename);
        });
    }

    function exportAllLayers() {
        if (!canvas) return;

        var objects = canvas.getObjects();
        if (objects.length === 0) {
            alert('No layers to export');
            return;
        }

        var confirmExport = confirm('Export all ' + objects.length + ' layers as separate PNG files?');
        if (!confirmExport) return;

        objects.forEach(function(obj, index) {
            var layerName = obj.layerName || 'layer-' + (index + 1);
            setTimeout(function() {
                exportSingleObject(obj, layerName);
            }, index * 200); // Stagger downloads
        });

        console.log('Exporting all layers:', objects.length);
    }

    // ========================================
    // PHASE 6: EVENT HANDLERS
    // ========================================

    // Snapping toggle
    $('#iobp-snapping-enabled').on('change', function() {
        snappingEnabled = $(this).is(':checked');
        console.log('Snapping', snappingEnabled ? 'enabled' : 'disabled');
    });

    // Alignment buttons
    $('#iobp-align-left').on('click', alignLeft);
    $('#iobp-align-center').on('click', alignCenter);
    $('#iobp-align-right').on('click', alignRight);
    $('#iobp-align-top').on('click', alignTop);
    $('#iobp-align-middle').on('click', alignMiddle);
    $('#iobp-align-bottom').on('click', alignBottom);

    // Distribution buttons
    $('#iobp-distribute-horizontal').on('click', distributeHorizontally);
    $('#iobp-distribute-vertical').on('click', distributeVertically);

    // Export buttons
    $('#iobp-export-selected').on('click', exportSelectedLayer);
    $('#iobp-export-all-layers').on('click', exportAllLayers);

    // Add tooltips to all buttons
    $('button[title], .iobp-tooltip[title]').each(function() {
        $(this).attr('data-tooltip', $(this).attr('title'));
    });

    refreshLayerPanel();

    // ========================================
    // MOBILE MENU TOGGLE & OVERLAY
    // ========================================

    $('#iobp-menu-toggle').on('click', function() {
        $('#iobp-sidebar').toggleClass('active');
        $('#iobp-sidebar-overlay').toggleClass('active');
    });

    $('#iobp-sidebar-overlay').on('click', function() {
        $('#iobp-sidebar').removeClass('active');
        $('#iobp-sidebar-overlay').removeClass('active');
    });

    // Close sidebar when clicking on a section (mobile)
    $(document).on('click', '.iobp-section-header', function() {
        if (window.innerWidth <= 768) {
            // Optionally close the sidebar after selecting a section on mobile
            // Uncomment the lines below if you want this behavior
            // setTimeout(function() {
            //     $('#iobp-sidebar').removeClass('active');
            //     $('#iobp-sidebar-overlay').removeClass('active');
            // }, 300);
        }
    });

    // ========================================
    // PHASE 7: CUSTOM CANVAS SIZE WITH CLIPBOARD DETECTION
    // ========================================

    console.log('Phase 7: Custom Canvas Size with Clipboard Detection - Initializing...');

    var customCanvasSize = null;
    var clipboardImageData = null;
    var currentAspectRatio = null;

    // Load custom presets from localStorage
    function loadCustomPresets() {
        var presets = localStorage.getItem('iobp_custom_presets');
        return presets ? JSON.parse(presets) : [];
    }

    // Save custom presets to localStorage
    function saveCustomPresets(presets) {
        localStorage.setItem('iobp_custom_presets', JSON.stringify(presets));
    }

    // Render custom presets in UI
    function renderCustomPresets() {
        var presets = loadCustomPresets();
        var $container = $('#iobp-custom-presets-container');
        $container.empty();

        if (presets.length === 0) return;

        presets.forEach(function(preset, index) {
            var $presetItem = $('<div class="iobp-preset-item"></div>');
            $presetItem.append('<span class="iobp-preset-name">' + preset.name + '</span>');
            $presetItem.append('<span class="iobp-preset-size">' + preset.width + 'x' + preset.height + '</span>');

            var $deleteBtn = $('<button class="iobp-preset-delete">×</button>');
            $deleteBtn.on('click', function(e) {
                e.stopPropagation();
                if (confirm('Delete preset "' + preset.name + '"?')) {
                    presets.splice(index, 1);
                    saveCustomPresets(presets);
                    renderCustomPresets();
                }
            });

            $presetItem.append($deleteBtn);

            $presetItem.on('click', function() {
                applyCustomCanvasSize(preset.width, preset.height, preset.name);
            });

            $container.append($presetItem);
        });
    }

    // Apply custom canvas size
    function applyCustomCanvasSize(width, height, name) {
        if (canvas && canvas.getObjects().length > 0) {
            if (!confirm('Changing canvas size will clear all work. Continue?')) {
                return;
            }
        }

        console.log('Applying custom canvas size:', width, 'x', height);

        // Store custom size in config
        var customKey = 'custom_' + width + 'x' + height;
        canvasConfig[customKey] = {
            canvas_width: parseInt(width, 10),
            canvas_height: parseInt(height, 10),
            crop_width: parseInt(width, 10),
            crop_height: parseInt(height, 10),
            no_crop: true
        };

        selectedCanvasSize = customKey;
        customCanvasSize = { width: width, height: height, name: name || 'Custom' };

        // Reinitialize canvas with new size
        initCanvas(selectedCanvasSize);
        layerGroups = {};
        refreshLayerPanel();

        console.log('Custom canvas created:', width, 'x', height);
    }

    // Clipboard detection
    async function detectClipboardImage() {
        console.log('Detecting clipboard image...');

        if (!navigator.clipboard || !navigator.clipboard.read) {
            console.warn('Clipboard API not supported. Browser compatibility fallback needed.');
            return { hasImage: false, error: 'Clipboard API not supported' };
        }

        try {
            const permission = await navigator.permissions.query({ name: 'clipboard-read' });
            console.log('Clipboard permission:', permission.state);

            const clipboardItems = await navigator.clipboard.read();

            for (const item of clipboardItems) {
                console.log('Clipboard item types:', item.types);

                for (const type of item.types) {
                    if (type.startsWith('image/')) {
                        const blob = await item.getType(type);
                        const img = new Image();
                        const url = URL.createObjectURL(blob);

                        img.src = url;
                        await new Promise((resolve) => {
                            img.onload = resolve;
                        });

                        console.log('Clipboard image detected:', img.naturalWidth, 'x', img.naturalHeight);

                        return {
                            hasImage: true,
                            width: img.naturalWidth,
                            height: img.naturalHeight,
                            blob: blob,
                            url: url
                        };
                    }
                }
            }

            return { hasImage: false };
        } catch (err) {
            console.error('Clipboard detection error:', err);
            return { hasImage: false, error: err.message };
        }
    }

    // Open custom size dialog
    async function openCustomSizeDialog() {
        console.log('Opening custom size dialog...');

        // Reset form
        $('#iobp-custom-width').val(1920);
        $('#iobp-custom-height').val(1080);
        $('#iobp-constrain-proportions').prop('checked', false);
        $('#iobp-preset-name').val('');
        $('#iobp-paste-clipboard-image').prop('checked', false);
        $('#iobp-clipboard-banner').hide();
        $('#iobp-clipboard-preview-container').hide();
        $('#iobp-paste-option').hide();

        // Update orientation buttons
        updateOrientationButtons();

        // Detect clipboard image
        clipboardImageData = await detectClipboardImage();

        if (clipboardImageData.hasImage) {
            console.log('Clipboard image found:', clipboardImageData.width, 'x', clipboardImageData.height);

            // Show clipboard banner
            $('#iobp-clipboard-info').text('📋 Image detected on clipboard (' + clipboardImageData.width + 'x' + clipboardImageData.height + ')');
            $('#iobp-clipboard-banner').show();

            // Show preview
            $('#iobp-clipboard-preview').attr('src', clipboardImageData.url);
            $('#iobp-clipboard-preview-container').show();

            // Show paste option
            $('#iobp-paste-option').show();

            // Pre-fill dimensions
            $('#iobp-custom-width').val(clipboardImageData.width);
            $('#iobp-custom-height').val(clipboardImageData.height);

            currentAspectRatio = clipboardImageData.width / clipboardImageData.height;
        } else {
            currentAspectRatio = 1920 / 1080;
        }

        // Show modal
        $('#iobp-custom-size-modal').addClass('active');
    }

    // Close custom size dialog
    function closeCustomSizeDialog() {
        $('#iobp-custom-size-modal').removeClass('active');

        // Clean up clipboard preview URL
        if (clipboardImageData && clipboardImageData.url) {
            URL.revokeObjectURL(clipboardImageData.url);
        }
        clipboardImageData = null;
    }

    // Update orientation buttons
    function updateOrientationButtons() {
        var width = parseInt($('#iobp-custom-width').val(), 10);
        var height = parseInt($('#iobp-custom-height').val(), 10);

        if (width > height) {
            $('#iobp-orientation-landscape').addClass('active');
            $('#iobp-orientation-portrait').removeClass('active');
        } else {
            $('#iobp-orientation-landscape').removeClass('active');
            $('#iobp-orientation-portrait').addClass('active');
        }
    }

    // Event: Custom Size Button
    $('#iobp-custom-size-btn').on('click', function() {
        openCustomSizeDialog();
    });

    // Event: Close Modal
    $('.iobp-modal-close, #iobp-cancel-custom-size').on('click', function() {
        closeCustomSizeDialog();
    });

    // Event: Use Clipboard Size Button
    $('#iobp-use-clipboard-size').on('click', function() {
        if (clipboardImageData && clipboardImageData.hasImage) {
            $('#iobp-custom-width').val(clipboardImageData.width);
            $('#iobp-custom-height').val(clipboardImageData.height);
            currentAspectRatio = clipboardImageData.width / clipboardImageData.height;
            updateOrientationButtons();
        }
    });

    // Event: Constrain Proportions
    var lastWidth = 1920;
    var lastHeight = 1080;

    $('#iobp-custom-width').on('input', function() {
        var newWidth = parseInt($(this).val(), 10);

        if ($('#iobp-constrain-proportions').prop('checked') && currentAspectRatio) {
            var newHeight = Math.round(newWidth / currentAspectRatio);
            $('#iobp-custom-height').val(newHeight);
        }

        lastWidth = newWidth;
        updateOrientationButtons();
    });

    $('#iobp-custom-height').on('input', function() {
        var newHeight = parseInt($(this).val(), 10);

        if ($('#iobp-constrain-proportions').prop('checked') && currentAspectRatio) {
            var newWidth = Math.round(newHeight * currentAspectRatio);
            $('#iobp-custom-width').val(newWidth);
        }

        lastHeight = newHeight;
        updateOrientationButtons();
    });

    $('#iobp-constrain-proportions').on('change', function() {
        if ($(this).prop('checked')) {
            var width = parseInt($('#iobp-custom-width').val(), 10);
            var height = parseInt($('#iobp-custom-height').val(), 10);
            currentAspectRatio = width / height;
            console.log('Constrain proportions enabled. Aspect ratio:', currentAspectRatio);
        }
    });

    // Event: Orientation Toggle
    $('#iobp-orientation-landscape').on('click', function() {
        var width = parseInt($('#iobp-custom-width').val(), 10);
        var height = parseInt($('#iobp-custom-height').val(), 10);

        if (height > width) {
            // Swap
            $('#iobp-custom-width').val(height);
            $('#iobp-custom-height').val(width);

            if ($('#iobp-constrain-proportions').prop('checked')) {
                currentAspectRatio = height / width;
            }
        }

        updateOrientationButtons();
    });

    $('#iobp-orientation-portrait').on('click', function() {
        var width = parseInt($('#iobp-custom-width').val(), 10);
        var height = parseInt($('#iobp-custom-height').val(), 10);

        if (width > height) {
            // Swap
            $('#iobp-custom-width').val(height);
            $('#iobp-custom-height').val(width);

            if ($('#iobp-constrain-proportions').prop('checked')) {
                currentAspectRatio = height / width;
            }
        }

        updateOrientationButtons();
    });

    // Event: Apply Custom Size
    $('#iobp-apply-custom-size').on('click', function() {
        var width = parseInt($('#iobp-custom-width').val(), 10);
        var height = parseInt($('#iobp-custom-height').val(), 10);
        var presetName = $('#iobp-preset-name').val().trim();
        var pasteClipboard = $('#iobp-paste-clipboard-image').prop('checked');

        // Validation
        if (isNaN(width) || width < 100 || width > 4000) {
            alert('Width must be between 100 and 4000 pixels.');
            return;
        }

        if (isNaN(height) || height < 100 || height > 4000) {
            alert('Height must be between 100 and 4000 pixels.');
            return;
        }

        // Save as preset if name provided
        if (presetName) {
            var presets = loadCustomPresets();

            // Check for duplicate name
            var existingIndex = presets.findIndex(function(p) {
                return p.name.toLowerCase() === presetName.toLowerCase();
            });

            if (existingIndex >= 0) {
                if (confirm('A preset with this name already exists. Overwrite?')) {
                    presets[existingIndex] = { name: presetName, width: width, height: height };
                } else {
                    return;
                }
            } else {
                presets.push({ name: presetName, width: width, height: height });
            }

            saveCustomPresets(presets);
            renderCustomPresets();
            console.log('Custom preset saved:', presetName, width, 'x', height);
        }

        // Apply canvas size
        applyCustomCanvasSize(width, height, presetName || 'Custom');

        // Paste clipboard image if requested
        if (pasteClipboard && clipboardImageData && clipboardImageData.hasImage) {
            pasteClipboardImageToCanvas();
        }

        // Close modal
        closeCustomSizeDialog();
    });

    // Event: New from Clipboard (One-Click Workflow)
    $('#iobp-clipboard-canvas-btn').on('click', async function() {
        console.log('New from Clipboard - One-click workflow');

        clipboardImageData = await detectClipboardImage();

        if (clipboardImageData.hasImage) {
            console.log('Clipboard image detected. Creating canvas and pasting image...');

            // Create canvas with clipboard dimensions
            applyCustomCanvasSize(clipboardImageData.width, clipboardImageData.height, 'From Clipboard');

            // Wait for canvas initialization
            setTimeout(function() {
                pasteClipboardImageToCanvas();
            }, 300);
        } else {
            alert('No image found on clipboard. Please copy an image first or use "Custom Size" to manually enter dimensions.');
            console.warn('No clipboard image found. Opening custom size dialog as fallback...');
            openCustomSizeDialog();
        }
    });

    // Paste clipboard image to canvas
    function pasteClipboardImageToCanvas() {
        if (!canvas || !clipboardImageData || !clipboardImageData.hasImage) {
            console.error('Cannot paste clipboard image. Canvas or clipboard data not available.');
            return;
        }

        console.log('Pasting clipboard image to canvas...');

        var imgElement = new Image();
        imgElement.src = clipboardImageData.url;

        imgElement.onload = function() {
            fabric.Image.fromURL(clipboardImageData.url, function(img) {
                var canvasWidth = canvas.getWidth();
                var canvasHeight = canvas.getHeight();

                // Scale to fit if larger than canvas
                var scale = 1;
                if (img.width > canvasWidth || img.height > canvasHeight) {
                    scale = Math.min(canvasWidth / img.width, canvasHeight / img.height);
                }

                img.set({
                    left: (canvasWidth - img.width * scale) / 2,
                    top: (canvasHeight - img.height * scale) / 2,
                    scaleX: scale,
                    scaleY: scale,
                    selectable: true,
                    evented: true
                });

                assignLayerId(img);
                img.layerName = 'Clipboard Image';

                canvas.add(img);
                canvas.setActiveObject(img);
                canvas.renderAll();

                console.log('Clipboard image pasted to canvas successfully.');
            });
        };
    }

    // Initialize: Load and render custom presets
    renderCustomPresets();

    // ========================================
    // PHASE 8: SELECTION AND PAINT TOOLS
    // ========================================

    console.log('Initializing Phase 8: Selection and Paint Tools...');

    // Phase 8: Tool State Variables
    var activeTool = 'select'; // 'select', 'brush', 'eraser', 'bucket', 'wand'
    var foregroundColor = '#000000';
    var backgroundColor = '#ffffff';
    var currentRasterLayer = null;
    var rasterLayers = {}; // Store raster layer data by layerId
    var activeSelection = null; // Store active pixel selection
    var selectionPath = null; // Fabric path for marching ants display
    var selectionMode = 'new'; // 'new', 'add', 'subtract', 'intersect'
    var isDrawing = false;
    var brushSettings = {
        size: 20,
        hardness: 100,
        opacity: 100,
        flow: 100,
        blendMode: 'source-over'
    };
    var eraserSettings = {
        mode: 'brush', // 'brush', 'pencil', 'magic'
        size: 20,
        opacity: 100,
        tolerance: 32,
        contiguous: true
    };
    var bucketSettings = {
        fillType: 'color', // 'color', 'pattern'
        tolerance: 32,
        opacity: 100,
        contiguous: true,
        antialias: true,
        sampleAllLayers: false
    };
    var wandSettings = {
        tolerance: 32,
        contiguous: true,
        antialias: true,
        sampleAll: false
    };

    // Phase 8: Tool Switching
    function switchTool(toolName) {
        console.log('Switching to tool:', toolName);

        // Update active tool
        activeTool = toolName;

        // Update UI
        $('.iobp-tool-btn').removeClass('active');
        $('.iobp-tool-btn[data-tool="' + toolName + '"]').addClass('active');

        // Hide all tool settings
        $('#iobp-brush-settings, #iobp-eraser-settings, #iobp-bucket-settings, #iobp-wand-settings').hide();

        // Remove body classes
        $('body').removeClass('tool-brush-active tool-eraser-active tool-bucket-active tool-wand-active');

        // Show relevant settings and update canvas behavior
        if (toolName === 'brush') {
            $('#iobp-brush-settings').show();
            $('body').addClass('tool-brush-active');
            canvas.selection = false;
            canvas.defaultCursor = 'crosshair';
            disableObjectSelection();
        } else if (toolName === 'eraser') {
            $('#iobp-eraser-settings').show();
            $('body').addClass('tool-eraser-active');
            canvas.selection = false;
            canvas.defaultCursor = 'crosshair';
            disableObjectSelection();
        } else if (toolName === 'bucket') {
            $('#iobp-bucket-settings').show();
            $('body').addClass('tool-bucket-active');
            canvas.selection = false;
            canvas.defaultCursor = 'crosshair';
            disableObjectSelection();
        } else if (toolName === 'wand') {
            $('#iobp-wand-settings').show();
            $('body').addClass('tool-wand-active');
            canvas.selection = false;
            canvas.defaultCursor = 'crosshair';
            disableObjectSelection();
        } else {
            // Select tool
            canvas.selection = true;
            canvas.defaultCursor = 'default';
            enableObjectSelection();
        }

        canvas.renderAll();
    }

    function disableObjectSelection() {
        canvas.forEachObject(function(obj) {
            obj.selectable = false;
            obj.evented = false;
        });
        canvas.discardActiveObject();
    }

    function enableObjectSelection() {
        canvas.forEachObject(function(obj) {
            if (!obj.layerLocked) {
                obj.selectable = true;
                obj.evented = true;
            }
        });
    }

    // Tool button click handlers
    $('.iobp-tool-btn').on('click', function() {
        var tool = $(this).data('tool');
        switchTool(tool);
    });

    // Color management
    $('#iobp-foreground-color').on('change', function() {
        foregroundColor = $(this).val();
        console.log('Foreground color changed to:', foregroundColor);
    });

    $('#iobp-background-color').on('change', function() {
        backgroundColor = $(this).val();
        console.log('Background color changed to:', backgroundColor);
    });

    $('#iobp-swap-colors').on('click', function() {
        var temp = foregroundColor;
        foregroundColor = backgroundColor;
        backgroundColor = temp;
        $('#iobp-foreground-color').val(foregroundColor);
        $('#iobp-background-color').val(backgroundColor);
        console.log('Colors swapped:', foregroundColor, backgroundColor);
    });

    $('#iobp-reset-colors').on('click', function() {
        foregroundColor = '#000000';
        backgroundColor = '#ffffff';
        $('#iobp-foreground-color').val(foregroundColor);
        $('#iobp-background-color').val(backgroundColor);
        console.log('Colors reset to black/white');
    });

    // Keyboard shortcuts for color management and tools
    var phase8KeydownHandler = function(e) {
        if ($(e.target).is('input, textarea')) return;

        // X key - Swap colors
        if (e.key === 'x' || e.key === 'X') {
            $('#iobp-swap-colors').click();
        }

        // D key - Reset colors (only if not Ctrl/Cmd+D for duplicate)
        if (e.key === 'd' && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            $('#iobp-reset-colors').click();
        }

        // Tool shortcuts
        if (e.key === 'v' || e.key === 'V') {
            switchTool('select');
        } else if (e.key === 'b' || e.key === 'B') {
            switchTool('brush');
        } else if ((e.key === 'e' || e.key === 'E') && !e.ctrlKey && !e.metaKey) {
            if (activeTool === 'eraser' && e.shiftKey) {
                // Cycle through eraser modes with Shift+E
                var currentMode = $('#iobp-eraser-mode').val();
                var modes = ['brush', 'pencil', 'magic'];
                var currentIndex = modes.indexOf(currentMode);
                var nextIndex = (currentIndex + 1) % modes.length;
                $('#iobp-eraser-mode').val(modes[nextIndex]).trigger('change');
            } else if (activeTool !== 'eraser') {
                switchTool('eraser');
            }
        } else if ((e.key === 'g' || e.key === 'G') && !e.ctrlKey && !e.metaKey) {
            switchTool('bucket');
        } else if (e.key === 'w' || e.key === 'W') {
            switchTool('wand');
        }

        // Bracket keys for brush size
        if (e.key === '[') {
            var currentSize = parseInt($('#iobp-brush-size').val());
            $('#iobp-brush-size').val(Math.max(1, currentSize - 5)).trigger('input');
        } else if (e.key === ']') {
            var currentSize = parseInt($('#iobp-brush-size').val());
            $('#iobp-brush-size').val(Math.min(500, currentSize + 5)).trigger('input');
        }
    };

    $(document).on('keydown', phase8KeydownHandler);

    // Brush settings sliders
    $('#iobp-brush-size').on('input', function() {
        brushSettings.size = parseInt($(this).val());
        $('#iobp-brush-size-value').text(brushSettings.size + 'px');
    });

    $('#iobp-brush-hardness').on('input', function() {
        brushSettings.hardness = parseInt($(this).val());
        $('#iobp-brush-hardness-value').text(brushSettings.hardness + '%');
    });

    $('#iobp-brush-opacity').on('input', function() {
        brushSettings.opacity = parseInt($(this).val());
        $('#iobp-brush-opacity-value').text(brushSettings.opacity + '%');
    });

    $('#iobp-brush-flow').on('input', function() {
        brushSettings.flow = parseInt($(this).val());
        $('#iobp-brush-flow-value').text(brushSettings.flow + '%');
    });

    $('#iobp-brush-blend-mode').on('change', function() {
        brushSettings.blendMode = $(this).val();
    });

    // Eraser settings
    $('#iobp-eraser-mode').on('change', function() {
        eraserSettings.mode = $(this).val();

        if (eraserSettings.mode === 'magic') {
            $('#iobp-eraser-size-group, #iobp-eraser-opacity-group').hide();
            $('#iobp-eraser-tolerance-group, #iobp-eraser-contiguous-group').show();
        } else {
            $('#iobp-eraser-size-group, #iobp-eraser-opacity-group').show();
            $('#iobp-eraser-tolerance-group, #iobp-eraser-contiguous-group').hide();
        }
    });

    $('#iobp-eraser-size').on('input', function() {
        eraserSettings.size = parseInt($(this).val());
        $('#iobp-eraser-size-value').text(eraserSettings.size + 'px');
    });

    $('#iobp-eraser-opacity').on('input', function() {
        eraserSettings.opacity = parseInt($(this).val());
        $('#iobp-eraser-opacity-value').text(eraserSettings.opacity + '%');
    });

    $('#iobp-eraser-tolerance').on('input', function() {
        eraserSettings.tolerance = parseInt($(this).val());
        $('#iobp-eraser-tolerance-value').text(eraserSettings.tolerance);
    });

    $('#iobp-eraser-contiguous').on('change', function() {
        eraserSettings.contiguous = $(this).is(':checked');
    });

    // Paint Bucket settings
    $('#iobp-bucket-tolerance').on('input', function() {
        bucketSettings.tolerance = parseInt($(this).val());
        $('#iobp-bucket-tolerance-value').text(bucketSettings.tolerance);
    });

    $('#iobp-bucket-opacity').on('input', function() {
        bucketSettings.opacity = parseInt($(this).val());
        $('#iobp-bucket-opacity-value').text(bucketSettings.opacity + '%');
    });

    $('#iobp-bucket-fill-type').on('change', function() {
        bucketSettings.fillType = $(this).val();
    });

    $('#iobp-bucket-contiguous').on('change', function() {
        bucketSettings.contiguous = $(this).is(':checked');
    });

    $('#iobp-bucket-antialias').on('change', function() {
        bucketSettings.antialias = $(this).is(':checked');
    });

    $('#iobp-bucket-all-layers').on('change', function() {
        bucketSettings.sampleAllLayers = $(this).is(':checked');
    });

    // Magic Wand settings
    $('#iobp-wand-tolerance').on('input', function() {
        wandSettings.tolerance = parseInt($(this).val());
        $('#iobp-wand-tolerance-value').text(wandSettings.tolerance);
    });

    $('#iobp-wand-contiguous').on('change', function() {
        wandSettings.contiguous = $(this).is(':checked');
    });

    $('#iobp-wand-antialias').on('change', function() {
        wandSettings.antialias = $(this).is(':checked');
    });

    $('#iobp-wand-sample-all').on('change', function() {
        wandSettings.sampleAll = $(this).is(':checked');
    });

    // Selection mode buttons
    $('.iobp-selection-mode-btns .iobp-btn').on('click', function() {
        $('.iobp-selection-mode-btns .iobp-btn').removeClass('active');
        $(this).addClass('active');
        selectionMode = $(this).data('mode');
        console.log('Selection mode changed to:', selectionMode);
    });

    $('#iobp-clear-selection').on('click', function() {
        clearSelection();
    });

    function clearSelection() {
        activeSelection = null;
        if (selectionPath) {
            canvas.remove(selectionPath);
            selectionPath = null;
        }
        canvas.renderAll();
        console.log('Selection cleared');
    }

    // Create or get current raster layer
    function getCurrentRasterLayer() {
        if (!currentRasterLayer || !canvas.contains(currentRasterLayer)) {
            // Create new raster layer
            var tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.getWidth();
            tempCanvas.height = canvas.getHeight();

            var ctx = tempCanvas.getContext('2d');
            ctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

            var dataURL = tempCanvas.toDataURL('image/png');

            fabric.Image.fromURL(dataURL, function(img) {
                img.set({
                    left: 0,
                    top: 0,
                    selectable: false,
                    evented: false,
                    hasControls: false,
                    hasBorders: false
                });

                assignLayerId(img);
                img.layerName = 'Raster Layer ' + (Object.keys(rasterLayers).length + 1);
                img.layerType = 'raster';

                // Store raster layer data
                rasterLayers[img.layerId] = {
                    canvas: tempCanvas,
                    context: ctx
                };

                canvas.add(img);
                currentRasterLayer = img;

                console.log('Created new raster layer:', img.layerName);
            });
        }

        return currentRasterLayer;
    }

    // Get raster layer context for painting
    function getRasterLayerContext() {
        var rasterLayer = getCurrentRasterLayer();
        if (rasterLayer && rasterLayers[rasterLayer.layerId]) {
            return rasterLayers[rasterLayer.layerId].context;
        }
        return null;
    }

    // Update raster layer image after painting
    function updateRasterLayerImage() {
        if (currentRasterLayer && rasterLayers[currentRasterLayer.layerId]) {
            var rasterCanvas = rasterLayers[currentRasterLayer.layerId].canvas;
            var dataURL = rasterCanvas.toDataURL('image/png');

            currentRasterLayer.setSrc(dataURL, function() {
                canvas.renderAll();
            });
        }
    }

    // Phase 8: Brush Tool Implementation
    var lastX, lastY;

    canvas.on('mouse:down', function(options) {
        if (activeTool === 'brush' && !isDrawing) {
            isDrawing = true;
            var pointer = canvas.getPointer(options.e);
            lastX = pointer.x;
            lastY = pointer.y;

            // Ensure raster layer exists
            getCurrentRasterLayer();

            setTimeout(function() {
                paintBrushStroke(lastX, lastY, lastX, lastY);
            }, 100);
        } else if (activeTool === 'eraser' && !isDrawing) {
            isDrawing = true;
            var pointer = canvas.getPointer(options.e);
            lastX = pointer.x;
            lastY = pointer.y;

            if (eraserSettings.mode === 'magic') {
                performMagicErase(pointer.x, pointer.y);
            } else {
                performErase(lastX, lastY, lastX, lastY);
            }
        } else if (activeTool === 'bucket') {
            var pointer = canvas.getPointer(options.e);
            performBucketFill(pointer.x, pointer.y);
        } else if (activeTool === 'wand') {
            var pointer = canvas.getPointer(options.e);
            performMagicWandSelection(pointer.x, pointer.y);
        }
    });

    canvas.on('mouse:move', function(options) {
        if (activeTool === 'brush' && isDrawing) {
            var pointer = canvas.getPointer(options.e);
            paintBrushStroke(lastX, lastY, pointer.x, pointer.y);
            lastX = pointer.x;
            lastY = pointer.y;
        } else if (activeTool === 'eraser' && isDrawing && eraserSettings.mode !== 'magic') {
            var pointer = canvas.getPointer(options.e);
            performErase(lastX, lastY, pointer.x, pointer.y);
            lastX = pointer.x;
            lastY = pointer.y;
        }
    });

    canvas.on('mouse:up', function() {
        if ((activeTool === 'brush' || activeTool === 'eraser') && isDrawing) {
            isDrawing = false;
        }
    });

    function paintBrushStroke(x1, y1, x2, y2) {
        var ctx = getRasterLayerContext();
        if (!ctx) return;

        ctx.save();
        ctx.globalCompositeOperation = brushSettings.blendMode;
        ctx.globalAlpha = (brushSettings.opacity / 100) * (brushSettings.flow / 100);
        ctx.strokeStyle = foregroundColor;
        ctx.lineWidth = brushSettings.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Apply hardness (blur effect)
        if (brushSettings.hardness < 100) {
            ctx.shadowBlur = brushSettings.size * (1 - brushSettings.hardness / 100);
            ctx.shadowColor = foregroundColor;
        }

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();

        updateRasterLayerImage();
    }

    function performErase(x1, y1, x2, y2) {
        var ctx = getRasterLayerContext();
        if (!ctx) return;

        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.globalAlpha = eraserSettings.opacity / 100;
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.lineWidth = eraserSettings.size;
        ctx.lineCap = eraserSettings.mode === 'pencil' ? 'butt' : 'round';
        ctx.lineJoin = eraserSettings.mode === 'pencil' ? 'miter' : 'round';

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();

        updateRasterLayerImage();
    }

    function performMagicErase(x, y) {
        var canvasEl = document.getElementById('iobp-overlay-canvas');
        var ctx = canvasEl.getContext('2d');
        var imageData = ctx.getImageData(0, 0, canvas.getWidth(), canvas.getHeight());
        var data = imageData.data;

        var targetPixel = getPixelColor(imageData, Math.floor(x), Math.floor(y));
        if (!targetPixel) return;

        var pixelsToErase = [];

        if (eraserSettings.contiguous) {
            pixelsToErase = floodFillSelection(imageData, Math.floor(x), Math.floor(y), targetPixel, eraserSettings.tolerance);
        } else {
            pixelsToErase = globalColorSelection(imageData, targetPixel, eraserSettings.tolerance);
        }

        // Apply erase to raster layer
        var rasterCtx = getRasterLayerContext();
        if (!rasterCtx) return;

        var rasterImageData = rasterCtx.getImageData(0, 0, canvas.getWidth(), canvas.getHeight());
        var rasterData = rasterImageData.data;

        pixelsToErase.forEach(function(pixelIndex) {
            rasterData[pixelIndex * 4 + 3] = 0; // Set alpha to 0
        });

        rasterCtx.putImageData(rasterImageData, 0, 0);
        updateRasterLayerImage();
    }

    function performBucketFill(x, y) {
        var canvasEl = document.getElementById('iobp-overlay-canvas');
        var ctx = canvasEl.getContext('2d');
        var imageData = ctx.getImageData(0, 0, canvas.getWidth(), canvas.getHeight());

        var targetPixel = getPixelColor(imageData, Math.floor(x), Math.floor(y));
        if (!targetPixel) return;

        var pixelsToFill = [];

        if (bucketSettings.contiguous) {
            pixelsToFill = floodFillSelection(imageData, Math.floor(x), Math.floor(y), targetPixel, bucketSettings.tolerance);
        } else {
            pixelsToFill = globalColorSelection(imageData, targetPixel, bucketSettings.tolerance);
        }

        // Create or get raster layer
        getCurrentRasterLayer();

        setTimeout(function() {
            var rasterCtx = getRasterLayerContext();
            if (!rasterCtx) return;

            var fillColor = hexToRgb(foregroundColor);
            var alpha = bucketSettings.opacity / 100;

            var rasterImageData = rasterCtx.getImageData(0, 0, canvas.getWidth(), canvas.getHeight());
            var rasterData = rasterImageData.data;

            pixelsToFill.forEach(function(pixelIndex) {
                var i = pixelIndex * 4;
                rasterData[i] = fillColor.r;
                rasterData[i + 1] = fillColor.g;
                rasterData[i + 2] = fillColor.b;
                rasterData[i + 3] = Math.floor(alpha * 255);
            });

            rasterCtx.putImageData(rasterImageData, 0, 0);
            updateRasterLayerImage();
        }, 100);
    }

    function performMagicWandSelection(x, y) {
        var canvasEl = document.getElementById('iobp-overlay-canvas');
        var ctx = canvasEl.getContext('2d');
        var imageData = ctx.getImageData(0, 0, canvas.getWidth(), canvas.getHeight());

        var targetPixel = getPixelColor(imageData, Math.floor(x), Math.floor(y));
        if (!targetPixel) return;

        var selectedPixels = [];

        if (wandSettings.contiguous) {
            selectedPixels = floodFillSelection(imageData, Math.floor(x), Math.floor(y), targetPixel, wandSettings.tolerance);
        } else {
            selectedPixels = globalColorSelection(imageData, targetPixel, wandSettings.tolerance);
        }

        // Create selection path (simplified bounding box for now)
        if (selectedPixels.length > 0) {
            var minX = canvas.getWidth(), minY = canvas.getHeight();
            var maxX = 0, maxY = 0;

            selectedPixels.forEach(function(pixelIndex) {
                var width = canvas.getWidth();
                var px = pixelIndex % width;
                var py = Math.floor(pixelIndex / width);
                minX = Math.min(minX, px);
                minY = Math.min(minY, py);
                maxX = Math.max(maxX, px);
                maxY = Math.max(maxY, py);
            });

            // Clear existing selection
            if (selectionPath) {
                canvas.remove(selectionPath);
            }

            // Create selection rectangle with marching ants
            selectionPath = new fabric.Rect({
                left: minX,
                top: minY,
                width: maxX - minX,
                height: maxY - minY,
                fill: 'transparent',
                stroke: '#5b7cff',
                strokeWidth: 2,
                strokeDashArray: [5, 5],
                selectable: false,
                evented: false,
                excludeFromExport: true
            });

            canvas.add(selectionPath);
            canvas.renderAll();

            activeSelection = selectedPixels;
            console.log('Magic wand selection created:', selectedPixels.length, 'pixels');

            // Animate marching ants
            animateMarchingAnts();
        }
    }

    function animateMarchingAnts() {
        if (selectionPath) {
            var offset = 0;
            var marchInterval = setInterval(function() {
                if (selectionPath && canvas.contains(selectionPath)) {
                    offset = (offset + 1) % 10;
                    selectionPath.set('strokeDashOffset', offset);
                    canvas.renderAll();
                } else {
                    clearInterval(marchInterval);
                }
            }, 50);
        }
    }

    // Helper: Flood fill algorithm
    function floodFillSelection(imageData, startX, startY, targetColor, tolerance) {
        var width = imageData.width;
        var height = imageData.height;
        var visited = new Array(width * height).fill(false);
        var selectedPixels = [];
        var queue = [[startX, startY]];

        while (queue.length > 0) {
            var coords = queue.shift();
            var x = coords[0];
            var y = coords[1];
            var index = y * width + x;

            if (x < 0 || x >= width || y < 0 || y >= height || visited[index]) {
                continue;
            }

            var currentPixel = getPixelColor(imageData, x, y);
            if (!currentPixel || !colorMatch(currentPixel, targetColor, tolerance)) {
                continue;
            }

            visited[index] = true;
            selectedPixels.push(index);

            queue.push([x + 1, y]);
            queue.push([x - 1, y]);
            queue.push([x, y + 1]);
            queue.push([x, y - 1]);
        }

        return selectedPixels;
    }

    // Helper: Global color selection
    function globalColorSelection(imageData, targetColor, tolerance) {
        var width = imageData.width;
        var height = imageData.height;
        var selectedPixels = [];

        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                var pixel = getPixelColor(imageData, x, y);
                if (pixel && colorMatch(pixel, targetColor, tolerance)) {
                    selectedPixels.push(y * width + x);
                }
            }
        }

        return selectedPixels;
    }

    // Helper: Get pixel color
    function getPixelColor(imageData, x, y) {
        var index = (y * imageData.width + x) * 4;
        if (index >= 0 && index < imageData.data.length) {
            return {
                r: imageData.data[index],
                g: imageData.data[index + 1],
                b: imageData.data[index + 2],
                a: imageData.data[index + 3]
            };
        }
        return null;
    }

    // Helper: Color matching with tolerance
    function colorMatch(color1, color2, tolerance) {
        var rDiff = Math.abs(color1.r - color2.r);
        var gDiff = Math.abs(color1.g - color2.g);
        var bDiff = Math.abs(color1.b - color2.b);
        return (rDiff + gDiff + bDiff) <= tolerance * 3;
    }

    // Helper: Hex to RGB
    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    console.log('Phase 8 tools initialized successfully!');
    console.log('Overlay Edit JS fully loaded (Phase 8 - v1.8.0 - Selection & Paint Tools)!');
    console.log('Features: Dark Palleon-style UI, Nested groups, Boolean operations, Keyboard shortcuts, Context menu, Layer Export, Alignment Tools, Distribution, Magnetic Guides, Custom Canvas Sizes, Clipboard Detection, Brush Tool, Eraser Tool, Paint Bucket, Magic Wand, Raster Layers');
});