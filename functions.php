<?php
/**
 * Coopvest Admin Dashboard Theme Functions
 *
 * @package Coopvest\Admin
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

/**
 * Theme version.
 */
define( 'COOPVEST_THEME_VERSION', '1.0.0' );

/**
 * Theme directory path.
 */
define( 'COOPVEST_THEME_DIR', get_template_directory() );

/**
 * Theme directory URI.
 */
define( 'COOPVEST_THEME_URI', get_template_directory_uri() );

/**
 * Theme assets directory.
 */
define( 'COOPVEST_THEME_ASSETS_URI', COOPVEST_THEME_URI . '/assets' );

/**
 * Initialize theme support and features.
 */
function coopvest_setup() {
    // Add title tag support.
    add_theme_support( 'title-tag' );

    // Add featured image support.
    add_theme_support( 'post-thumbnails' );

    // Add automatic feed links.
    add_theme_support( 'automatic-feed-links' );

    // Add custom background support.
    add_theme_support( 'custom-background', array(
        'default-color' => '#f8fafc',
        'default-image' => '',
    ) );

    // Add custom logo support.
    add_theme_support( 'custom-logo', array(
        'height'      => 50,
        'width'       => 200,
        'flex-height' => true,
        'flex-width'  => true,
        'header-text' => array( 'site-title', 'site-description' ),
    ) );

    // Add HTML5 support.
    add_theme_support( 'html5', array(
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
        'style',
        'script',
    ) );

    // Add selective refresh for widgets.
    add_theme_support( 'customize-selective-refresh-widgets' );

    // Register navigation menus.
    register_nav_menus( array(
        'primary'   => esc_html__( 'Primary Menu', 'coopvest-admin' ),
        'secondary' => esc_html__( 'Secondary Menu', 'coopvest-admin' ),
        'footer'    => esc_html__( 'Footer Menu', 'coopvest-admin' ),
        'dashboard' => esc_html__( 'Dashboard Menu', 'coopvest-admin' ),
    ) );

    // Add editor styles.
    add_editor_style( array( 'style.css', coopvest_fonts_url() ) );

    // Set content width.
    if ( ! isset( $content_width ) ) {
        $content_width = 800;
    }
}
add_action( 'after_setup_theme', 'coopvest_setup' );

/**
 * Register widget areas.
 */
function coopvest_widgets_init() {
    register_sidebar( array(
        'name'          => esc_html__( 'Main Sidebar', 'coopvest-admin' ),
        'id'            => 'sidebar-1',
        'description'   => esc_html__( 'Add widgets here.', 'coopvest-admin' ),
        'before_widget' => '<section id="%1$s" class="widget %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h3 class="widget-title">',
        'after_title'   => '</h3>',
    ) );

    register_sidebar( array(
        'name'          => esc_html__( 'Dashboard Sidebar', 'coopvest-admin' ),
        'id'            => 'dashboard-sidebar',
        'description'   => esc_html__( 'Widgets for the dashboard area.', 'coopvest-admin' ),
        'before_widget' => '<div id="%1$s" class="widget %2$s">',
        'after_widget'  => '</div>',
        'before_title'  => '<h4 class="widget-title">',
        'after_title'   => '</h4>',
    ) );

    register_sidebar( array(
        'name'          => esc_html__( 'Footer Column 1', 'coopvest-admin' ),
        'id'            => 'footer-1',
        'description'   => esc_html__( 'First footer column.', 'coopvest-admin' ),
        'before_widget' => '<div id="%1$s" class="footer-widget %2$s">',
        'after_widget'  => '</div>',
        'before_title'  => '<h4 class="footer-widget-title">',
        'after_title'   => '</h4>',
    ) );

    register_sidebar( array(
        'name'          => esc_html__( 'Footer Column 2', 'coopvest-admin' ),
        'id'            => 'footer-2',
        'description'   => esc_html__( 'Second footer column.', 'coopvest-admin' ),
        'before_widget' => '<div id="%1$s" class="footer-widget %2$s">',
        'after_widget'  => '</div>',
        'before_title'  => '<h4 class="footer-widget-title">',
        'after_title'   => '</h4>',
    ) );

    register_sidebar( array(
        'name'          => esc_html__( 'Footer Column 3', 'coopvest-admin' ),
        'id'            => 'footer-3',
        'description'   => esc_html__( 'Third footer column.', 'coopvest-admin' ),
        'before_widget' => '<div id="%1$s" class="footer-widget %2$s">',
        'after_widget'  => '</div>',
        'before_title'  => '<h4 class="footer-widget-title">',
        'after_title'   => '</h4>',
    ) );
}
add_action( 'widgets_init', 'coopvest_widgets_init' );

