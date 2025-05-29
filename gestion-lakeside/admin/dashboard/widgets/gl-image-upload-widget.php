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
        <style>
        .gl-image-upload-widget input[type='file']::-webkit-file-upload-button {
            background: #1E90FF; color: #fff; border: none; padding: 0.5em 1.2em; border-radius: 4px; font-weight: 600; transition: background 0.2s;
        }
        .gl-image-upload-widget input[type='file']:hover::-webkit-file-upload-button {
            background: #48BFF9;
        }
        .gl-image-upload-widget .button-primary { background: linear-gradient(90deg,#1E90FF,#48BFF9); border: none; }
        </style>
        <script>
        // GSAP microinteraction: Animate upload widget on load
        document.addEventListener('DOMContentLoaded', function() {
          if (window.gsap && document.querySelector('.gl-image-upload-widget')) {
            gsap.from('.gl-image-upload-widget', {opacity:0, y:40, duration:0.8, delay:0.2, ease:'power2.out'});
          }
        });
        </script>
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
