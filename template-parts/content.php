<?php
/**
 * The template part for displaying content.
 *
 * @package Coopvest\Admin
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}
?>

<article id="post-<?php the_ID(); ?>" <?php post_class( 'post-card' ); ?>>
    <?php if ( has_post_thumbnail() ) : ?>
        <div class="post-thumbnail">
            <a href="<?php the_permalink(); ?>">
                <?php the_post_thumbnail( 'large', array( 'class' => 'post-image' ) ); ?>
            </a>
        </div>
    <?php endif; ?>

    <div class="post-content">
        <header class="post-header">
            <?php if ( is_sticky() ) : ?>
                <span class="sticky-post">
                    <span class="dashicons dashicons-sticky"></span>
                    <?php esc_html_e( 'Featured', 'coopvest-admin' ); ?>
                </span>
            <?php endif; ?>

            <?php the_title( sprintf( '<h2 class="post-title"><a href="%s" rel="bookmark">', esc_url( get_permalink() ) ), '</a></h2>' ); ?>

            <div class="post-meta">
                <span class="post-author">
                    <span class="dashicons dashicons-admin-users"></span>
                    <?php the_author_posts_link(); ?>
                </span>

                <span class="post-date">
                    <span class="dashicons dashicons-calendar-alt"></span>
                    <time datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>">
                        <?php echo esc_html( get_the_date() ); ?>
                    </time>
                </span>

                <?php if ( ! post_password_required() && comments_open() ) : ?>
                    <span class="post-comments">
                        <span class="dashicons dashicons-admin-comments"></span>
                        <?php comments_popup_link( esc_html__( '0 Comments', 'coopvest-admin' ), esc_html__( '1 Comment', 'coopvest-admin' ), esc_html__( '% Comments', 'coopvest-admin' ) ); ?>
                    </span>
                <?php endif; ?>
            </div>
        </header>

        <div class="post-excerpt">
            <?php the_excerpt(); ?>
        </div>

        <footer class="post-footer">
            <a href="<?php the_permalink(); ?>" class="btn btn-outline btn-sm">
                <?php esc_html_e( 'Read More', 'coopvest-admin' ); ?>
                <span class="dashicons dashicons-arrow-right-alt2"></span>
            </a>

            <?php
            wp_list_categories( array(
                'taxonomy' => 'category',
                'before'   => '<div class="post-categories"><span class="dashicons dashicons-category"></span>',
                'after'    => '</div>',
            ) );
            ?>
        </footer>
    </div>
</article>
