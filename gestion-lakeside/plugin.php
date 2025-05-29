<?php
/**
 * Plugin Name: Gestion Lakeside Inc. Portfolio
 * Description: AI-powered, elite portfolio website plugin for Gestion Lakeside Inc.
 * Version: 1.0.0
 * Author: OpenHands
 * Text Domain: gestion-lakeside
 * Domain Path: /languages
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define constants
define('GL_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('GL_PLUGIN_URL', plugin_dir_url(__FILE__));

define('GL_VERSION', '1.0.0');

// Load text domain for translations
function gl_load_textdomain() {
    load_plugin_textdomain('gestion-lakeside', false, dirname(plugin_basename(__FILE__)) . '/languages');
}

// Dynamic locale switching for admin dashboard (EN/FR)
add_filter('locale', function($locale) {
    if (is_admin() && isset($_GET['page']) && $_GET['page'] === 'gl-dashboard') {
        $user_id = get_current_user_id();
        $lang = get_user_meta($user_id, 'gl_dashboard_lang', true);
        if ($lang === 'fr') return 'fr_FR';
        if ($lang === 'en') return 'en_US';
    }
    return $locale;
});

add_action('plugins_loaded', 'gl_load_textdomain');

// Include required files
require_once GL_PLUGIN_DIR . 'includes/helpers/helpers.php';
require_once GL_PLUGIN_DIR . 'admin/dashboard/admin-dashboard.php';
require_once GL_PLUGIN_DIR . 'ai/ai-blog-generator.php';
require_once GL_PLUGIN_DIR . 'includes/seo/seo-engine.php';
require_once GL_PLUGIN_DIR . 'includes/translations/translation.php';
require_once GL_PLUGIN_DIR . 'includes/ux/ux-triggers.php';
require_once GL_PLUGIN_DIR . 'includes/helpers/form-intelligence.php';
require_once GL_PLUGIN_DIR . 'templates/partials/template-loader.php';

// Activation hook
function gl_activate_plugin() {
    // Setup default options, database tables, etc.
    gl_create_database_tables();
    gl_set_default_options();
}
register_activation_hook(__FILE__, 'gl_activate_plugin');

// Deactivation hook
function gl_deactivate_plugin() {
    // Cleanup if needed
}
register_deactivation_hook(__FILE__, 'gl_deactivate_plugin');

// Initialize plugin
function gl_init() {
    // Register custom post types, taxonomies, shortcodes, etc.
    gl_register_post_types();
    gl_register_taxonomies();
    gl_register_shortcodes();
    gl_enqueue_assets();
}
add_action('init', 'gl_init');

// Enqueue scripts and styles
function gl_enqueue_assets() {
    wp_enqueue_style('gl-style', GL_PLUGIN_URL . 'assets/css/style.css', array(), GL_VERSION);
    wp_enqueue_script('gsap', 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.4/gsap.min.js', array(), '3.11.4', true);
    wp_enqueue_script('gl-scripts', GL_PLUGIN_URL . 'assets/js/scripts.js', array('gsap'), GL_VERSION, true);
}

// Load templates
function gl_template_loader($template) {
    $template_name = get_query_var('gl_template');
    if ($template_name) {
        $custom_template = GL_PLUGIN_DIR . 'templates/' . $template_name . '.php';
        if (file_exists($custom_template)) {
            return $custom_template;
        }
    }
    return $template;
}
add_filter('template_include', 'gl_template_loader');

// Shortcode example for home page hero
function gl_home_hero_shortcode() {
    ob_start();
    include GL_PLUGIN_DIR . 'templates/main/home-hero.php';
    return ob_get_clean();
}

// Register all shortcodes
add_action('init', 'gl_register_shortcodes');

// More plugin code to be added in respective files

?>