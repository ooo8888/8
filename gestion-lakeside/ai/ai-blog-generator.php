<?php
// AI Blog Generator using Anthropic Claude API

function gl_generate_ai_blog_post() {
    if (!get_option('gl_ai_blog_enabled', true)) {
        return;
    }

    // Implement API call to Claude to generate blog post content
    $api_key = getenv('CLAUDE_API_KEY');
    if (!$api_key) {
        error_log('Claude API key not set');
        return;
    }

    $prompt = "Generate a unique, SEO-optimized blog post for Gestion Lakeside Inc., a Quebec construction company. The post should be persuasive, bilingual (French and English), and include relevant keywords for roofing, balconies, renovations, and AI-powered construction technology.";

    $response = wp_remote_post('https://api.anthropic.com/v1/complete', [
        'headers' => [
            'Content-Type' => 'application/json',
            'x-api-key' => $api_key
        ],
        'body' => json_encode([
            'model' => 'claude-v1',
            'prompt' => $prompt,
            'max_tokens_to_sample' => 1000,
            'stop_sequences' => ["\n\n"],
            'temperature' => 0.7
        ]),
        'timeout' => 30
    ]);

    if (is_wp_error($response)) {
        error_log('Claude API request failed: ' . $response->get_error_message());
        return;
    }

    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);
    if (empty($data['completion'])) {
        error_log('Claude API returned empty completion');
        return;
    }

    $content = sanitize_text_field($data['completion']);

    // Insert post programmatically
    $post_data = [
        'post_title' => wp_trim_words($content, 10, '...'),
        'post_content' => $content,
        'post_status' => 'publish',
        'post_author' => 1,
        'post_category' => [],
        'tags_input' => ['construction', 'renovation', 'balconies', 'roofing', 'AI'],
    ];

    wp_insert_post($post_data);

}

// Schedule weekly blog generation
function gl_schedule_ai_blog_generation() {
    if (!wp_next_scheduled('gl_ai_blog_generate_event')) {
        wp_schedule_event(time(), 'weekly', 'gl_ai_blog_generate_event');
    }
}
add_action('wp', 'gl_schedule_ai_blog_generation');

add_action('gl_ai_blog_generate_event', 'gl_generate_ai_blog_post');

// TODO: Implement API integration, error handling, and post insertion

?>