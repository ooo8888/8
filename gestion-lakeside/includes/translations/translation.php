<?php
// Real-time translation system for Gestion Lakeside plugin

function gl_detect_user_language() {
    $lang = substr($_SERVER['HTTP_ACCEPT_LANGUAGE'], 0, 2);
    return in_array($lang, ['fr', 'en']) ? $lang : 'fr';
}

function gl_get_current_language() {
    if (isset($_COOKIE['gl_language'])) {
        return $_COOKIE['gl_language'];
    }
    return gl_detect_user_language();
}

function gl_set_language_cookie() {
    if (isset($_GET['lang']) && in_array($_GET['lang'], ['fr', 'en'])) {
        setcookie('gl_language', $_GET['lang'], time() + 3600 * 24 * 30, COOKIEPATH, COOKIE_DOMAIN);
        $_COOKIE['gl_language'] = $_GET['lang'];
    }
}
add_action('init', 'gl_set_language_cookie');

function gl_translate_text($text) {
    $lang = gl_get_current_language();
    // TODO: Implement translation logic or use WPML or similar
    return $text; // Placeholder returns original text
}

// Shortcode to toggle language
function gl_language_toggle_shortcode() {
    $current_lang = gl_get_current_language();
    $toggle_lang = $current_lang === 'fr' ? 'en' : 'fr';
    $url = add_query_arg('lang', $toggle_lang);
    return '<a href="' . esc_url($url) . '" class="language-toggle">' . strtoupper($toggle_lang) . '</a>';
}
add_shortcode('gl_language_toggle', 'gl_language_toggle_shortcode');

?>