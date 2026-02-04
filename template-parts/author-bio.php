<?php
/**
 * The template part for displaying author bio.
 *
 * @package Coopvest\Admin
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}
?>

<div class="author-bio" id="author-bio">
    <div class="author-bio-inner">
        <?php
        // Get author ID.
        $author_id = get_the_author_meta( 'ID' );
        ?>

        <div class="author-avatar">
            <?php echo get_avatar( $author_id, 100 ); ?>
        </div>

        <div class="author-info">
            <h3 class="author-name">
                <?php
                printf(
                    /* translators: %s: Author name */
                    esc_html__( 'About %s', 'coopvest-admin' ),
                    get_the_author()
                );
                ?>
            </h3>

            <div class="author-description">
                <?php the_author_meta( 'description' ); ?>
            </div>

            <div class="author-links">
                <a href="<?php echo esc_url( get_author_posts_url( $author_id ) ); ?>" class="author-posts-link">
                    <span class="dashicons dashicons-pressthis"></span>
                    <?php
                    printf(
                        /* translators: %s: Author name */
                        esc_html__( 'View all posts by %s', 'coopvest-admin' ),
                        get_the_author()
                    );
                    ?>
                </a>

                <?php if ( get_the_author_meta( 'url' ) ) : ?>
                    <a href="<?php echo esc_url( get_the_author_meta( 'url' ) ); ?>" class="author-url" target="_blank" rel="noopener noreferrer">
                        <span class="dashicons dashicons-admin-site-alt3"></span>
                        <?php esc_html_e( 'Website', 'coopvest-admin' ); ?>
                    </a>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>
