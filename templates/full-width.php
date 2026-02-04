<?php
/**
 * Template Name: Full Width Template
 * Description: A full-width template without sidebar.
 *
 * @package Coopvest\Admin
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

get_header();
?>

    <main class="main-content full-width-content" id="main">
        <?php
        while ( have_posts() ) :
            the_post();

            get_template_part( 'template-parts/content', 'page' );
        endwhile;
        ?>
    </main>

<?php
get_footer();