/**
 * Enqueue scripts and styles.
 */
function coopvest_scripts() {
    // Google Fonts.
    wp_enqueue_style( 'coopvest-fonts', coopvest_fonts_url(), array(), COOPVEST_THEME_VERSION );

    // Main stylesheet.
    wp_enqueue_style( 'coopvest-style', get_stylesheet_uri(), array(), COOPVEST_THEME_VERSION );

    // React Assets
    if ( file_exists( COOPVEST_THEME_DIR . '/dist/assets/index.css' ) ) {
        wp_enqueue_style( 'coopvest-react-style', COOPVEST_THEME_URI . '/dist/assets/index.css', array(), COOPVEST_THEME_VERSION );
    }

    if ( file_exists( COOPVEST_THEME_DIR . '/dist/assets/index.js' ) ) {
        wp_enqueue_script( 'coopvest-react-app', COOPVEST_THEME_URI . '/dist/assets/index.js', array(), COOPVEST_THEME_VERSION, true );
        
        // Pass data to React
        wp_localize_script( 'coopvest-react-app', 'coopvestData', array(
            'apiUrl' => esc_url_raw( rest_url( 'coopvest/v1' ) ),
            'nonce'  => wp_create_nonce( 'wp_rest' ),
            'siteUrl' => get_site_url(),
        ) );
    }

    // Dashicons.
    wp_enqueue_style( 'dashicons' );

    // Comment reply script.
    if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
        wp_enqueue_script( 'comment-reply' );
    }
}
add_action( 'wp_enqueue_scripts', 'coopvest_scripts' );

/**
 * Get Google Fonts URL.
 */
function coopvest_fonts_url() {
    $fonts_url = '';
    $fonts     = array();
    $subsets   = 'latin,latin-ext';

    /* translators: If there are characters in your language that are not supported by Inter, translate this to 'off'. Do not translate into your own language. */
    if ( 'off' !== _x( 'on', 'Inter font: on or off', 'coopvest-admin' ) ) {
        $fonts[] = 'Inter:400,500,600,700';
    }

    if ( $fonts ) {
        $fonts_url = add_query_arg( array(
            'family'  => implode( '&family=', $fonts ),
            'display' => 'swap',
        ), 'https://fonts.googleapis.com/css2' );
    }

    return esc_url_raw( $fonts_url );
}

/**
 * Add body classes.
 *
 * @param array $classes Body classes.
 * @return array Modified classes.
 */
function coopvest_body_classes( $classes ) {
    // Adds a class of hfeed to non-singular pages.
    if ( ! is_singular() ) {
        $classes[] = 'hfeed';
    }

    // Adds a class based on theme option.
    $sidebar_position = get_theme_mod( 'coopvest_sidebar_position', 'right' );
    $classes[]        = "sidebar-{$sidebar_position}";

    // Dashboard page class.
    if ( is_page_template( 'templates/dashboard.php' ) ) {
        $classes[] = 'dashboard-page';
    }

    return $classes;
}
add_filter( 'body_class', 'coopvest_body_classes' );

/**
 * Add pingback header.
 */
function coopvest_pingback_header() {
    if ( is_singular() && pings_open() ) {
        echo '<link rel="pingback" href="', esc_url( get_bloginfo( 'pingback_url' ) ), '">';
    }
}
add_action( 'wp_head', 'coopvest_pingback_header' );

/**
 * Custom excerpt more.
 *
 * @param string $more More string.
 * @return string Modified more string.
 */
function coopvest_excerpt_more( $more ) {
    return '&hellip;';
}
add_filter( 'excerpt_more', 'coopvest_excerpt_more' );

/**
 * Custom excerpt length.
 *
 * @param int $length Excerpt length.
 * @return int Modified length.
 */
function coopvest_excerpt_length( $length ) {
    return 30;
}
add_filter( 'excerpt_length', 'coopvest_excerpt_length' );

