<?php
/**
 * The sidebar template for the Coopvest Admin Dashboard theme.
 *
 * @package Coopvest\Admin
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}
?>

<aside class="sidebar" id="secondary">
    <div class="sidebar-inner">
        <?php
        // Check which sidebar to display.
        if ( is_page_template( 'templates/dashboard.php' ) && is_active_sidebar( 'dashboard-sidebar' ) ) :
            dynamic_sidebar( 'dashboard-sidebar' );
        elseif ( is_active_sidebar( 'sidebar-1' ) ) :
            dynamic_sidebar( 'sidebar-1' );
        endif;
        ?>
    </div>
</aside>
