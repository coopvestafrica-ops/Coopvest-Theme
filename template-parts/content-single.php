<?php
/**
 * The template part for displaying single posts.
 *
 * @package Coopvest\Admin
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}
?>

<article id="post-<?php the_ID(); ?>" <?php post_class( 'single-post' ); ?>>
    <?php if ( has_post_thumbnail() ) : ?>
        <div class="post-thumbnail single-post-thumbnail">
            <?php the_post_thumbnail( 'large', array( 'class' => 'post-image' ) ); ?>
        </div>
    <?php endif; ?>

    <div class="post-content single-post-content">
        <header class="post-header single-post-header">
            <div class="post-meta single-post-meta">
                <span class="post-author">
                    <?php
                    echo get_avatar( get_the_author_meta( 'ID' ), 40 );
                    ?>
                    <span class="author-name"><?php the_author_posts_link(); ?></span>
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

            <?php the_title( '<h1 class="post-title single-post-title">', '</h1>' ); ?>

            <div class="post-categories">
                <span class="dashicons dashicons-category"></span>
                <?php the_category( ', ' ); ?>
            </div>

            <?php if ( has_tag() ) : ?>
                <div class="post-tags">
                    <span class="dashicons dashicons-tag"></span>
                    <?php the_tags( '', ', ', '' ); ?>
                </div>
            <?php endif; ?>
        </header>

        <div class="post-body single-post-body">
            <?php
            the_content( sprintf(
                /* translators: %s: Post title */
                esc_html__( 'Continue reading %s', 'coopvest-admin' ),
                the_title( '<span class="screen-reader-text">"', '"</span>', false )
            ) );

            wp_link_pages( array(
                'before'      => '<div class="page-links"><span class="page-links-title">' . esc_html__( 'Pages:', 'coopvest-admin' ) . '</span>',
                'after'       => '</div>',
                'link_before' => '<span class="page-number">',
                'link_after'  => '</span>',
            ) );
            ?>
        </div>

        <footer class="post-footer single-post-footer">
            <?php
            // Edit link.
            edit_post_link(
                sprintf(
                    /* translators: %s: Post title */
                    esc_html__( 'Edit %s', 'coopvest-admin' ),
                    the_title( '<span class="screen-reader-text">"', '"</span>', false )
                ),
                '<div class="edit-link">',
                '</div>'
            );

            // Author bio.
            if ( get_the_author_meta( 'description' ) ) :
                ?>
                <div class="author-bio">
                    <h3 class="author-bio-title">
                        <?php
                        printf(
                            /* translators: %s: Author name */
                            esc_html__( 'About %s', 'coopvest-admin' ),
                            get_the_author()
                        );
                        ?>
                    </h3>
                    <div class="author-bio-content">
                        <?php echo get_avatar( get_the_author_meta( 'ID' ), 80 ); ?>
                        <div class="author-bio-text">
                            <?php the_author_meta( 'description' ); ?>
                            <a href="<?php echo esc_url( get_author_posts_url( get_the_author_meta( 'ID' ) ) ); ?>" class="author-posts-link">
                                <?php
                                printf(
                                    /* translators: %s: Author name */
                                    esc_html__( 'View all posts by %s', 'coopvest-admin' ),
                                    get_the_author()
                                );
                                ?>
                            </a>
                        </div>
                    </div>
                </div>
            <?php endif; ?>
        </footer>
    </div>
</article>
