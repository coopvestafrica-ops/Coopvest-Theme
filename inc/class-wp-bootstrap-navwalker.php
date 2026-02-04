<?php
/**
 * WP Bootstrap Navwalker
 *
 * @package Coopvest\Admin
 * @since 1.0.0
 * @link https://github.com/wp-bootstrap/wp-bootstrap-navwalker
 * @license GPL-3.0+
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

/**
 * Class Name: WP_Bootstrap_Navwalker
 * Plugin Name: WP Bootstrap Navwalker
 * Plugin URI: https://github.com/wp-bootstrap/wp-bootstrap-navwalker
 * Description: A custom WordPress nav walker class to implement the Bootstrap 4 navigation style in a custom theme using the WordPress built in menu manager.
 * Version: 4.3.0
 * Author: WP-Bootstrap
 * Author URI: https://github.com/wp-bootstrap
 * Text Domain: coopvest-admin
 * License: GPL-3.0+
 * License URI: https://www.gnu.org/licenses/gpl-3.0.txt
 */

/**
 * Class WP_Bootstrap_Navwalker
 *
 * @since 1.0.0
 */
class WP_Bootstrap_Navwalker extends Walker_Nav_Menu {

    /**
     * Whether the items_wrap contains schema microdata or not.
     *
     * We need to set this to false until WordPress core is fully compatible
     * with Bootstrap 5's schema, because bootstrap 5 adds itemprop="..." attributes.
     *
     * @since 4.3.0
     * @var bool
     */
    private $has_schema = false;

    /**
     * Maximum level of the menu.
     *
     * @since 1.0.0
     * @var int
     */
    public $max_pages = 3;

    /**
     * Instance of this class.
     *
     * @since 1.0.0
     * @var object|WP_Bootstrap_Navwalker
     */
    private static $instance;

    /**
     * Initialize the class.
     *
     * @since 1.0.0
     */
    public function __construct() {
        // For filtering menu CSS classes.
        add_filter( 'nav_menu_css_class', array( $this, 'add_css_classes' ), 10, 4 );

        // For filtering menu item output.
        add_filter( 'walker_nav_menu_start_el', array( $this, 'add_menu_item_markup' ), 10, 4 );

        // For schema microdata.
        add_filter( 'nav_menu_item_title', array( $this, 'add_menu_item_schema_markup' ), 10, 4 );

        // Detect schema.
        $this->has_schema = $this->has_schema_markup_support();
    }

    /**
     * Get instance of this class.
     *
     * @since 1.0.0
     * @return WP_Bootstrap_Navwalker
     */
    public static function get_instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Check if the theme supports schema.org microdata.
     *
     * @since 4.3.0
     * @return bool
     */
    private function has_schema_markup_support() {
        // If the theme supports HTML5, we can continue.
        return current_theme_supports( 'html5' ) || current_theme_supports( 'microdata' );
    }

    /**
     * Get the schema markup for a menu item.
     *
     * @since 4.3.0
     * @param object $item Menu item.
     * @return string
     */
    private function get_menu_item_schema_markup( $item ) {
        // If we don't have schema support, return empty string.
        if ( ! $this->has_schema ) {
            return '';
        }

        // Get the menu item object ID.
        $item_id = $item->ID;

        // Set the ID.
        $id = 'menu-item-' . $item_id;

        // Get the menu item object type.
        $type = $item->type;

        // Return the proper HTML id and class attributes.
        return ' itemprop="url"';
    }

    /**
     * Adds the <span> markup for the menu item title.
     *
     * @since 4.3.0
     * @param string $title The menu item title.
     * @param object $item  Menu item object.
     * @param array  $args  Menu item args.
     * @param int    $depth Depth of menu item.
     * @return string The menu item title with <span> tags.
     */
    public function add_menu_item_schema_markup( $title, $item, $args, $depth ) {
        // If we don't have schema support, return the title.
        if ( ! $this->has_schema ) {
            return $title;
        }

        // Get the menu item object ID.
        $item_id = $item->ID;

        // Get the menu item title.
        $label = $title;

        // If the menu item has a label, add it to the title.
        if ( isset( $item->label ) && ! empty( $item->label ) ) {
            // Add a span for the label.
            $label = sprintf(
                '%s <span class="menu-item-label">%s</span>',
                $title,
                esc_html( $item->label )
            );
        }

        // Create the menu item title markup.
        $markup = sprintf(
            '<span itemprop="name">%s</span>',
            $label
        );

        // Return the menu item title markup.
        return $markup;
    }

