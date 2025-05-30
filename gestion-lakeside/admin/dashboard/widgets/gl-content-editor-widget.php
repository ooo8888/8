<?php
// Content Editor Widget for Gestion Lakeside Dashboard
function gl_render_content_editor_widget() {
    $content = get_option('gl_homepage_content', '');
    ?>
    <div class="gl-widget gl-content-editor-widget">
        <h3><?php _e('Edit Homepage Content', 'gestion-lakeside'); ?></h3>
        <form method="post">
            <?php wp_nonce_field('gl_content_editor_action', 'gl_content_editor_nonce'); ?>
            <?php wp_editor($content, 'gl_homepage_content', array('textarea_name' => 'gl_homepage_content', 'media_buttons' => true, 'textarea_rows' => 10)); ?>
            <input type="submit" class="button button-primary" value="<?php _e('Save Content', 'gestion-lakeside'); ?>" />
        </form>
        <?php
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['gl_homepage_content'])) {
            if (check_admin_referer('gl_content_editor_action', 'gl_content_editor_nonce')) {
                update_option('gl_homepage_content', wp_kses_post($_POST['gl_homepage_content']));
                echo '<div class="updated notice"><p>' . __('Homepage content updated.', 'gestion-lakeside') . '</p></div>';
            }
        }
        ?>
    </div>
        <style>
        .gl-content-editor-widget .button-primary { background: linear-gradient(90deg,#1E90FF,#48BFF9); border: none; }
        .gl-content-editor-widget { box-shadow: 0 2px 16px rgba(30,144,255,0.08), 0 1.5px 6px rgba(72,191,249,0.07); border-radius: 12px; }
        </style>
        <script>
        // JS i18n helper for dashboard widgets
        function gl_i18n(str) {
          if (typeof window.gl_dashboard_i18n === 'object' && window.gl_dashboard_i18n[str]) {
            return window.gl_dashboard_i18n[str];
          }
          return str;
        }

        // GSAP microinteraction: Animate content editor widget on load
        document.addEventListener('DOMContentLoaded', function() {
          if (window.gsap && document.querySelector('.gl-content-editor-widget')) {
            gsap.from('.gl-content-editor-widget', {opacity:0, y:40, duration:0.8, delay:0.3, ease:'power2.out'});
          }
        });
        </script>
    <?php
}
