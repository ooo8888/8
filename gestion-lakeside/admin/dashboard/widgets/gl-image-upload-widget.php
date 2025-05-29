<?php
// Image Upload Widget for Gestion Lakeside Dashboard
function gl_render_image_upload_widget() {
    ?>
    <div class="gl-widget gl-image-upload-widget">
        <h3><?php _e('Upload Images', 'gestion-lakeside'); ?></h3>
        <form id="gl-image-upload-form" method="post" enctype="multipart/form-data">
            <input type="file" name="gl_image_upload" id="gl_image_upload" accept="image/*" />
            <input type="submit" class="button button-primary" value="<?php _e('Upload', 'gestion-lakeside'); ?>" />
        </form>
        <div id="gl-upload-result"></div>
    </div>
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
