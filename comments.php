<?php
/**
 * The template for displaying comments.
 *
 * @package Coopvest\Admin
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

// Check if comments are open or we have at least one comment being displayed.
if ( post_password_required() || ! ( comments_open() || get_comments_number() ) ) {
    return;
}
?>

<section id="comments" class="comments-area">
    <?php if ( have_comments() ) : ?>
        <h3 class="comments-title">
            <?php
            $comments_number = get_comments_number();
            if ( '1' === $comments_number ) {
                /* translators: %s: Post title */
                printf( _x( 'One thought on &ldquo;%srdquo;', 'comments title', 'coopvest-admin' ), get_the_title() );
            } else {
                /* translators: %1$s: Number of comments, %2$s: Post title */
                printf(
                    _nx(
                        '%1$s thought on &ldquo;%2$srdquo;',
                        '%1$s thoughts on &ldquo;%2$srdquo;',
                        $comments_number,
                        'comments title',
                        'coopvest-admin'
                    ),
                    number_format_i18n( $comments_number ),
                    get_the_title()
                );
            }
            ?>
        </h3>

        <ol class="comment-list">
            <?php
            wp_list_comments( array(
                'style'       => 'ol',
                'short_ping'  => true,
                'avatar_size' => 48,
                'callback'    => 'coopvest_comment_callback',
            ) );
            ?>
        </ol>

        <?php
        the_comments_pagination( array(
            'prev_text' => '<span class="dashicons dashicons-arrow-left-alt2"></span> ' . esc_html__( 'Previous', 'coopvest-admin' ),
            'next_text' => esc_html__( 'Next', 'coopvest-admin' ) . ' <span class="dashicons dashicons-arrow-right-alt2"></span>',
        ) );
        ?>

    <?php endif; ?>

    <?php
    // Comment form.
    comment_form( array(
        'title_reply'          => esc_html__( 'Leave a Reply', 'coopvest-admin' ),
        'title_reply_to'       => esc_html__( 'Leave a Reply to %s', 'coopvest-admin' ),
        'cancel_reply_link'    => esc_html__( 'Cancel Reply', 'coopvest-admin' ),
        'label_submit'         => esc_html__( 'Post Comment', 'coopvest-admin' ),
        'class_submit'         => 'btn btn-primary',
        'submit_button'        => '<button name="%1$s" type="submit" id="%2$s" class="%3$s">%4$s</button>',
        'submit_field'         => '<div class="form-submit">%1$s %2$s</div>',
        'comment_field'        => '<div class="form-group comment-form-comment"><label for="comment">' . _x( 'Comment', 'noun', 'coopvest-admin' ) . '</label><textarea id="comment" name="comment" class="form-textarea" rows="8" aria-required="true"></textarea></div>',
        'must_log_in'          => '<p class="must-log-in">' . sprintf( __( 'You must be <a href="%s">logged in</a> to post a comment.', 'coopvest-admin' ), wp_login_url( apply_filters( 'the_permalink', get_permalink() ) ) ) . '</p>',
        'logged_in_as'         => '<p class="logged-in-as">' . sprintf( __( 'Logged in as <a href="%1$s">%2$s</a>. <a href="%3$s" title="Log out of this account">Log out?</a>', 'coopvest-admin' ), admin_url( 'profile.php' ), $user_identity, wp_logout_url( apply_filters( 'the_permalink', get_permalink() ) ) ) . '</p>',
        'comment_notes_before' => '<p class="comment-notes">' . esc_html__( 'Your email address will not be published.', 'coopvest-admin' ) . ( $req ? $required_text : '' ) . '</p>',
        'comment_notes_after'  => '',
    ) );
    ?>
</section>

<?php
/**
 * Custom comment callback function.
 *
 * @param WP_Comment $comment Comment object.
 * @param array      $args    Comment args.
 * @param int        $depth   Comment depth.
 */
function coopvest_comment_callback( $comment, $args, $depth ) {
    $tag = ( 'div' === $args['style'] ) ? 'div' : 'li';
    ?>
    <<?php echo esc_attr( $tag ); ?> id="comment-<?php comment_ID(); ?>" <?php comment_class( array( 'comment', get_comment_class(), empty( $args['has_children'] ) ? '' : 'parent' ) ); ?>>
        <article id="div-comment-<?php comment_ID(); ?>" class="comment-body">
            <footer class="comment-meta">
                <div class="comment-author vcard">
                    <?php
                    if ( 0 != $args['avatar_size'] ) {
                        echo get_avatar( $comment, $args['avatar_size'] );
                    }
                    ?>
                    <span class="fn"><?php comment_author_link( $comment ); ?></span>
                    <span class="says"><?php esc_html_e( 'says:', 'coopvest-admin' ); ?></span>
                </div>

                <div class="comment-metadata">
                    <a href="<?php echo esc_url( get_comment_link( $comment, $args ) ); ?>">
                        <time datetime="<?php comment_time( 'c' ); ?>">
                            <?php
                            /* translators: %1$s: Date, %2$s: Time */
                            printf( esc_html__( '%1$s at %2$s', 'coopvest-admin' ), get_comment_date(), get_comment_time() );
                            ?>
                        </time>
                    </a>
                    <?php edit_comment_link( esc_html__( 'Edit', 'coopvest-admin' ), '<span class="edit-link">', '</span>' ); ?>
                </div>

                <?php if ( '0' == $comment->comment_approved ) : ?>
                    <p class="comment-awaiting-moderation">
                        <?php esc_html_e( 'Your comment is awaiting moderation.', 'coopvest-admin' ); ?>
                    </p>
                <?php endif; ?>
            </footer>

            <div class="comment-content">
                <?php comment_text(); ?>
            </div>

            <div class="reply">
                <?php
                comment_reply_link( array_merge( $args, array(
                    'add_below' => 'div-comment',
                    'depth'     => $depth,
                    'max_depth' => $args['max_depth'],
                    'before'    => '<div class="reply-link">',
                    'after'     => '</div>',
                ) ) );
                ?>
            </div>
        </article>
    <?php
}
