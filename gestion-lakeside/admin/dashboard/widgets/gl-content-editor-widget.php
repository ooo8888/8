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
    <?php
}
