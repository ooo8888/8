<?php
// Helper functions for Gestion Lakeside plugin

// Sanitize text input
function gl_sanitize_text($text) {
    return sanitize_text_field($text);
}

// Create database tables
function gl_create_database_tables() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'gl_quotes';
    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE IF NOT EXISTS $table_name (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        project_type varchar(100) NOT NULL,
        project_photo varchar(255) DEFAULT NULL,
        location varchar(255) NOT NULL,
        preferred_dates varchar(255) DEFAULT NULL,
        submitted_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
        PRIMARY KEY  (id)
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
}

// Set default options
function gl_set_default_options() {
    if (get_option('gl_ai_blog_enabled') === false) {
        update_option('gl_ai_blog_enabled', true);
    }
}

// Register custom post types
function gl_register_post_types() {
    // Example: Register portfolio post type if needed
}

// Register taxonomies
function gl_register_taxonomies() {
    // Example: Register portfolio categories
}

// Register shortcodes
function gl_register_shortcodes() {
    add_shortcode('gl_home_hero', 'gl_home_hero_shortcode');
    add_shortcode('gl_testimonial_carousel', 'gl_testimonial_carousel_shortcode');
    add_shortcode('gl_language_toggle', 'gl_language_toggle_shortcode');
}

// Testimonial carousel shortcode
function gl_testimonial_carousel_shortcode() {
    ob_start();
    ?>
    <div class="testimonial-carousel" style="display: flex; overflow-x: auto; gap: 2rem; scroll-snap-type: x mandatory;">
        <div class="testimonial-item" style="min-width: 300px; background: var(--color-midnight-black); border: 1px solid var(--color-glacier-blue); border-radius: 8px; padding: 1rem; scroll-snap-align: start;">
            <p><strong>Une équipe de <span style="color: var(--color-glacier-blue);">confiance</span>, toujours <span style="color: var(--color-glacier-blue);">à l'écoute</span>.</strong></p>
            <p style="text-align: right; font-style: italic;">- Client A</p>
        </div>
        <div class="testimonial-item" style="min-width: 300px; background: var(--color-midnight-black); border: 1px solid var(--color-glacier-blue); border-radius: 8px; padding: 1rem; scroll-snap-align: start;">
            <p><strong>Jamais <span style="color: var(--color-glacier-blue);">déçu</span> par leur professionnalisme.</strong></p>
            <p style="text-align: right; font-style: italic;">- Client B</p>
        </div>
        <div class="testimonial-item" style="min-width: 300px; background: var(--color-midnight-black); border: 1px solid var(--color-glacier-blue); border-radius: 8px; padding: 1rem; scroll-snap-align: start;">
            <p><strong>Qualité et honnêteté au rendez-vous.</strong></p>
            <p style="text-align: right; font-style: italic;">- Client C</p>
        </div>
    </div>
    <?php
    return ob_get_clean();
}

// Enqueue assets
function gl_enqueue_assets() {
    wp_enqueue_style('gl-style', GL_PLUGIN_URL . 'assets/css/style.css', array(), GL_VERSION);
    wp_enqueue_script('gsap', 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.4/gsap.min.js', array(), '3.11.4', true);
    wp_enqueue_script('gl-scripts', GL_PLUGIN_URL . 'assets/js/scripts.js', array('gsap'), GL_VERSION, true);
}
// Get quote count
function gl_get_quote_count() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'gl_quotes';
    return (int)$wpdb->get_var("SELECT COUNT(*) FROM $table_name");
}

// Get blog post count
function gl_get_blog_post_count() {
    $count = wp_count_posts('post');
    return isset($count->publish) ? (int)$count->publish : 0;
}

// Get recent blog posts (titles and links)
function gl_get_recent_blog_posts($limit = 5) {
    $posts = get_posts(array('post_type' => 'post', 'posts_per_page' => $limit));
    $result = array();
    foreach ($posts as $post) {
        $result[] = array(
            'title' => get_the_title($post->ID),
            'url' => get_permalink($post->ID)
        );
    }
    return $result;
}


?>