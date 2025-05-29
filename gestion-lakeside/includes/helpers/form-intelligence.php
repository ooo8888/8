<?php
// Form intelligence with cookie save/resume and pop-up triggers

function gl_save_quote_form_data() {
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['gl_quote_form_nonce']) && wp_verify_nonce($_POST['gl_quote_form_nonce'], 'gl_quote_form')) {
        $data = array(
            'project_type' => sanitize_text_field($_POST['project_type']),
            'location' => sanitize_text_field($_POST['location']),
            'preferred_dates' => sanitize_text_field($_POST['preferred_dates']),
        );
        setcookie('gl_quote_form_data', json_encode($data), time() + 3600 * 24 * 7, COOKIEPATH, COOKIE_DOMAIN);
        // TODO: Save to database
        wp_send_json_success('Data saved');
    }
    wp_send_json_error('Invalid request');
}
add_action('wp_ajax_gl_save_quote_form', 'gl_save_quote_form_data');
add_action('wp_ajax_nopriv_gl_save_quote_form', 'gl_save_quote_form_data');

// Handle quote form submission

// Implement form intelligence pop-up triggers for UX improvements
function gl_form_intelligence_popups() {
    if (is_page('quote-request')) {
        ?>
        <script>
        document.addEventListener('DOMContentLoaded', function() {
            let timer = setTimeout(function() {
                alert('Need help with your quote? Contact us for assistance!');
            }, 30000); // 30 seconds

            const form = document.querySelector('#gl-quote-form');
            if (form) {
                form.addEventListener('submit', function() {
                    clearTimeout(timer);
                });
            }
        });
        </script>
        <?php
    }
}
add_action('wp_footer', 'gl_form_intelligence_popups');
function gl_handle_quote_form_submission() {
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['gl_quote_form_nonce']) && wp_verify_nonce($_POST['gl_quote_form_nonce'], 'gl_quote_form')) {
        $project_type = sanitize_text_field($_POST['project_type']);
        $location = sanitize_text_field($_POST['location']);
        $preferred_dates = sanitize_text_field($_POST['preferred_dates']);

        // Handle file upload
        $project_photo_url = '';
        if (!empty($_FILES['project_photo']['name'])) {
            require_once(ABSPATH . 'wp-admin/includes/file.php');
            $uploaded = wp_handle_upload($_FILES['project_photo'], array('test_form' => false));
            if (isset($uploaded['url'])) {
                $project_photo_url = esc_url_raw($uploaded['url']);
            }
        }

        global $wpdb;
        $table_name = $wpdb->prefix . 'gl_quotes';
        $wpdb->insert($table_name, array(
            'project_type' => $project_type,
            'project_photo' => $project_photo_url,
            'location' => $location,
            'preferred_dates' => $preferred_dates,
            'submitted_at' => current_time('mysql')
        ));

        // Send notification email
        $admin_email = get_option('admin_email');
        $subject = 'Nouvelle demande de soumission - Gestion Lakeside';
        $message = "Type de projet: $project_type\nEmplacement: $location\nDates préférées: $preferred_dates\nPhoto: $project_photo_url";
        wp_mail($admin_email, $subject, $message);

        // Clear cookie
        setcookie('gl_quote_form_data', '', time() - 3600, COOKIEPATH, COOKIE_DOMAIN);

        wp_redirect(add_query_arg('submitted', 'true', wp_get_referer()));
        exit;
    }
}
add_action('init', 'gl_handle_quote_form_submission');

// Implement pop-up triggers and resume logic
function gl_enqueue_form_intelligence_scripts() {
    wp_enqueue_script('gl-form-intelligence', GL_PLUGIN_URL . 'assets/js/form-intelligence.js', array('jquery'), GL_VERSION, true);
    wp_localize_script('gl-form-intelligence', 'glFormIntelligence', array(
        'ajax_url' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('gl_form_intelligence_nonce'),
    ));
}
add_action('wp_enqueue_scripts', 'gl_enqueue_form_intelligence_scripts');

// AJAX handler to save form data
function gl_save_quote_form_data() {
    check_ajax_referer('gl_form_intelligence_nonce', 'nonce');
    $data = isset($_POST['data']) ? $_POST['data'] : array();
    $sanitized_data = array_map('sanitize_text_field', $data);
    setcookie('gl_quote_form_data', json_encode($sanitized_data), time() + 3600 * 24, COOKIEPATH, COOKIE_DOMAIN);
    wp_send_json_success();
}
add_action('wp_ajax_gl_save_quote_form', 'gl_save_quote_form_data');
add_action('wp_ajax_nopriv_gl_save_quote_form', 'gl_save_quote_form_data');



?>