/**
 * Register Custom Navigation Walker.
 */
if ( ! class_exists( 'WP_Bootstrap_Navwalker' ) ) {
    require_once COOPVEST_THEME_DIR . '/inc/class-wp-bootstrap-navwalker.php';
}

/**
 * Dashboard menu items for the theme.
 */
function coopvest_dashboard_menu( $menu_items ) {
    $dashboard_items = array(
        'dashboard' => array(
            'title' => __( 'Dashboard', 'coopvest-admin' ),
            'slug'  => 'dashboard',
            'icon'  => 'dash-admin-panel',
        ),
        'members' => array(
            'title' => __( 'Members', 'coopvest-admin' ),
            'slug'  => 'members',
            'icon'  => 'dash-groups',
        ),
        'loans' => array(
            'title' => __( 'Loans', 'coopvest-admin' ),
            'slug'  => 'loans',
            'icon'  => 'dash-money',
        ),
        'investments' => array(
            'title' => __( 'Investments', 'coopvest-admin' ),
            'slug'  => 'investments',
            'icon'  => 'dash-chart',
        ),
        'wallet' => array(
            'title' => __( 'Wallet', 'coopvest-admin' ),
            'slug'  => 'wallet',
            'icon'  => 'dash-wallet',
        ),
        'reports' => array(
            'title' => __( 'Reports', 'coopvest-admin' ),
            'slug'  => 'reports',
            'icon'  => 'dash-portfolio',
        ),
        'settings' => array(
            'title' => __( 'Settings', 'coopvest-admin' ),
            'slug'  => 'settings',
            'icon'  => 'dash-settings',
        ),
    );

    return array_merge( $menu_items, $dashboard_items );
}
add_filter( 'coopvest_dashboard_nav_items', 'coopvest_dashboard_menu' );

/**
 * Dashboard stats for the admin dashboard.
 */
function coopvest_get_dashboard_stats() {
    $stats = array(
        'total_members'      => wp_count_posts( 'member' )->publish,
        'active_loans'       => wp_count_posts( 'loan' )->publish,
        'total_investments'  => wp_count_posts( 'investment' )->publish,
        'pending_approvals'  => get_posts( array(
            'post_type'   => array( 'loan', 'withdrawal' ),
            'post_status' => 'pending',
            'numberposts' => -1,
        ) ),
    );

    return $stats;
}

/**
 * Helper function to get theme mod with default.
 *
 * @param string $name Option name.
 * @param mixed  $default Default value.
 * @return mixed Theme mod value.
 */
function coopvest_get_mod( $name, $default = '' ) {
    $mod = get_theme_mod( $name, $default );

    /**
     * Filter the theme mod value.
     *
     * @param mixed $mod  The value.
     * @param string $name The option name.
     */
    return apply_filters( "coopvest_get_mod_{$name}", $mod, $name );
}

/**
 * Custom CSS from theme options.
 */
function coopvest_custom_css() {
    $custom_css = '';

    // Primary color.
    $primary_color = coopvest_get_mod( 'coopvest_primary_color', '#2563eb' );
    $custom_css   .= ":root { --primary-color: {$primary_color}; }";

    // Secondary color.
    $secondary_color = coopvest_get_mod( 'coopvest_secondary_color', '#7c3aed' );
    $custom_css     .= ":root { --secondary-color: {$secondary_color}; }";

    // Custom CSS from Customizer.
    $custom_css .= get_theme_mod( 'coopvest_custom_css', '' );

    // Output custom CSS.
    wp_add_inline_style( 'coopvest-style', $custom_css );
}
add_action( 'wp_enqueue_scripts', 'coopvest_custom_css' );

/**
 * Load text domain for translation.
 */
function coopvest_load_theme_textdomain() {
    load_theme_textdomain( 'coopvest-admin', COOPVEST_THEME_DIR . '/languages' );
}
add_action( 'after_setup_theme', 'coopvest_load_theme_textdomain' );

/**
 * Remove default gallery styles.
 */
add_filter( 'use_default_gallery_style', '__return_false' );

/**
 * Filter the categories widget to add span around count.
 *
 * @param string $output Gallery output.
 * @param array  $atts   Shortcode attributes.
 * @return string Modified output.
 */
