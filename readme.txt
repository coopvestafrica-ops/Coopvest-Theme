=== Coopvest Admin Dashboard ===

Contributors: coopvestafrica
Tags: admin, dashboard, cooperative, finance, management, modern, responsive
Requires at least: 5.9
Tested up to: 6.4
Requires PHP: 7.4
Stable tag: 1.0.0
License: GNU General Public License v2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A modern admin dashboard theme for Coopvest cooperative management platform with member management, loan processing, investment tracking, and more.

== Description ==

Coopvest Admin Dashboard is a professional WordPress theme designed specifically for cooperative organizations. It provides a comprehensive admin interface for managing members, loans, investments, and financial reporting.

### Features

* Modern, responsive design
* Custom dashboard template with React integration
* Member management interface
* Loan processing and tracking
* Investment portfolio management
* E-wallet functionality
* Contribution tracking
* Risk assessment tools
* Document generation
* Referral system
* Multiple page templates
* Custom widgets
* RTL language support
* Translation ready

== Installation ==

1. Download the theme from WordPress.org or your preferred source
2. Go to Appearance > Themes > Add New
3. Click "Upload Theme"
4. Select the theme zip file
5. Click "Install Now"
6. Activate the theme

== Customization ==

The theme can be customized through the WordPress Customizer:

1. Go to Appearance > Customize
2. Select "Theme Options"
3. Adjust colors, layouts, and other settings
4. Click "Publish" to save changes

For the React dashboard, build the frontend:

1. Navigate to the `src` directory
2. Run `npm install`
3. Run `npm run build`
4. The built files will be in the `build` directory

== Custom Post Types ==

The theme includes the following custom post types:

* Members - Manage cooperative members
* Loans - Track and process loan applications
* Investments - Monitor investment portfolios

== Widget Areas ==

* Main Sidebar - For blog posts and pages
* Dashboard Sidebar - For the dashboard template
* Footer 1, 2, 3 - Footer widget columns

== Menus ==

* Primary Menu - Main site navigation
* Secondary Menu - Additional navigation
* Footer Menu - Footer links
* Dashboard Menu - Dashboard sidebar navigation

== Child Theme ==

To create a child theme:

1. Create a directory in your themes folder: `coopvest-admin-child`
2. Create a `style.css` with the following header:

/*
 Theme Name:   Coopvest Admin Child
 Theme URI:    https://coopvest.com
 Description:  Coopvest Admin Dashboard Child Theme
 Author:       Your Name
 Author URI:   https://yoursite.com
 Template:     coopvest-admin
 Version:      1.0.0
 License:      GNU General Public License v2 or later
 License URI:  https://www.gnu.org/licenses/gpl-2.0.html
 Text Domain:  coopvest-admin-child
*/

3. Create a `functions.php` file:

<?php
function coopvest_child_enqueue_styles() {
    wp_enqueue_style( 'parent-style', get_template_directory_uri() . '/style.css' );
}
add_action( 'wp_enqueue_scripts', 'coopvest_child_enqueue_styles' );

// Add your custom code here
?>

== Frequently Asked Questions ==

= Can I use this theme for a non-cooperative website? =

Yes, the theme is flexible enough to be adapted for various types of admin dashboards and membership sites.

= Is the dashboard fully functional out of the box? =

The theme provides the structural foundation. For the full React-powered dashboard, you need to build the frontend from the `src` directory.

= Does this theme support RTL languages? =

Yes, the theme includes RTL (Right-to-Left) language support.

== Changelog ==

= 1.0.0 =
* Initial release
* Core theme files
* Dashboard template
* Custom post types
* Widget areas
* Navigation menus

== Credits ==

* WordPress - https://wordpress.org
* Bootstrap Navwalker - https://github.com/wp-bootstrap/wp-bootstrap-navwalker
* Google Fonts - https://fonts.google.com

== License ==

This theme is licensed under the GNU General Public License v2 or later.
See LICENSE file for more information.
