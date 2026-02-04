<?php
/**
 * The footer for the Coopvest Admin Dashboard theme.
 *
 * @package Coopvest\Admin
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}
?>
    </div>

    <?php
    /**
     * Hook: coopvest_before_footer
     */
    do_action( 'coopvest_before_footer' );
    ?>

    <footer class="site-footer" id="colophon">
        <div class="footer-inner">
            <div class="footer-text">
                <?php
                $copyright = sprintf(
                    /* translators: %s: Copyright year, %s: Site name */
                    esc_html__( '&copy; %1$s %2$s. All rights reserved.', 'coopvest-admin' ),
                    date( 'Y' ),
                    get_bloginfo( 'name' )
                );
                echo apply_filters( 'coopvest_copyright_text', $copyright );
                ?>
            </div>

            <div class="footer-links">
                <?php
                wp_nav_menu( array(
                    'theme_location' => 'footer',
                    'container'      => 'nav',
                    'menu_class'     => 'footer-nav',
                    'fallback_cb'    => false,
                    'depth'          => 1,
                ) );
                ?>
            </div>

            <div class="footer-social">
                <a href="#" aria-label="Facebook" class="social-link">
                    <span class="dashicons dashicons-facebook-alt"></span>
                </a>
                <a href="#" aria-label="Twitter" class="social-link">
                    <span class="dashicons dashicons-twitter"></span>
                </a>
                <a href="#" aria-label="LinkedIn" class="social-link">
                    <span class="dashicons dashicons-linkedin"></span>
                </a>
            </div>
        </div>
    </footer>

    <?php
    /**
     * Hook: coopvest_after_footer
     */
    do_action( 'coopvest_after_footer' );
    ?>

<?php
/**
 * Hook: coopvest_before_site_close
 */
do_action( 'coopvest_before_site_close' );
?>

<?php wp_footer(); ?>

</body>
</html>
