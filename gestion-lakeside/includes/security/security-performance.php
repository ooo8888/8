<?php
// Security and performance optimizations for Gestion Lakeside plugin

// Sanitize all inputs
function gl_sanitize_input($data) {
    if (is_array($data)) {
        return array_map('gl_sanitize_input', $data);
    }
    return sanitize_text_field($data);
}

// Limit upload file size
function gl_limit_upload_size($file) {
    $max_size = 2 * 1024 * 1024; // 2MB
    if ($file['size'] > $max_size) {
        $file['error'] = __('File size exceeds 2MB limit.', 'gestion-lakeside');
    }
    return $file;
}
add_filter('wp_handle_upload_prefilter', 'gl_limit_upload_size');

// Lazy load images
function gl_lazy_load_images($content) {
    $content = preg_replace('/<img(.*?)>/', '<img loading="lazy" $1>', $content);
    return $content;
}
add_filter('the_content', 'gl_lazy_load_images');

// Enable gzip compression
function gl_enable_gzip_compression() {
    if (!ob_start('ob_gzhandler')) {
        ob_start();
    }
}
add_action('init', 'gl_enable_gzip_compression');

// Minify CSS and JS (basic)
function gl_minify_assets($buffer) {
    $buffer = preg_replace('/\/\*.*?\*\//s', '', $buffer); // Remove comments
    $buffer = preg_replace('/\s+/', ' ', $buffer); // Remove excess whitespace
    $buffer = str_replace(array("\n", "\r", "\t"), '', $buffer);
    return $buffer;
}

function gl_start_minify() {
    ob_start('gl_minify_assets');
}

function gl_end_minify() {
    ob_end_flush();
}

add_action('wp_head', 'gl_start_minify');
add_action('wp_footer', 'gl_end_minify');

?>