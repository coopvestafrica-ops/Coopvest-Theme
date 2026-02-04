<?php
/**
 * The template for displaying single posts.
 *
 * @package Coopvest\Admin
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

get_header();
?>

    <main class="main-content" id="main">
        <div class="container">
            <div class="content-area">
                <?php
                while ( have_posts() ) :
                    the_post();

                    get_template_part( 'template-parts/content', 'single' );

                    // Author bio.
                    if ( get_the_author_meta( 'description' ) ) :
                        get_template_part( 'template-parts/author', 'bio' );
                    endif;

                    // Related posts.
                    if ( class_exists( 'Coopvest_Related_Posts' ) ) :
                        Coopvest_Related_Posts::display();
                    endif;

                    // Comments.
                    if ( comments_open() || get_comments_number() ) :
                        comments_template();
                    endif;
                endwhile;
                ?>
            </div>

            <?php get_sidebar(); ?>
        </div>
    </main>

<?php
get_footer();
