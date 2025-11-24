<?php
/**
 * Plugin Name: Image Overlay Batch Processor
 * Description: Apply overlays to images in batch. Features brush, eraser, paint bucket, and magic wand tools with raster layer support.
 * Version: 1.8.0
 * Author: Your Name
 * Text Domain: image-overlay-batch
 */

if (!defined('ABSPATH')) {
    exit;
}

define('IOBP_VERSION', '1.8.0');
define('IOBP_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('IOBP_PLUGIN_URL', plugin_dir_url(__FILE__));

class Image_Overlay_Batch_Processor {

    private static $instance = null;

    // Canvas size configurations
    private $canvas_sizes = array(
        '800x450' => array(
            'canvas_width'  => 800,
            'canvas_height' => 450,
            'crop_width'    => 767,
            'crop_height'   => 430,
            'no_crop'       => false,
        ),
        '728x218' => array(
            'canvas_width'  => 728,
            'canvas_height' => 218,
            'crop_width'    => 710,
            'crop_height'   => 200,
            'no_crop'       => true,
        ),
    );

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        $this->create_upload_directory();
        $this->migrate_legacy_overlays();
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_assets'));
        add_action('wp_ajax_iobp_upload_overlay', array($this, 'ajax_upload_overlay'));
        add_action('wp_ajax_iobp_delete_overlay', array($this, 'ajax_delete_overlay'));
        add_action('wp_ajax_iobp_get_overlays', array($this, 'ajax_get_overlays'));
        add_action('wp_ajax_iobp_apply_overlay', array($this, 'ajax_apply_overlay'));
        add_action('wp_ajax_iobp_get_media_library', array($this, 'ajax_get_media_library'));
        add_action('wp_ajax_iobp_get_media_overlays', array($this, 'ajax_get_media_overlays'));
        add_action('wp_ajax_iobp_save_overlay_from_canvas', array($this, 'ajax_save_overlay_from_canvas'));
        add_action('wp_ajax_iobp_get_canvas_sizes', array($this, 'ajax_get_canvas_sizes'));
        add_action('wp_ajax_iobp_upload_font', array($this, 'ajax_upload_font'));
        add_action('wp_ajax_iobp_delete_font', array($this, 'ajax_delete_font'));
        add_action('wp_ajax_iobp_get_fonts', array($this, 'ajax_get_fonts'));
    }

    private function create_upload_directory() {
        $upload_dir = wp_upload_dir();
        $overlay_base = $upload_dir['basedir'] . '/overlays';
        if (!file_exists($overlay_base)) {
            wp_mkdir_p($overlay_base);
        }
        foreach (array_keys($this->canvas_sizes) as $size) {
            $size_dir = $overlay_base . '/' . $size;
            if (!file_exists($size_dir)) {
                wp_mkdir_p($size_dir);
            }
        }
        $font_dir = IOBP_PLUGIN_DIR . 'fonts';
        if (!file_exists($font_dir)) {
            wp_mkdir_p($font_dir);
        }
    }

    private function migrate_legacy_overlays() {
        $upload_dir = wp_upload_dir();
        $overlay_base = $upload_dir['basedir'] . '/overlays';
        $default_size_dir = $overlay_base . '/800x450';
        if (!is_dir($overlay_base)) {
            return;
        }
        $files = scandir($overlay_base);
        foreach ($files as $file) {
            if ($file === '.' || $file === '..' || is_dir($overlay_base . '/' . $file)) {
                continue;
            }
            if (preg_match('/\.(png|jpe?g)$/i', $file)) {
                $old_path = $overlay_base . '/' . $file;
                $new_path = $default_size_dir . '/' . $file;
                if (file_exists($old_path) && !file_exists($new_path)) {
                    rename($old_path, $new_path);
                }
            }
        }
    }

    private function get_font_dir() {
        return IOBP_PLUGIN_DIR . 'fonts';
    }

    private function get_font_url() {
        return IOBP_PLUGIN_URL . 'fonts/';
    }
    
    public function add_admin_menu() {
        add_menu_page(
            'Image Overlay',
            'Image Overlay',
            'upload_files',
            'image-overlay-batch',
            array($this, 'render_main_page'),
            'dashicons-images-alt2',
            25
        );
        add_submenu_page(
            'image-overlay-batch',
            'Editor',
            'Editor',
            'upload_files',
            'image-overlay-edit',
            array($this, 'render_overlay_edit_page')
        );
    }

    public function render_main_page() {
        include IOBP_PLUGIN_DIR . 'includes/admin-page.php';
    }

    public function render_overlay_edit_page() {
        include IOBP_PLUGIN_DIR . 'includes/overlay-edit-page.php';
    }

    public function enqueue_assets($hook) {
        if (strpos($hook, 'image-overlay-edit') !== false) {
            wp_enqueue_style('iobp-overlay-edit', IOBP_PLUGIN_URL . 'assets/css/overlay-edit.css', array(), IOBP_VERSION);
            wp_enqueue_media();
            wp_enqueue_script(
                'fabric-js',
                'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js',
                array(),
                '5.3.0',
                true
            );
            wp_enqueue_script(
                'iobp-overlay-ui',
                IOBP_PLUGIN_URL . 'assets/js/overlay-ui.js',
                array('jquery'),
                IOBP_VERSION,
                true
            );
            wp_enqueue_script(
                'iobp-overlay-edit',
                IOBP_PLUGIN_URL . 'assets/js/overlay-edit.js',
                array('jquery', 'fabric-js', 'iobp-overlay-ui'),
                IOBP_VERSION,
                true
            );
            wp_localize_script('iobp-overlay-edit', 'iobpOverlayEdit', array(
                'ajaxUrl'     => admin_url('admin-ajax.php'),
                'nonce'       => wp_create_nonce('iobp_overlay_edit_nonce'),
                'canvasSizes' => $this->canvas_sizes,
                'fontUrl'     => $this->get_font_url(),
            ));
            return;
        }
        if ('toplevel_page_image-overlay-batch' !== $hook) {
            return;
        }
        wp_enqueue_media();
        wp_enqueue_style('iobp-admin', IOBP_PLUGIN_URL . 'assets/css/admin.css', array(), IOBP_VERSION);
        wp_enqueue_script('iobp-admin', IOBP_PLUGIN_URL . 'assets/js/admin.js', array('jquery'), IOBP_VERSION, true);
        wp_localize_script('iobp-admin', 'iobpData', array(
            'ajaxUrl'     => admin_url('admin-ajax.php'),
            'nonce'       => wp_create_nonce('iobp_nonce'),
            'overlayUrl'  => $this->get_overlay_url(),
            'canvasSizes' => $this->canvas_sizes,
        ));
    }

    private function get_overlay_url($canvas_size = '800x450') {
        $upload_dir = wp_upload_dir();
        return $upload_dir['baseurl'] . '/overlays/' . $canvas_size . '/';
    }

    private function get_overlay_dir($canvas_size = '800x450') {
        $upload_dir = wp_upload_dir();
        return $upload_dir['basedir'] . '/overlays/' . $canvas_size . '/';
    }

    public function ajax_get_canvas_sizes() {
        check_ajax_referer('iobp_nonce', 'nonce');
        wp_send_json_success($this->canvas_sizes);
    }

    public function ajax_upload_font() {
        check_ajax_referer('iobp_overlay_edit_nonce', 'nonce');
        if (!current_user_can('upload_files')) {
            wp_send_json_error('Permission denied');
        }
        if (empty($_FILES['font'])) {
            wp_send_json_error('No file uploaded');
        }
        $file = $_FILES['font'];
        $file_ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowed_extensions = array('ttf', 'otf', 'woff', 'woff2');
        
        if (!in_array($file_ext, $allowed_extensions, true)) {
            wp_send_json_error('Only TTF, OTF, WOFF, and WOFF2 font files allowed');
        }
        $font_dir = $this->get_font_dir();
        $filename = sanitize_file_name($file['name']);
        $filepath = $font_dir . '/' . $filename;
        
        if (file_exists($filepath)) {
            wp_send_json_error('File already exists');
        }
        if (move_uploaded_file($file['tmp_name'], $filepath)) {
            wp_send_json_success(array(
                'filename' => $filename,
                'url'      => $this->get_font_url() . $filename,
            ));
        } else {
            wp_send_json_error('Upload failed');
        }
    }

    public function ajax_delete_font() {
        check_ajax_referer('iobp_overlay_edit_nonce', 'nonce');
        if (!current_user_can('upload_files')) {
            wp_send_json_error('Permission denied');
        }
        $filename = sanitize_file_name($_POST['filename']);
        $filepath = $this->get_font_dir() . '/' . $filename;
        
        if (file_exists($filepath) && unlink($filepath)) {
            wp_send_json_success();
        } else {
            wp_send_json_error('Delete failed');
        }
    }

    public function ajax_get_fonts() {
        check_ajax_referer('iobp_overlay_edit_nonce', 'nonce');
        $font_dir = $this->get_font_dir();
        $font_url = $this->get_font_url();
        $fonts = array();
        
        if (is_dir($font_dir)) {
            $files = scandir($font_dir);
            foreach ($files as $file) {
                if ($file !== '.' && $file !== '..' && preg_match('/\.(ttf|otf|woff|woff2)$/i', $file)) {
                    $fonts[] = array(
                        'filename' => $file,
                        'url'      => $font_url . $file,
                    );
                }
            }
        }
        wp_send_json_success($fonts);
    }

    public function ajax_upload_overlay() {
        check_ajax_referer('iobp_nonce', 'nonce');
        if (!current_user_can('upload_files')) {
            wp_send_json_error('Permission denied');
        }
        if (empty($_FILES['overlay'])) {
            wp_send_json_error('No file uploaded');
        }
        $canvas_size = isset($_POST['canvas_size']) ? sanitize_text_field($_POST['canvas_size']) : '800x450';
        if (!isset($this->canvas_sizes[$canvas_size])) {
            wp_send_json_error('Invalid canvas size');
        }
        $file = $_FILES['overlay'];
        $allowed_types = array('image/png', 'image/jpeg', 'image/jpg');
        if (!in_array($file['type'], $allowed_types, true)) {
            wp_send_json_error('Only PNG and JPG files allowed');
        }
        $overlay_dir = $this->get_overlay_dir($canvas_size);
        $filename    = sanitize_file_name($file['name']);
        $filepath    = $overlay_dir . $filename;
        if (file_exists($filepath)) {
            wp_send_json_error('File already exists');
        }
        if (move_uploaded_file($file['tmp_name'], $filepath)) {
            wp_send_json_success(array(
                'filename' => $filename,
                'url'      => $this->get_overlay_url($canvas_size) . $filename,
            ));
        } else {
            wp_send_json_error('Upload failed');
        }
    }

    public function ajax_delete_overlay() {
        check_ajax_referer('iobp_nonce', 'nonce');
        if (!current_user_can('upload_files')) {
            wp_send_json_error('Permission denied');
        }
        $filename = sanitize_file_name($_POST['filename']);
        $canvas_size = isset($_POST['canvas_size']) ? sanitize_text_field($_POST['canvas_size']) : '800x450';
        if (!isset($this->canvas_sizes[$canvas_size])) {
            wp_send_json_error('Invalid canvas size');
        }
        $filepath = $this->get_overlay_dir($canvas_size) . $filename;
        if (file_exists($filepath) && unlink($filepath)) {
            wp_send_json_success();
        } else {
            wp_send_json_error('Delete failed');
        }
    }

    public function ajax_get_overlays() {
        check_ajax_referer('iobp_nonce', 'nonce');
        $canvas_size = isset($_POST['canvas_size']) ? sanitize_text_field($_POST['canvas_size']) : '800x450';
        if (!isset($this->canvas_sizes[$canvas_size])) {
            wp_send_json_error('Invalid canvas size');
        }
        $overlay_dir = $this->get_overlay_dir($canvas_size);
        $overlay_url = $this->get_overlay_url($canvas_size);
        $overlays    = array();
        if (is_dir($overlay_dir)) {
            $files = scandir($overlay_dir);
            foreach ($files as $file) {
                if ($file !== '.' && $file !== '..' && preg_match('/\.(png|jpe?g)$/i', $file)) {
                    $overlays[] = array(
                        'filename' => $file,
                        'url'      => $overlay_url . $file,
                        'source'   => 'directory',
                    );
                }
            }
        }
        wp_send_json_success($overlays);
    }

    public function ajax_get_media_overlays() {
        check_ajax_referer('iobp_nonce', 'nonce');
        
        $canvas_size = isset($_POST['canvas_size']) ? sanitize_text_field($_POST['canvas_size']) : '800x450';
        if (!isset($this->canvas_sizes[$canvas_size])) {
            wp_send_json_error('Invalid canvas size');
        }
        
        $config = $this->canvas_sizes[$canvas_size];
        
        // Get all images from media library matching the canvas size dimensions
        $args = array(
            'post_type'      => 'attachment',
            'post_mime_type' => 'image',
            'post_status'    => 'inherit',
            'posts_per_page' => -1,
            'orderby'        => 'date',
            'order'          => 'DESC',
        );
        
        $attachments = get_posts($args);
        $overlays = array();
        
        foreach ($attachments as $attachment) {
            $metadata = wp_get_attachment_metadata($attachment->ID);
            $width = isset($metadata['width']) ? $metadata['width'] : 0;
            $height = isset($metadata['height']) ? $metadata['height'] : 0;
            
            // Filter by canvas size dimensions only
            if ($width == $config['canvas_width'] && $height == $config['canvas_height']) {
                $overlays[] = array(
                    'id'       => $attachment->ID,
                    'filename' => basename(get_attached_file($attachment->ID)),
                    'url'      => wp_get_attachment_url($attachment->ID),
                    'source'   => 'media_library',
                );
            }
        }
        
        wp_send_json_success($overlays);
    }

    public function ajax_get_media_library() {
        check_ajax_referer('iobp_nonce', 'nonce');
        
        // Get page number from request, default to 1
        $page = isset($_POST['page']) ? absint($_POST['page']) : 1;
        $per_page = 20;
        
        $args = array(
            'post_type'      => 'attachment',
            'post_mime_type' => 'image',
            'post_status'    => 'inherit',
            'posts_per_page' => $per_page,
            'paged'          => $page,
            'orderby'        => 'date',
            'order'          => 'DESC',
        );
        
        // Get total count for pagination
        $count_args = $args;
        $count_args['posts_per_page'] = -1;
        $count_args['fields'] = 'ids';
        $total_images = count(get_posts($count_args));
        
        $images  = get_posts($args);
        $results = array();
        
        foreach ($images as $image) {
            $results[] = array(
                'id'    => $image->ID,
                'url'   => wp_get_attachment_url($image->ID),
                'title' => $image->post_title,
            );
        }
        
        wp_send_json_success(array(
            'images'      => $results,
            'page'        => $page,
            'per_page'    => $per_page,
            'total'       => $total_images,
            'total_pages' => ceil($total_images / $per_page),
        ));
    }

    public function ajax_apply_overlay() {
        check_ajax_referer('iobp_nonce', 'nonce');
        if (!current_user_can('upload_files')) {
            wp_send_json_error('Permission denied');
        }
        $image_ids        = isset($_POST['image_ids']) ? array_map('intval', $_POST['image_ids']) : array();
        $overlay_source   = isset($_POST['overlay_source']) ? sanitize_text_field($_POST['overlay_source']) : 'directory';
        $canvas_size      = isset($_POST['canvas_size']) ? sanitize_text_field($_POST['canvas_size']) : '800x450';
        
        if (empty($image_ids)) {
            wp_send_json_error('Missing parameters');
        }
        if (!isset($this->canvas_sizes[$canvas_size])) {
            wp_send_json_error('Invalid canvas size');
        }
        
        // Determine overlay path based on source
        if ($overlay_source === 'media_library') {
            $overlay_id = isset($_POST['overlay_id']) ? intval($_POST['overlay_id']) : 0;
            if (!$overlay_id) {
                wp_send_json_error('Missing overlay ID');
            }
            $overlay_path = get_attached_file($overlay_id);
            if (!$overlay_path || !file_exists($overlay_path)) {
                wp_send_json_error('Overlay not found in media library');
            }
        } else {
            $overlay_filename = isset($_POST['overlay']) ? sanitize_file_name($_POST['overlay']) : '';
            if (empty($overlay_filename)) {
                wp_send_json_error('Missing overlay filename');
            }
            $overlay_path = $this->get_overlay_dir($canvas_size) . $overlay_filename;
            if (!file_exists($overlay_path)) {
                wp_send_json_error('Overlay not found');
            }
        }
        
        $results = array();
        foreach ($image_ids as $image_id) {
            $result    = $this->process_image($image_id, $overlay_path, $canvas_size);
            $results[] = $result;
        }
        wp_send_json_success($results);
    }

    public function ajax_save_overlay_from_canvas() {
        check_ajax_referer('iobp_overlay_edit_nonce', 'nonce');
        if (!current_user_can('upload_files')) {
            wp_send_json_error('Permission denied');
        }
        $filename    = isset($_POST['filename']) ? sanitize_file_name(wp_unslash($_POST['filename'])) : '';
        $image_data  = isset($_POST['image_data']) ? $_POST['image_data'] : '';
        $canvas_size = isset($_POST['canvas_size']) ? sanitize_text_field($_POST['canvas_size']) : '800x450';
        
        if (!$filename || !$image_data) {
            wp_send_json_error('Missing data');
        }
        if (!isset($this->canvas_sizes[$canvas_size])) {
            wp_send_json_error('Invalid canvas size');
        }
        if (strpos($image_data, 'base64,') === false) {
            wp_send_json_error('Invalid image data');
        }
        
        list(, $data) = explode('base64,', $image_data, 2);
        $decoded      = base64_decode($data);
        if (!$decoded) {
            wp_send_json_error('Failed to decode image data');
        }
        
        // Ensure filename has .png extension
        if (!preg_match('/\.png$/i', $filename)) {
            $filename .= '.png';
        }
        
        // Save to WordPress uploads directory
        $upload_dir = wp_upload_dir();
        $filepath   = $upload_dir['path'] . '/' . $filename;
        
        if (file_put_contents($filepath, $decoded) === false) {
            wp_send_json_error('Failed to write file');
        }
        
        // Create attachment
        $filetype   = wp_check_filetype($filename);
        $attachment = array(
            'post_mime_type' => $filetype['type'],
            'post_title'     => sanitize_file_name(pathinfo($filename, PATHINFO_FILENAME)),
            'post_content'   => '',
            'post_status'    => 'inherit',
        );
        
        $attach_id = wp_insert_attachment($attachment, $filepath);
        
        require_once ABSPATH . 'wp-admin/includes/image.php';
        $attach_data = wp_generate_attachment_metadata($attach_id, $filepath);
        wp_update_attachment_metadata($attach_id, $attach_data);
        
        // Mark as overlay
        update_post_meta($attach_id, '_iobp_overlay', '1');
        update_post_meta($attach_id, '_iobp_canvas_size', $canvas_size);
        
        wp_send_json_success(array(
            'id'       => $attach_id,
            'filename' => $filename,
            'url'      => wp_get_attachment_url($attach_id),
        ));
    }

    private function process_image($image_id, $overlay_path, $canvas_size = '800x450') {
        $image_path = get_attached_file($image_id);
        if (!$image_path || !file_exists($image_path)) {
            return array('id' => $image_id, 'success' => false, 'message' => 'Image not found');
        }
        $config = $this->canvas_sizes[$canvas_size];
        $canvas_width  = $config['canvas_width'];
        $canvas_height = $config['canvas_height'];
        $crop_width    = isset($config['crop_width']) ? $config['crop_width'] : $canvas_width;
        $crop_height   = isset($config['crop_height']) ? $config['crop_height'] : $canvas_height;
        $no_crop       = isset($config['no_crop']) ? $config['no_crop'] : false;
        $overlay_info = getimagesize($overlay_path);
        $overlay_type = $overlay_info[2];
        $overlay_width = $overlay_info[0];
        $overlay_height = $overlay_info[1];
        if ($overlay_width !== $canvas_width || $overlay_height !== $canvas_height) {
            return array(
                'id' => $image_id,
                'success' => false,
                'message' => 'Overlay dimensions (' . $overlay_width . 'x' . $overlay_height . ') do not match selected canvas size (' . $canvas_width . 'x' . $canvas_height . ').'
            );
        }
        if ($overlay_type === IMAGETYPE_PNG) {
            $overlay = imagecreatefrompng($overlay_path);
            imagealphablending($overlay, true);
            imagesavealpha($overlay, true);
        } elseif ($overlay_type === IMAGETYPE_JPEG) {
            $overlay = imagecreatefromjpeg($overlay_path);
        } else {
            return array('id' => $image_id, 'success' => false, 'message' => 'Unsupported overlay format');
        }
        $image_info = getimagesize($image_path);
        $image_type = $image_info[2];
        if ($image_type === IMAGETYPE_PNG) {
            $source = imagecreatefrompng($image_path);
        } elseif ($image_type === IMAGETYPE_JPEG) {
            $source = imagecreatefromjpeg($image_path);
        } else {
            imagedestroy($overlay);
            return array('id' => $image_id, 'success' => false, 'message' => 'Unsupported image format');
        }
        $canvas = imagecreatetruecolor($canvas_width, $canvas_height);
        imagealphablending($canvas, false);
        imagesavealpha($canvas, true);
        $transparent = imagecolorallocatealpha($canvas, 0, 0, 0, 127);
        imagefill($canvas, 0, 0, $transparent);
        if ($no_crop) {
            imagealphablending($canvas, true);
            imagecopy(
                $canvas,
                $source,
                0,
                0,
                0,
                0,
                min(imagesx($source), $canvas_width),
                min(imagesy($source), $canvas_height)
            );
        } else {
            $x_offset = ($canvas_width - $crop_width) / 2;
            $y_offset = ($canvas_height - $crop_height) / 2;
            imagealphablending($canvas, true);
            imagecopyresampled(
                $canvas,
                $source,
                $x_offset,
                $y_offset,
                0,
                0,
                $crop_width,
                $crop_height,
                imagesx($source),
                imagesy($source)
            );
        }
        imagecopy($canvas, $overlay, 0, 0, 0, 0, $canvas_width, $canvas_height);
        $upload_dir    = wp_upload_dir();
        $filename      = basename($image_path);
        $unique_suffix = '-' . time();
        $new_filename  = pathinfo($filename, PATHINFO_FILENAME) . $unique_suffix . '-overlay.' . pathinfo($filename, PATHINFO_EXTENSION);
        $new_filepath  = $upload_dir['path'] . '/' . $new_filename;
        $saved = false;
        if ($image_type === IMAGETYPE_PNG) {
            imagesavealpha($canvas, true);
            $saved = imagepng($canvas, $new_filepath, 9);
        } else {
            $saved = imagejpeg($canvas, $new_filepath, 95);
        }
        imagedestroy($canvas);
        imagedestroy($overlay);
        imagedestroy($source);
        if ($saved) {
            $filetype   = wp_check_filetype($new_filename);
            $attachment = array(
                'post_mime_type' => $filetype['type'],
                'post_title'     => sanitize_file_name($new_filename),
                'post_content'   => '',
                'post_status'    => 'inherit',
            );
            $attach_id = wp_insert_attachment($attachment, $new_filepath);
            require_once ABSPATH . 'wp-admin/includes/image.php';
            $attach_data = wp_generate_attachment_metadata($attach_id, $new_filepath);
            wp_update_attachment_metadata($attach_id, $attach_data);
            return array(
                'id'      => $image_id,
                'success' => true,
                'new_id'  => $attach_id,
                'url'     => wp_get_attachment_url($attach_id),
            );
        }
        return array('id' => $image_id, 'success' => false, 'message' => 'Failed to save');
    }
}

// Initialize plugin
Image_Overlay_Batch_Processor::get_instance();