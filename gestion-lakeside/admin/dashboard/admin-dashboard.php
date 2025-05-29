<?php
// Admin dashboard functions for Gestion Lakeside plugin

// Add admin menu
function gl_admin_menu() {
    add_menu_page(
        __('Gestion Lakeside Dashboard', 'gestion-lakeside'),
        __('Gestion Lakeside', 'gestion-lakeside'),
        'manage_options',
        'gl-dashboard',
        'gl_dashboard_page',
        'dashicons-building',
        2
    );
}

// Content editing UI using WordPress WYSIWYG editor
function gl_render_content_editor() {
    $content = get_option('gl_homepage_content', '');
    echo '<h3>' . __('Edit Homepage Content', 'gestion-lakeside') . '</h3>';
    echo '<form method="post">';
    wp_nonce_field('gl_content_editor_action', 'gl_content_editor_nonce');
    wp_editor($content, 'gl_homepage_content', array('textarea_name' => 'gl_homepage_content', 'media_buttons' => true, 'textarea_rows' => 10));
    echo '<input type="submit" class="button button-primary" value="' . __('Save Content', 'gestion-lakeside') . '" />';
    echo '</form>';
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['gl_homepage_content'])) {
        if (check_admin_referer('gl_content_editor_action', 'gl_content_editor_nonce')) {
            update_option('gl_homepage_content', wp_kses_post($_POST['gl_homepage_content']));
            echo '<div class="updated notice"><p>' . __('Homepage content updated.', 'gestion-lakeside') . '</p></div>';
        }
    }
}

// Extend dashboard page to include content editor
function gl_dashboard_page() {
    if (!current_user_can('manage_options')) {
        wp_die(__('You do not have sufficient permissions to access this page.'));
    }

    $quote_count = gl_get_quote_count();
    $ai_blog_enabled = get_option('gl_ai_blog_enabled', true);

    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['gl_ai_blog_toggle'])) {
        check_admin_referer('gl_ai_blog_toggle_action', 'gl_ai_blog_toggle_nonce');
        $ai_blog_enabled = isset($_POST['gl_ai_blog_enabled']) ? true : false;
        update_option('gl_ai_blog_enabled', $ai_blog_enabled);
        echo '<div class="updated notice"><p>' . __('AI Blog Generator setting updated.', 'gestion-lakeside') . '</p></div>';
    }

    ?>
    <div class="wrap">
        <h1><?php _e('Gestion Lakeside Dashboard', 'gestion-lakeside'); ?></h1>
        <h2><?php _e('Quote Requests', 'gestion-lakeside'); ?></h2>
        <p><?php printf(__('Total quote requests: %d', 'gestion-lakeside'), $quote_count); ?></p>

        <h2><?php _e('AI Blog Generator', 'gestion-lakeside'); ?></h2>
        <form method="post">
            <?php wp_nonce_field('gl_ai_blog_toggle_action', 'gl_ai_blog_toggle_nonce'); ?>
            <label for="gl_ai_blog_enabled"><?php _e('Enable AI Blog Generator', 'gestion-lakeside'); ?></label>
            <input type="checkbox" name="gl_ai_blog_enabled" id="gl_ai_blog_enabled" value="1" <?php checked($ai_blog_enabled); ?> />
            <input type="submit" name="gl_ai_blog_toggle" class="button button-primary" value="<?php _e('Save', 'gestion-lakeside'); ?>" />
        </form>

        <h2><?php _e('Content Management', 'gestion-lakeside'); ?></h2>
        <?php gl_render_content_editor(); ?>
    </div>
    <div class="gl-dashboard-widgets">
        <div class="gl-widget gl-analytics-widget">
            <h3><i class="fa-solid fa-chart-line"></i> Analytics</h3>
            <canvas id="gl-analytics-chart" height="120"></canvas>
        </div>
    </div>
    <!-- Advanced Dashboard UI: GSAP, SVG, and Microinteractions -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Animate dashboard cards
      gsap.from('.wrap h1, .wrap h2, .wrap p, .wrap form', {
        y: 40,
        opacity: 0,
        stagger: 0.12,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.2
      });
      // Microinteraction for toggles/buttons
      document.querySelectorAll('.button, input[type=checkbox]').forEach(el => {
        el.addEventListener('mouseenter', () => {
          gsap.to(el, {scale: 1.06, boxShadow: '0 4px 24px #48BFF9', duration: 0.18});
        });
        el.addEventListener('mouseleave', () => {
          gsap.to(el, {scale: 1, boxShadow: 'none', duration: 0.18});
        });
      });
      // Chart.js demo data for analytics
      if (document.getElementById('gl-analytics-chart')) {
        new Chart(document.getElementById('gl-analytics-chart').getContext('2d'), {
          type: 'line',
          data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
              label: 'Quote Requests',
              data: [12, 19, 7, 14, 20, 13, 17],
              borderColor: '#48BFF9',
              backgroundColor: 'rgba(72,191,249,0.1)',
              tension: 0.4,
              fill: true
            }]
          },
          options: {
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
          }
        });
      }
    });
    </script>
    <?php
}


