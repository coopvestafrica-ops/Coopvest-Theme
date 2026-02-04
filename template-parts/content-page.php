<?php
/**
 * The template part for displaying page content.
 *
 * @package Coopvest\Admin
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}
?>

<article id="post-<?php the_ID(); ?>" <?php post_class( 'page-content' ); ?>>
    <?php if ( has_post_thumbnail() && ! is_page_template( 'templates/full-width.php' ) ) : ?>
        <div class="page-thumbnail">
            <?php the_post_thumbnail( 'large', array( 'class' => 'page-image' ) ); ?>
        </div>
    <?php endif; ?>

    <div class="page-content-inner">
        <header class="page-header">
            <?php the_title( '<h1 class="page-title">', '</h1>' ); ?>
        </header>

        <div class="page-body">
            <?php the_content(); ?>

            <?php
            wp_link_pages( array(
                'before'      => '<div class="page-links"><span class="page-links-title">' . esc_html__( 'Pages:', 'coopvest-admin' ) . '</span>',
                'after'       => '</div>',
                'link_before' => '<span class="page-number">',
                'link_after'  => '</span>',
            ) );
            ?>
        </div>

        <footer class="page-footer">
            <?php edit_post_link( esc_html__( 'Edit Page', 'coopvest-admin' ), '<span class="edit-link">', '</span>' ); ?>
        </footer>
    </div>
</article>
