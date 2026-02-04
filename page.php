<?php
/**
 * The template for displaying all pages.
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

                    get_template_part( 'template-parts/content', 'page' );

                    // Comments.
                    if ( comments_open() || get_comments_number() ) :
                        comments_template();
                    endif;
                endwhile;
                ?>
            </div>

            <?php
            // Show sidebar only if not full width page template.
            if ( ! is_page_template( 'templates/full-width.php' ) ) :
                get_sidebar();
            endif;
            ?>
        </div>
    </main>

<?php
get_footer();