    /**
     * Adds the correct CSS classes to the menu item.
     *
     * @since 1.0.0
     * @param array $classes Array of menu item classes.
     * @param object $item  Menu item object.
     * @param array $args   Menu item args.
     * @param int $depth    Depth of menu item.
     * @return array Array of menu item classes.
     */
    public function add_css_classes( $classes, $item, $args, $depth ) {
        // Remove the current_page_item class from all menu items.
        $classes = array_filter( $classes, array( $this, 'remove_anonymous_classes' ) );

        // Add the active class for the current menu item.
        if ( isset( $item->current ) && 1 == $item->current ) {
            $classes[] = 'active';
        }

        // Add the dropdown class to the menu items with children.
        if ( $args->has_children ) {
            $classes[] = 'dropdown';
        }

        // Add the dropdown-submenu class to the dropdown menu items.
        if ( $depth > 0 && $args->has_children ) {
            $classes[] = 'dropdown-submenu';
        }

        // Return the menu item classes.
        return $classes;
    }

    /**
     * Removes an element from an array, if it's not in the array of allowed classes.
     *
     * @since 1.0.0
     * @param string $class The class name.
     * @return bool
     */
    private function remove_anonymous_classes( $class ) {
        // List of allowed classes.
        $allowed_classes = array(
            'menu-item',
            'menu-item-type-post_type',
            'menu-item-object-page',
            'menu-item-home',
            'menu-item-ancestor',
            'menu-item-parent',
            'menu-item-has-children',
            'dropdown',
            'active',
            'menu-item-object-category',
            'menu-item-type-taxonomy',
        );

        // Check if the class is in the allowed classes array.
        return in_array( $class, $allowed_classes );
    }

    /**
     * Adds the <span> markup for the menu item title.
     *
     * @since 1.0.0
     * @param string $title The menu item title.
     * @param object $item  Menu item object.
     * @param array  $args  Menu item args.
     * @param int    $depth Depth of menu item.
     * @return string The menu item title with <span> tags.
     */
    public function add_menu_item_markup( $title, $item, $args, $depth ) {
        // If we are at the third level or deeper, return the title as is.
        if ( $depth > $this->max_pages ) {
            return $title;
        }

        // Get the menu item object ID.
        $item_id = $item->ID;

        // Check if this menu item is a dropdown.
        if ( $args->has_children && 0 === $depth ) {
            // Create the menu item title markup for the dropdown.
            $title = sprintf(
                '%s <span class="caret"></span>',
                $title
            );
        } elseif ( $args->has_children && $depth > 0 ) {
            // Create the menu item title markup for the dropdown.
            $title = sprintf(
                '%s <span class="submenu-caret"></span>',
                $title
            );
        }

        // Return the menu item title.
        return $title;
    }

    /**
     * Starts the list before the elements are added.
     *
     * @since 1.0.0
     * @param string $output Passed by reference. Used to append additional content.
     * @param int    $depth  Depth of menu item. Used for padding.
     * @param array  $args   An array of arguments. @see wp_nav_menu().
     */
    public function start_lvl( &$output, $depth = 0, $args = array() ) {
        // If we are at the third level or deeper, return.
        if ( $depth >= $this->max_pages ) {
            return;
        }

        // Get the HTML elements for the menu.
        $indent = str_repeat( "\t", $depth );

        // If the depth starts at 0.
        if ( 0 === $depth ) {
            // Add the dropdown-menu class.
            $output .= "\n$indent<ul class=\"dropdown-menu\" role=\"menu\">\n";
        } else {
            // Add the dropdown-menu class.
            $output .= "\n$indent<ul class=\"dropdown-submenu\" role=\"menu\">\n";
        }
    }