function coopvest_gallery_attr( $output, $atts ) {
    return str_replace( '<gallery', '<gallery itemscope itemtype="http://schema.org/ImageGallery"', $output );
}
add_filter( 'post_gallery', 'coopvest_gallery_attr', 10, 2 );

/**
 * Dashboard template redirect.
 * Redirects users to dashboard if accessing dashboard without proper permissions.
 */
function coopvest_dashboard_template_redirect() {
    if ( is_page_template( 'templates/dashboard.php' ) && ! is_user_logged_in() ) {
        wp_redirect( wp_login_url() );
        exit;
    }
}
add_action( 'template_redirect', 'coopvest_dashboard_template_redirect' );

/**
 * Add dashboard body class for styling.
 */
function coopvest_dashboard_body_class( $classes ) {
    if ( is_page_template( 'templates/dashboard.php' ) ) {
        $classes[] = 'dashboard-layout';
    }
    return $classes;
}
add_filter( 'body_class', 'coopvest_dashboard_body_class' );

/**
 * Customize the excerpt more link.
 */
function coopvest_excerpt_link( $excerpt ) {
    if ( is_home() || is_archive() ) {
        $excerpt .= '<a href="' . get_permalink() . '" class="read-more-link">Read More</a>';
    }
    return $excerpt;
}
add_filter( 'the_excerpt', 'coopvest_excerpt_link' );

/**
 * Add wrapper div for image attachment.
 */
function coopvest_image_attachment_class( $output, $id, $size, $icon, $text, $alt ) {
    return str_replace( '<img', '<div class="attachment-image"><img', $output ) . '</div>';
}
add_filter( 'wp_get_attachment_image', 'coopvest_image_attachment_class', 10, 6 );

/**
 * Register custom post types for the theme.
 */
function coopvest_register_post_types() {
    // Member post type.
    register_post_type( 'member', array(
        'labels'        => array(
            'name'          => __( 'Members', 'coopvest-admin' ),
            'singular_name' => __( 'Member', 'coopvest-admin' ),
        ),
        'public'        => false,
        'show_ui'       => true,
        'menu_icon'     => 'dash-groups',
        'supports'      => array( 'title', 'thumbnail', 'custom-fields' ),
        'menu_position' => 30,
    ) );

    // Loan post type.
    register_post_type( 'loan', array(
        'labels'        => array(
            'name'          => __( 'Loans', 'coopvest-admin' ),
            'singular_name' => __( 'Loan', 'coopvest-admin' ),
        ),
        'public'        => false,
        'show_ui'       => true,
        'menu_icon'     => 'dash-money',
        'supports'      => array( 'title', 'custom-fields' ),
        'menu_position' => 31,
    ) );

    // Investment post type.
    register_post_type( 'investment', array(
        'labels'        => array(
            'name'          => __( 'Investments', 'coopvest-admin' ),
            'singular_name' => __( 'Investment', 'coopvest-admin' ),
        ),
        'public'        => false,
        'show_ui'       => true,
        'menu_icon'     => 'dash-chart',
        'supports'      => array( 'title', 'custom-fields' ),
        'menu_position' => 32,
    ) );
}
add_action( 'init', 'coopvest_register_post_types' );

/**
 * Add admin dashboard styles.
 */
function coopvest_admin_styles() {
    ?>
    <style>
        .coopvest-dashboard-icon::before {
            content: '\f102';
            font-family: 'dashicons';
        }
    </style>
    <?php
}
add_action( 'admin_head', 'coopvest_admin_styles' );

/**
 * Theme activation hook.
 */
function coopvest_activation() {
    // Flush rewrite rules.
    flush_rewrite_rules();

    // Set default theme options.
    set_theme_mod( 'coopvest_primary_color', '#2563eb' );
    set_theme_mod( 'coopvest_secondary_color', '#7c3aed' );
}
add_action( 'after_switch_theme', 'coopvest_activation' );

/**
 * Theme deactivation hook.
 */
function coopvest_deactivation() {
    // Flush rewrite rules.
    flush_rewrite_rules();
}
add_action( 'switch_theme', 'coopvest_deactivation' );

/**
 * Get dashboard navigation items.
 *
 * @return array Navigation items.
 */
function coopvest_get_nav_items() {
    $items = apply_filters( 'coopvest_dashboard_nav_items', array() );

    return $items;
}
