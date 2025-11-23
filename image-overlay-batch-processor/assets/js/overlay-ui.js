/**
 * Overlay Editor UI Enhancements
 * Handles sidebar toggle and collapsible sections
 */

jQuery(document).ready(function($) {
    console.log('Overlay UI Enhancements Loading...');

    // Sidebar Toggle for Mobile
    $('#iobp-menu-toggle').on('click', function() {
        const $sidebar = $('#iobp-sidebar');
        const $overlay = $('.iobp-sidebar-overlay');

        $sidebar.toggleClass('active');

        // Create overlay if it doesn't exist
        if ($overlay.length === 0) {
            $('<div class="iobp-sidebar-overlay"></div>')
                .insertAfter('#iobp-sidebar')
                .on('click', function() {
                    $sidebar.removeClass('active');
                    $(this).removeClass('active');
                });
        }

        $('.iobp-sidebar-overlay').toggleClass('active');
    });

    // Close sidebar when clicking overlay
    $(document).on('click', '.iobp-sidebar-overlay', function() {
        $('#iobp-sidebar').removeClass('active');
        $(this).removeClass('active');
    });

    // Collapsible Sidebar Sections
    $('.iobp-section-header').on('click', function() {
        const $header = $(this);
        const $content = $header.next('.iobp-section-content');
        const section = $header.data('section');

        // Toggle collapsed state
        $header.toggleClass('collapsed');
        $content.toggleClass('hidden');

        // Save state to localStorage
        const isCollapsed = $header.hasClass('collapsed');
        localStorage.setItem('iobp-section-' + section, isCollapsed ? 'collapsed' : 'expanded');
    });

    // Restore collapsed states from localStorage
    $('.iobp-section-header').each(function() {
        const $header = $(this);
        const $content = $header.next('.iobp-section-content');
        const section = $header.data('section');
        const savedState = localStorage.getItem('iobp-section-' + section);

        if (savedState === 'collapsed') {
            $header.addClass('collapsed');
            $content.addClass('hidden');
        }
    });

    // Show/hide gradient controls based on type
    $('#iobp-gradient-type').on('change', function() {
        const $controls = $('#iobp-gradient-controls');
        const $angleControl = $('#iobp-gradient-angle-control');

        if ($(this).val() === 'none') {
            $controls.removeClass('active').hide();
        } else {
            $controls.addClass('active').show();

            // Show/hide angle control based on gradient type
            if ($(this).val() === 'linear') {
                $angleControl.show();
            } else {
                $angleControl.hide();
            }
        }
    });

    // Initialize gradient controls visibility
    if ($('#iobp-gradient-type').val() !== 'none') {
        $('#iobp-gradient-controls').addClass('active').show();
    }

    // Handle window resize
    let resizeTimeout;
    $(window).on('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            // Close mobile sidebar on desktop resize
            if ($(window).width() > 768) {
                $('#iobp-sidebar').removeClass('active');
                $('.iobp-sidebar-overlay').removeClass('active');
            }
        }, 250);
    });

    console.log('Overlay UI Enhancements Loaded');
});