    /**
     * Starts the element output.
     *
     * @since 1.0.0
     * @param string $output Passed by reference. Used to append additional content.
     * @param object $item   Menu item data object.
     * @param int    $depth  Depth of menu item. Used for padding.
     * @param array  $args   An array of arguments. @see wp_nav_menu().
     * @param int    $id     Current item ID.
     */
    public function start_el( &$output, $item, $depth = 0, $args = array(), $id = 0 ) {
        // Get the HTML elements for the menu.
        $indent = ( $depth ) ? str_repeat( "\t", $depth ) : '';

        // Get the menu item classes.
        $classes = empty( $item->classes ) ? array() : (array) $item->classes;

        // Get the menu item object ID.
        $item_id = $item->ID;

        // Get the menu item object type.
        $type = $item->type;

        // Add the menu item ID to the classes.
        $classes[] = 'menu-item-' . $item_id;

        // Add the menu item type class.
        $classes[] = 'menu-item-type-' . $type;

        // If the menu item has a label, add it to the classes.
        if ( isset( $item->label ) && ! empty( $item->label ) ) {
            $classes[] = 'menu-item-label';
        }

        // Filter the menu item classes.
        $class_names = join( ' ', apply_filters( 'nav_menu_item_classes', $classes, $item, $args, $depth ) );

        // Create the menu item class attribute.
        $class_names = $class_names ? ' class="' . esc_attr( $class_names ) . '"' : '';

        // Create the menu item ID attribute.
        $menu_item_id = ' id="menu-item-' . $item_id . '"';

        // Create the menu item ID attribute.
        $output .= $indent . '<li' . $menu_item_id . $class_names . '>';

        // Get the menu item attributes.
        $atts = array();

        // Add the menu item title attribute.
        $atts['title']  = ! empty( $item->attr_title ) ? $item->attr_title : '';
        $atts['target'] = ! empty( $item->target )     ? $item->target     : '';
        $atts['rel']    = ! empty( $item->xfn )        ? $item->xfn        : '';
        $atts['href']   = ! empty( $item->url )        ? $item->url        : '';

        // Get the menu item description.
        $description = ! empty( $item->description ) ? $item->description : '';

        // Add the menu item description to the attributes.
        $atts['description'] = $description;

        // Add the menu item aria-description attribute.
        $atts['aria-description'] = $description;

        // Add the menu item class attribute.
        if ( $args->has_children && 0 === $depth ) {
            $atts['class']         = 'dropdown-toggle';
            $atts['data-toggle']   = 'dropdown';
            $atts['role']          = 'button';
            $atts['aria-haspopup'] = 'true';
            $atts['aria-expanded'] = 'false';
        } elseif ( $args->has_children && $depth > 0 ) {
            $atts['class']         = 'dropdown-toggle';
            $atts['role']          = 'button';
            $atts['aria-haspopup'] = 'true';
            $atts['aria-expanded'] = 'false';
        }

        // Filter the menu item attributes.
        $atts = apply_filters( 'nav_menu_item_attributes', $atts, $item, $args, $depth );

        // Create the menu item attributes string.
        $attributes = '';
        foreach ( $atts as $attr => $value ) {
            if ( ! empty( $value ) ) {
                $value       = ( 'href' === $attr ) ? esc_url( $value ) : esc_attr( $value );
                $attributes .= ' ' . $attr . '="' . $value . '"';
            }
        }

        // Get the menu item title.
        $title = apply_filters( 'the_title', $item->title, $item->ID );

        // Get the menu item label.
        $label = isset( $item->label ) && ! empty( $item->label ) ? $item->label : $title;

        // Get the menu item object type.
        $object_type = $item->object;

        // Get the menu item object ID.
        $object_id = $item->object_id;

        // Get the menu item URL.
        $url = $item->url;

        // Check if the menu item is an external link.
        $is_external = ( 'custom' === $object_type && isset( $item->url ) && ! empty( $item->url ) );

        // Check if the menu item is an anchor link.
        $is_anchor = ( 'custom' === $object_type && isset( $item->url ) && '#' === substr( $item->url, 0, 1 ) );

        // Check if the menu item is an external link.
        if ( $is_external ) {
            // Add the external link class.
            $classes[] = 'menu-item-external';
        }

        // Check if the menu item is an anchor link.
        if ( $is_anchor ) {
            // Add the anchor link class.
            $classes[] = 'menu-item-anchor';
        }

        // Get the menu item description.
        $description = ! empty( $item->description ) ? $item->description : '';

        // Create the menu item description.
        $description = $description ? '<span class="menu-item-description">' . esc_html( $description ) . '</span>' : '';

        // Create the menu item title markup.
        $title_markup = $title;

        // If the menu item has a label, add it to the title.
        if ( isset( $item->label ) && ! empty( $item->label ) ) {
            $title_markup = sprintf(
                '%s <span class="menu-item-label">%s</span>',
                $title,
                esc_html( $item->label )
            );
        }

        // Create the menu item output.
        $item_output = $args->before;

        // Create the menu item anchor tag.
        $item_output .= '<a' . $attributes . '>';

        // Add the menu item icon.
        if ( isset( $item->icon ) && ! empty( $item->icon ) ) {
            $item_output .= '<span class="menu-item-icon ' . esc_attr( $item->icon ) . '"></span>';
        }

        // Add the menu item title.
        $item_output .= $args->link_before . $title_markup . $args->link_after;

        // Add the menu item description.
        $item_output .= $description;

        // Close the menu item anchor tag.
        $item_output .= '</a>';

        // Add the menu item after.
        $item_output .= $args->after;

        // Create the menu item output.
        $output .= apply_filters( 'walker_nav_menu_start_el', $item_output, $item, $depth, $args );
    }

