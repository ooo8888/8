jQuery(document).ready(function($) {
    // Save form data on input change
    $('#gl-quote-form input, #gl-quote-form select, #gl-quote-form textarea').on('change', function() {
        var formData = {};
        $('#gl-quote-form').serializeArray().forEach(function(item) {
            formData[item.name] = item.value;
        });
        $.post(glFormIntelligence.ajax_url, {
            action: 'gl_save_quote_form',
            nonce: glFormIntelligence.nonce,
            data: formData
        });
    });

    // Resume form data from cookie
    function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    var savedData = getCookie('gl_quote_form_data');
    if (savedData) {
        try {
            var formData = JSON.parse(savedData);
            for (var key in formData) {
                var field = $('#gl-quote-form [name="' + key + '"]');
                if (field.length) {
                    field.val(formData[key]);
                }
            }
        } catch (e) {
            console.error('Failed to parse saved form data');
        }
    }
});
