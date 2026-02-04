<?php
/**
 * The main template file for the Coopvest Admin Dashboard theme.
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
                <?php if ( have_posts() ) : ?>

                    <header class="page-header">
                        <?php
                        the_archive_title( '<h1 class="page-title">', '</h1>' );
                        the_archive_description( '<div class="archive-description">', '</div>' );
                        ?>
                    </header>

                    <div class="posts-grid">
                        <?php
                        while ( have_posts() ) :
                            the_post();

                            get_template_part( 'template-parts/content', get_post_format() );
                        endwhile;
                        ?>
                    </div>

                    <?php
                    the_posts_pagination( array(
                        'prev_text' => '<span class="dashicons dashicons-arrow-left-alt2"></span> ' . esc_html__( 'Previous', 'coopvest-admin' ),
                        'next_text' => esc_html__( 'Next', 'coopvest-admin' ) . ' <span class="dashicons dashicons-arrow-right-alt2"></span>',
                        'before_page_number' => '<span class="pagination-item">',
                        'after_page_number'  => '</span>',
                    ) );
                    ?>

                <?php else : ?>

                    <div class="no-results">
                        <h2 class="no-results-title"><?php esc_html_e( 'Nothing Found', 'coopvest-admin' ); ?></h2>
                        <p class="no-results-text">
                            <?php
                            if ( is_search() ) {
                                esc_html_e( 'Sorry, but nothing matched your search terms. Please try again with some different keywords.', 'coopvest-admin' );
                            } else {
                                esc_html_e( 'It seems we can\'t find what you\'re looking for. Perhaps searching can help.', 'coopvest-admin' );
                            }
                            ?>
                        </p>
                        <?php get_search_form(); ?>
                    </div>

                <?php endif; ?>
            </div>

            <?php get_sidebar(); ?>
        </div>
    </main>

<?php
get_footer();