    /**
     * Ends the element output.
     *
     * @since 1.0.0
     * @param string $output Passed by reference. Used to append additional content.
     * @param object $item   Menu item data object.
     * @param int    $depth  Depth of menu item. Used for padding.
     * @param array  $args   An array of arguments. @see wp_nav_menu().
     */
    public function end_el( &$output, $item, $depth = 0, $args = array() ) {
        // Get the HTML elements for the menu.
        $output .= "</li>\n";
    }

    /**
     * Traverse elements to create list from elements.
     *
     * Display one element if the element doesn't have any children otherwise,
     * display the element and its children. Will only traverse up to the max
     * depth and no elements at that depth.
     *
     * @since 1.0.0
     * @param array $elements           Elements.
     * @param int   $max_depth          Max depth.
     * @param mixed $current_page       Current page.
     * @param mixed $r                  Menu item args.
     * @param int   $depth              Current depth.
     * @return mixed Array of header output.
     */
    public function display_element( $elements, &$max_depth, &$r, $depth = 0, $args = array(), &$output = null ) {
        // If the element is not a valid menu item, return.
        if ( is_string( $elements ) ) {
            return;
        }

        // Set the current page ID.
        $current_page_id = 0;

        // If the current page is an object, get the ID.
        if ( ! empty( $args[0]->current_page ) ) {
            // Get the current page ID.
            $current_page_id = $args[0]->current_page;
        }

        // Get the current page ID from the elements.
        if ( ! empty( $elements[0]->current_page ) ) {
            // Get the current page ID.
            $current_page_id = $elements[0]->current_page;
        }

        // Get the menu item object ID.
        $id_field = $this->db_fields['id'];

        // Loop through the elements.
        foreach ( $elements as $element ) {
            // Check if this element is the current page.
            if ( isset( $element->$id_field ) && $element->$id_field === $current_page_id ) {
                // Set the current page class.
                $element->classes[] = 'active';
            }
        }

        // Display the element.
        parent::display_element( $elements, $max_depth, $r, $depth, $args, $output );
    }
}
