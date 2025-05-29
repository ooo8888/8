<?php
// Template loader to load custom templates based on query vars
function gl_template_loader($template) {
    if (is_page('a-propos')) {
        $new_template = GL_PLUGIN_DIR . 'templates/about.php';
        if (file_exists($new_template)) {
            return $new_template;
        }
    } elseif (is_page('services')) {
        $new_template = GL_PLUGIN_DIR . 'templates/services.php';
        if (file_exists($new_template)) {
            return $new_template;
        }
    } elseif (is_page('portfolio')) {
        $new_template = GL_PLUGIN_DIR . 'templates/portfolio.php';
        if (file_exists($new_template)) {
            return $new_template;
        }
    } elseif (is_page('soumission')) {
        $new_template = GL_PLUGIN_DIR . 'templates/quote-request.php';
        if (file_exists($new_template)) {
            return $new_template;
        }
    } elseif (is_page('blog')) {
        $new_template = GL_PLUGIN_DIR . 'templates/blog.php';
        if (file_exists($new_template)) {
            return $new_template;
        }
    } elseif (is_page('temoignages')) {
        $new_template = GL_PLUGIN_DIR . 'templates/testimonials.php';
        if (file_exists($new_template)) {
            return $new_template;
        }
    }
    return $template;
}
// Template loader logic moved here after refactor
add_filter('template_include', 'gl_template_loader');
?>