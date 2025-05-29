<?php
// Blog page template
?>
<section class="blog-page container" style="padding: 4rem 1rem; color: var(--color-arctic-white);">
  <h2>Blog</h2>
  <div class="blog-posts" style="margin-top: 2rem;">
    <?php
    $posts = get_posts(array('post_type' => 'post', 'posts_per_page' => 10));
    if ($posts) :
      foreach ($posts as $post) : setup_postdata($post); ?>
        <article style="margin-bottom: 2rem;">
          <h3><a href="<?php the_permalink(); ?>" style="color: var(--color-glacier-blue);"><?php the_title(); ?></a></h3>
          <div><?php the_excerpt(); ?></div>
        </article>
    <?php
      endforeach;
      wp_reset_postdata();
    else :
      echo '<p>Aucun article disponible.</p>';
    endif;
    ?>
  </div>
</section>
