<?php
// Analytics Widget for Gestion Lakeside Dashboard
function gl_render_analytics_widget() {
    ?>
    <div class="gl-widget gl-analytics-widget">
        <h3><i class="fa-solid fa-chart-line"></i> <?php _e('Analytics', 'gestion-lakeside'); ?></h3>
        <canvas id="gl-analytics-chart" height="120"></canvas>
    </div>
    <script>
    document.addEventListener('DOMContentLoaded', function() {
      if (document.getElementById('gl-analytics-chart')) {
        fetch(ajaxurl + '?action=gl_dashboard_analytics')
          .then(response => response.json())
          .then(data => {
            if (!data.success) return;
            const stats = data.data;
            const ctx = document.getElementById('gl-analytics-chart').getContext('2d');
            new Chart(ctx, {
              type: 'bar',
              data: {
                labels: ['Quotes', 'Blog Posts'],
                datasets: [{
                  label: 'Count',
                  data: [stats.quote_count, stats.blog_count],
                  backgroundColor: ['#48BFF9', '#1E90FF'],
                  borderColor: ['#48BFF9', '#1E90FF'],
                  borderWidth: 1
                }]
              },
              options: {
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
              }
            });
            let postsHtml = '<h4>Recent Blog Posts</h4><ul style="margin-top:1rem;">';
            stats.recent_posts.forEach(post => {
              postsHtml += `<li><a href="${post.url}" target="_blank" style="color:#48BFF9;">${post.title}</a></li>`;
            });
            postsHtml += '</ul>';
            document.querySelector('.gl-analytics-widget').insertAdjacentHTML('beforeend', postsHtml);
          });
      }
    });
    </script>
    <?php
}
