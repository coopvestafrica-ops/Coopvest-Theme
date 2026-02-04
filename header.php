<?php
/**
 * The header for the Coopvest Admin Dashboard theme.
 *
 * @package Coopvest\Admin
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="profile" href="https://gmpg.org/xfn/11">
    <?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<?php
/**
 * Hook: coopvest_before_site
 */
do_action( 'coopvest_before_site' );
?>

<div class="site-wrapper">
    <?php
    /**
     * Hook: coopvest_before_header
     */
    do_action( 'coopvest_before_header' );
    ?>

    <header class="site-header" id="masthead">
        <div class="header-inner">
            <div class="header-left">
                <?php if ( is_page_template( 'templates/dashboard.php' ) ) : ?>
                    <button class="sidebar-toggle" id="sidebarToggle" aria-label="Toggle Sidebar">
                        <span class="dashicons dashicons-menu-alt2"></span>
                    </button>
                <?php endif; ?>

                <div class="site-branding">
                    <?php
                    the_custom_logo();

                    if ( ! has_custom_logo() ) :
                        ?>
                        <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="site-logo">
                            <?php bloginfo( 'name' ); ?>
                        </a>
                    <?php endif; ?>
                </div>
            </div>

            <div class="header-search">
                <?php get_search_form(); ?>
            </div>

            <div class="header-actions">
                <?php if ( is_user_logged_in() ) : ?>
                    <div class="header-notifications">
                        <button class="notification-btn" aria-label="Notifications">
                            <span class="dashicons dashicons-bell"></span>
                            <span class="notification-count">3</span>
                        </button>
                    </div>

                    <div class="header-user">
                        <div class="user-menu dropdown" id="userMenu">
                            <button class="user-menu-toggle" aria-expanded="false">
                                <?php
                                $current_user = wp_get_current_user();
                                echo get_avatar( $current_user->ID, 40, '', $current_user->display_name );
                                ?>
                                <span class="user-name"><?php echo esc_html( $current_user->display_name ); ?></span>
                                <span class="dashicons dashicons-arrow-down-alt2"></span>
                            </button>

                            <div class="dropdown-menu">
                                <a href="<?php echo esc_url( get_edit_user_link() ); ?>" class="dropdown-item">
                                    <span class="dashicons dashicons-admin-users"></span>
                                    <?php esc_html_e( 'Profile', 'coopvest-admin' ); ?>
                                </a>
                                <a href="<?php echo esc_url( admin_url() ); ?>" class="dropdown-item">
                                    <span class="dashicons dashicons-dashboard"></span>
                                    <?php esc_html_e( 'Dashboard', 'coopvest-admin' ); ?>
                                </a>
                                <hr class="dropdown-divider">
                                <a href="<?php echo esc_url( wp_logout_url( home_url() ) ); ?>" class="dropdown-item">
                                    <span class="dashicons dashicons-exit"></span>
                                    <?php esc_html_e( 'Logout', 'coopvest-admin' ); ?>
                                </a>
                            </div>
                        </div>
                    </div>
                <?php else : ?>
                    <a href="<?php echo esc_url( wp_login_url() ); ?>" class="btn btn-primary">
                        <?php esc_html_e( 'Login', 'coopvest-admin' ); ?>
                    </a>
                <?php endif; ?>
            </div>
        </div>
    </header>

    <?php
    /**
     * Hook: coopvest_after_header
     */
    do_action( 'coopvest_after_header' );
    ?>