// Extend dashboard page to include image upload form
function gl_render_image_upload_form() {
    ?>
    <h3><?php _e('Upload Images', 'gestion-lakeside'); ?></h3>
    <form id="gl-image-upload-form" method="post" enctype="multipart/form-data">
        <input type="file" name="gl_image_upload" id="gl_image_upload" accept="image/*" />
        <input type="submit" class="button button-primary" value="<?php _e('Upload', 'gestion-lakeside'); ?>" />
    </form>
    <div id="gl-upload-result"></div>
    <script>
    document.getElementById('gl-image-upload-form').addEventListener('submit', function(e) {
        e.preventDefault();
        var formData = new FormData(this);
        fetch(ajaxurl, {
            method: 'POST',
            body: formData
        }).then(response => response.json()).then(data => {
            var resultDiv = document.getElementById('gl-upload-result');
            if (data.success) {
                resultDiv.innerHTML = '<p style="color:green;">' + '<?php _e('Upload successful!', 'gestion-lakeside'); ?>' + '</p>';
            } else {
                resultDiv.innerHTML = '<p style="color:red;">' + data.data + '</p>';
            }
        });
    });
    </script>
    <?php
}

// Add image upload form to dashboard
add_action('gl_dashboard_page', 'gl_render_image_upload_form');

add_action('admin_menu', 'gl_admin_menu');

// Handle image uploads for portfolio and blog posts
function gl_handle_image_upload() {
    if (!current_user_can('manage_options')) {
        wp_send_json_error('Unauthorized');
        return;
    }

    if (empty($_FILES['gl_image_upload'])) {
        wp_send_json_error('No file uploaded');
        return;
    }

    $file = $_FILES['gl_image_upload'];
    $upload = wp_handle_upload($file, array('test_form' => false));

    if (isset($upload['error'])) {
        wp_send_json_error($upload['error']);
        return;
    }

    $attachment = array(
        'post_mime_type' => $upload['type'],
        'post_title' => sanitize_file_name($file['name']),
        'post_content' => '',
        'post_status' => 'inherit'
    );

    $attach_id = wp_insert_attachment($attachment, $upload['file']);
    require_once(ABSPATH . 'wp-admin/includes/image.php');
    $attach_data = wp_generate_attachment_metadata($attach_id, $upload['file']);
    wp_update_attachment_metadata($attach_id, $attach_data);

    wp_send_json_success(array('attachment_id' => $attach_id, 'url' => $upload['url']));
}
add_action('wp_ajax_gl_image_upload', 'gl_handle_image_upload');



    if (!current_user_can('manage_options')) {
        wp_die(__('You do not have sufficient permissions to access this page.'));
    }

    $quote_count = gl_get_quote_count();
    $ai_blog_enabled = get_option('gl_ai_blog_enabled', true);

    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['gl_ai_blog_toggle'])) {
        check_admin_referer('gl_ai_blog_toggle_action', 'gl_ai_blog_toggle_nonce');
        $ai_blog_enabled = isset($_POST['gl_ai_blog_enabled']) ? true : false;
        update_option('gl_ai_blog_enabled', $ai_blog_enabled);
        echo '<div class="updated notice"><p>' . __('AI Blog Generator setting updated.', 'gestion-lakeside') . '</p></div>';
    }

    ?>
    <div class="wrap">
        <h1><?php _e('Gestion Lakeside Dashboard', 'gestion-lakeside'); ?></h1>
        <h2><?php _e('Quote Requests', 'gestion-lakeside'); ?></h2>
        <p><?php printf(__('Total quote requests: %d', 'gestion-lakeside'), $quote_count); ?></p>

        <h2><?php _e('AI Blog Generator', 'gestion-lakeside'); ?></h2>
        <form method="post">
            <?php wp_nonce_field('gl_ai_blog_toggle_action', 'gl_ai_blog_toggle_nonce'); ?>
            <label for="gl_ai_blog_enabled"><?php _e('Enable AI Blog Generator', 'gestion-lakeside'); ?></label>
            <input type="checkbox" name="gl_ai_blog_enabled" id="gl_ai_blog_enabled" value="1" <?php checked($ai_blog_enabled); ?> />
            <input type="submit" name="gl_ai_blog_toggle" class="button button-primary" value="<?php _e('Save', 'gestion-lakeside'); ?>" />
        </form>

        <h2><?php _e('Content Management', 'gestion-lakeside'); ?></h2>
        <?php gl_render_content_editor(); ?>
    </div>
        <div class="gl-dashboard-widgets">
            <div class="gl-widget gl-analytics-widget">
                <h3><i class="fa-solid fa-chart-line"></i> Analytics</h3>
                <canvas id="gl-analytics-chart" height="120"></canvas>
            </div>
        </div>

<!-- Advanced Dashboard UI: GSAP, SVG, and Microinteractions -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
  // Animate dashboard cards
  gsap.from('.wrap h1, .wrap h2, .wrap p, .wrap form', {
    y: 40,
    opacity: 0,
    stagger: 0.12,
    duration: 0.8,
    ease: 'power3.out',
    delay: 0.2
  });
  // Microinteraction for toggles/buttons
  document.querySelectorAll('.button, input[type=checkbox]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      gsap.to(el, {scale: 1.06, boxShadow: '0 4px 24px #48BFF9', duration: 0.18});
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, {scale: 1, boxShadow: 'none', duration: 0.18});
    });
  });
});
</script>

    <?php
}

// Implement basic analytics and quote tracking

function gl_get_quote_count() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'gl_quotes';
    return $wpdb->get_var("SELECT COUNT(*) FROM $table_name");
}


?>