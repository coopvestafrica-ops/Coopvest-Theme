<?php
/**
 * Template Name: Dashboard Template
 * Description: A custom template for the Coopvest admin dashboard.
 *
 * @package Coopvest\Admin
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

// Get the current user.
$current_user = wp_get_current_user();

// Get dashboard navigation items.
$nav_items = coopvest_get_nav_items();

// Get current page slug.
$current_page = get_query_var( 'pagename' ) ? get_query_var( 'pagename' ) : 'dashboard';
?>

<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="<?php bloginfo( 'description' ); ?>">
    <link rel="profile" href="https://gmpg.org/xfn/11">
    <title><?php bloginfo( 'name' ); ?> - Dashboard</title>

    <?php wp_head(); ?>

    <style>
        /* Dashboard-specific styles */
        .dashboard-layout {
            background: #f8fafc;
        }

        .dashboard-wrapper {
            display: flex;
            min-height: 100vh;
        }

        .dashboard-sidebar {
            width: 260px;
            background: #0f172a;
            color: #ffffff;
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            overflow-y: auto;
            z-index: 1000;
            transition: transform 0.3s ease;
        }

        .dashboard-sidebar-header {
            padding: 1.5rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .dashboard-logo {
            font-size: 1.25rem;
            font-weight: 700;
            color: #ffffff;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .dashboard-logo-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #2563eb, #7c3aed);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .dashboard-nav {
            padding: 1rem 0;
        }

        .dashboard-nav-section {
            margin-bottom: 1.5rem;
        }

        .dashboard-nav-title {
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #64748b;
            padding: 0 1.5rem;
            margin-bottom: 0.5rem;
        }

        .dashboard-nav-item {
            display: flex;
            align-items: center;
            padding: 0.75rem 1.5rem;
            color: #94a3b8;
            text-decoration: none;
            transition: all 0.2s ease;
            gap: 0.75rem;
        }

        .dashboard-nav-item:hover,
        .dashboard-nav-item.active {
            color: #ffffff;
            background: rgba(255, 255, 255, 0.1);
        }

        .dashboard-nav-item.active {
            border-left: 3px solid #2563eb;
        }

        .dashboard-nav-icon {
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .dashboard-main {
            flex: 1;
            margin-left: 260px;
            min-height: 100vh;
        }

        .dashboard-header {
            background: #ffffff;
            border-bottom: 1px solid #e2e8f0;
            padding: 1rem 2rem;
            position: sticky;
            top: 0;
            z-index: 100;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .dashboard-header-left {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .sidebar-toggle {
            background: none;
            border: none;
            font-size: 1.5rem;
            color: #64748b;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 8px;
            transition: all 0.2s ease;
        }

        .sidebar-toggle:hover {
            background: #f1f5f9;
            color: #0f172a;
        }

        .dashboard-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #0f172a;
            margin: 0;
        }

        .dashboard-header-right {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .dashboard-search {
            position: relative;
        }

        .dashboard-search input {
            width: 300px;
            padding: 0.625rem 1rem 0.625rem 2.5rem;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            font-size: 0.875rem;
        }

        .dashboard-search-icon {
            position: absolute;
            left: 0.75rem;
            top: 50%;
            transform: translateY(-50%);
            color: #64748b;
        }

        .header-btn {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: none;
            background: #f1f5f9;
            color: #64748b;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            transition: all 0.2s ease;
        }

        .header-btn:hover {
            background: #e2e8f0;
            color: #0f172a;
        }

        .notification-badge {
            position: absolute;
            top: -2px;
            right: -2px;
            width: 18px;
            height: 18px;
            background: #ef4444;
            color: #ffffff;
            font-size: 0.625rem;
            font-weight: 600;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .user-menu {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.5rem;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .user-menu:hover {
            background: #f1f5f9;
        }

        .user-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: linear-gradient(135deg, #2563eb, #7c3aed);
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 0.875rem;
        }

        .user-info {
            text-align: left;
        }

        .user-name {
            font-size: 0.875rem;
            font-weight: 500;
            color: #0f172a;
        }

        .user-role {
            font-size: 0.75rem;
            color: #64748b;
        }

        .dashboard-content {
            padding: 2rem;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .stat-card {
            background: #ffffff;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .stat-card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
        }

        .stat-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .stat-icon.blue { background: #dbeafe; color: #2563eb; }
        .stat-icon.green { background: #d1fae5; color: #10b981; }
        .stat-icon.purple { background: #ede9fe; color: #7c3aed; }
        .stat-icon.amber { background: #fef3c7; color: #f59e0b; }

        .stat-value {
            font-size: 2rem;
            font-weight: 700;
            color: #0f172a;
            line-height: 1;
            margin-bottom: 0.5rem;
        }

        .stat-label {
            font-size: 0.875rem;
            color: #64748b;
        }

        .stat-trend {
            font-size: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.25rem;
            margin-top: 0.5rem;
        }

        .stat-trend.up { color: #10b981; }
        .stat-trend.down { color: #ef4444; }

        .dashboard-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 1.5rem;
        }

        .card {
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.25rem 1.5rem;
            border-bottom: 1px solid #e2e8f0;
        }

        .card-title {
            font-size: 1rem;
            font-weight: 600;
            color: #0f172a;
            margin: 0;
        }

        .card-body {
            padding: 1.5rem;
        }

        /* Mobile responsiveness */
        @media (max-width: 1024px) {
            .dashboard-sidebar {
                transform: translateX(-100%);
            }

            .dashboard-sidebar.active {
                transform: translateX(0);
            }

            .dashboard-main {
                margin-left: 0;
            }

            .dashboard-grid {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 768px) {
            .dashboard-header {
                padding: 1rem;
            }

            .dashboard-search {
                display: none;
            }

            .dashboard-content {
                padding: 1rem;
            }

            .stats-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>

<body <?php body_class( 'dashboard-layout' ); ?>>
<?php wp_body_open(); ?>

<div class="dashboard-wrapper">
    <!-- Dashboard Sidebar -->
    <aside class="dashboard-sidebar" id="dashboardSidebar">
        <div class="dashboard-sidebar-header">
            <a href="<?php echo esc_url( home_url( '/dashboard' ) ); ?>" class="dashboard-logo">
                <div class="dashboard-logo-icon">
                    <span class="dashicons dashicons-chart-area" style="color: white;"></span>
                </div>
                <?php bloginfo( 'name' ); ?>
            </a>
        </div>

        <nav class="dashboard-nav">
            <div class="dashboard-nav-section">
                <div class="dashboard-nav-title">Main</div>
                <?php
                wp_nav_menu( array(
                    'theme_location' => 'dashboard',
                    'container'      => false,
                    'menu_class'     => 'dashboard-nav-menu',
                    'fallback_cb'    => false,
                    'depth'          => 2,
                ) );
                ?>

                <!-- Default Dashboard Navigation -->
                <a href="<?php echo esc_url( home_url( '/dashboard' ) ); ?>" class="dashboard-nav-item <?php echo ( ! $current_page || 'dashboard' === $current_page ) ? 'active' : ''; ?>">
                    <span class="dashboard-nav-icon dashicons dashicons-dashboard"></span>
                    <?php esc_html_e( 'Dashboard', 'coopvest-admin' ); ?>
                </a>
                <a href="<?php echo esc_url( home_url( '/dashboard/members' ) ); ?>" class="dashboard-nav-item <?php echo ( 'members' === $current_page ) ? 'active' : ''; ?>">
                    <span class="dashboard-nav-icon dashicons dashicons-groups"></span>
                    <?php esc_html_e( 'Members', 'coopvest-admin' ); ?>
                </a>
                <a href="<?php echo esc_url( home_url( '/dashboard/loans' ) ); ?>" class="dashboard-nav-item <?php echo ( 'loans' === $current_page ) ? 'active' : ''; ?>">
                    <span class="dashboard-nav-icon dashicons dashicons-money"></span>
                    <?php esc_html_e( 'Loans', 'coopvest-admin' ); ?>
                </a>
                <a href="<?php echo esc_url( home_url( '/dashboard/investments' ) ); ?>" class="dashboard-nav-item <?php echo ( 'investments' === $current_page ) ? 'active' : ''; ?>">
                    <span class="dashboard-nav-icon dashicons dashicons-chart-line"></span>
                    <?php esc_html_e( 'Investments', 'coopvest-admin' ); ?>
                </a>
                <a href="<?php echo esc_url( home_url( '/dashboard/wallet' ) ); ?>" class="dashboard-nav-item <?php echo ( 'wallet' === $current_page ) ? 'active' : ''; ?>">
                    <span class="dashboard-nav-icon dashicons dashicons-welcome-widgets-masonry"></span>
                    <?php esc_html_e( 'Wallet', 'coopvest-admin' ); ?>
                </a>
            </div>

            <div class="dashboard-nav-section">
                <div class="dashboard-nav-title">Reports</div>
                <a href="<?php echo esc_url( home_url( '/dashboard/reports' ) ); ?>" class="dashboard-nav-item <?php echo ( 'reports' === $current_page ) ? 'active' : ''; ?>">
                    <span class="dashboard-nav-icon dashicons dashicons-portfolio"></span>
                    <?php esc_html_e( 'Reports', 'coopvest-admin' ); ?>
                </a>
                <a href="<?php echo esc_url( home_url( '/dashboard/analytics' ) ); ?>" class="dashboard-nav-item <?php echo ( 'analytics' === $current_page ) ? 'active' : ''; ?>">
                    <span class="dashboard-nav-icon dashicons dashicons-chart-bar"></span>
                    <?php esc_html_e( 'Analytics', 'coopvest-admin' ); ?>
                </a>
            </div>

            <div class="dashboard-nav-section">
                <div class="dashboard-nav-title">Settings</div>
                <a href="<?php echo esc_url( home_url( '/dashboard/settings' ) ); ?>" class="dashboard-nav-item <?php echo ( 'settings' === $current_page ) ? 'active' : ''; ?>">
                    <span class="dashboard-nav-icon dashicons dashicons-admin-generic"></span>
                    <?php esc_html_e( 'Settings', 'coopvest-admin' ); ?>
                </a>
                <a href="<?php echo esc_url( admin_url( 'profile.php' ) ); ?>" class="dashboard-nav-item">
                    <span class="dashboard-nav-icon dashicons dashicons-admin-users"></span>
                    <?php esc_html_e( 'Profile', 'coopvest-admin' ); ?>
                </a>
            </div>
        </nav>
    </aside>

    <!-- Dashboard Main Content -->
    <main class="dashboard-main">
        <header class="dashboard-header">
            <div class="dashboard-header-left">
                <button class="sidebar-toggle" id="sidebarToggle" aria-label="Toggle Sidebar">
                    <span class="dashicons dashicons-menu-alt2"></span>
                </button>
                <h1 class="dashboard-title">
                    <?php
                    $titles = array(
                        'dashboard'   => __( 'Dashboard', 'coopvest-admin' ),
                        'members'     => __( 'Members', 'coopvest-admin' ),
                        'loans'       => __( 'Loans', 'coopvest-admin' ),
                        'investments' => __( 'Investments', 'coopvest-admin' ),
                        'wallet'      => __( 'Wallet', 'coopvest-admin' ),
                        'reports'     => __( 'Reports', 'coopvest-admin' ),
                        'analytics'   => __( 'Analytics', 'coopvest-admin' ),
                        'settings'    => __( 'Settings', 'coopvest-admin' ),
                    );
                    echo isset( $titles[ $current_page ] ) ? $titles[ $current_page ] : __( 'Dashboard', 'coopvest-admin' );
                    ?>
                </h1>
            </div>

            <div class="dashboard-header-right">
                <div class="dashboard-search">
                    <span class="dashboard-search-icon dashicons dashicons-search"></span>
                    <input type="search" placeholder="<?php esc_attr_e( 'Search...', 'coopvest-admin' ); ?>">
                </div>

                <button class="header-btn" aria-label="Notifications">
                    <span class="dashicons dashicons-bell"></span>
                    <span class="notification-badge">3</span>
                </button>

                <div class="user-menu" id="userMenu">
                    <div class="user-avatar">
                        <?php echo esc_html( substr( $current_user->display_name, 0, 2 ) ); ?>
                    </div>
                    <div class="user-info">
                        <div class="user-name"><?php echo esc_html( $current_user->display_name ); ?></div>
                        <div class="user-role"><?php esc_html_e( 'Administrator', 'coopvest-admin' ); ?></div>
                    </div>
                    <span class="dashicons dashicons-arrow-down-alt2" style="color: #64748b;"></span>
                </div>
            </div>
        </header>

        <div class="dashboard-content">
            <!-- React Dashboard App will be mounted here -->
            <div id="coopvest-dashboard-app"></div>

            <!-- Fallback content if React is not loaded -->
            <div class="dashboard-fallback">
                <?php if ( ! defined( 'COOPVEST_REACT_BUILD_PATH' ) ) : ?>
                    <div class="alert alert-info">
                        <p><?php esc_html_e( 'The React dashboard app needs to be built. Run `npm run build` in the src directory.', 'coopvest-admin' ); ?></p>
                    </div>
                <?php endif; ?>

                <!-- Default WordPress content as fallback -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-card-header">
                            <div class="stat-icon blue">
                                <span class="dashicons dashicons-groups" style="font-size: 24px;"></span>
                            </div>
                        </div>
                        <div class="stat-value"><?php echo wp_count_users()['total_users']; ?></div>
                        <div class="stat-label"><?php esc_html_e( 'Total Members', 'coopvest-admin' ); ?></div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-card-header">
                            <div class="stat-icon green">
                                <span class="dashicons dashicons-money" style="font-size: 24px;"></span>
                            </div>
                        </div>
                        <div class="stat-value"><?php echo wp_count_posts( 'loan' )->publish; ?></div>
                        <div class="stat-label"><?php esc_html_e( 'Active Loans', 'coopvest-admin' ); ?></div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-card-header">
                            <div class="stat-icon purple">
                                <span class="dashicons dashicons-chart-line" style="font-size: 24px;"></span>
                            </div>
                        </div>
                        <div class="stat-value"><?php echo wp_count_posts( 'investment' )->publish; ?></div>
                        <div class="stat-label"><?php esc_html_e( 'Investments', 'coopvest-admin' ); ?></div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-card-header">
                            <div class="stat-icon amber">
                                <span class="dashicons dashicons-portfolio" style="font-size: 24px;"></span>
                            </div>
                        </div>
                        <div class="stat-value"><?php echo wp_count_posts()->publish; ?></div>
                        <div class="stat-label"><?php esc_html_e( 'Total Posts', 'coopvest-admin' ); ?></div>
                    </div>
                </div>

                <div class="dashboard-grid">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><?php esc_html_e( 'Recent Activity', 'coopvest-admin' ); ?></h3>
                            <a href="#" class="btn btn-sm btn-outline"><?php esc_html_e( 'View All', 'coopvest-admin' ); ?></a>
                        </div>
                        <div class="card-body">
                            <?php
                            $recent_posts = wp_get_recent_posts( array(
                                'numberposts' => 5,
                                'post_status' => 'publish',
                            ) );

                            if ( $recent_posts ) :
                                ?>
                                <ul class="activity-list">
                                    <?php foreach ( $recent_posts as $post ) : ?>
                                        <li class="activity-item">
                                            <div class="activity-content">
                                                <a href="<?php echo esc_url( get_permalink( $post['ID'] ) ); ?>">
                                                    <?php echo esc_html( $post['post_title'] ); ?>
                                                </a>
                                                <span class="activity-date">
                                                    <?php echo esc_html( get_the_date( '', $post['ID'] ) ); ?>
                                                </span>
                                            </div>
                                        </li>
                                    <?php endforeach; ?>
                                </ul>
                            <?php else : ?>
                                <p class="no-activity"><?php esc_html_e( 'No recent activity.', 'coopvest-admin' ); ?></p>
                            <?php endif; ?>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><?php esc_html_e( 'Quick Actions', 'coopvest-admin' ); ?></h3>
                        </div>
                        <div class="card-body">
                            <div class="quick-actions">
                                <a href="<?php echo esc_url( admin_url( 'user-new.php' ) ); ?>" class="quick-action-btn">
                                    <span class="dashicons dashicons-plus"></span>
                                    <?php esc_html_e( 'Add Member', 'coopvest-admin' ); ?>
                                </a>
                                <a href="<?php echo esc_url( admin_url( 'post-new.php?post_type=loan' ) ); ?>" class="quick-action-btn">
                                    <span class="dashicons dashicons-money"></span>
                                    <?php esc_html_e( 'New Loan', 'coopvest-admin' ); ?>
                                </a>
                                <a href="<?php echo esc_url( admin_url( 'post-new.php?post_type=investment' ) ); ?>" class="quick-action-btn">
                                    <span class="dashicons dashicons-chart-line"></span>
                                    <?php esc_html_e( 'New Investment', 'coopvest-admin' ); ?>
                                </a>
                                <a href="<?php echo esc_url( admin_url( 'admin.php?page=coopvest-reports' ) ); ?>" class="quick-action-btn">
                                    <span class="dashicons dashicons-download"></span>
                                    <?php esc_html_e( 'Export Report', 'coopvest-admin' ); ?>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
</div>

<script>
    // Sidebar toggle functionality
    document.addEventListener('DOMContentLoaded', function() {
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('dashboardSidebar');

        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', function() {
                sidebar.classList.toggle('active');
            });

            // Close sidebar when clicking outside on mobile
            document.addEventListener('click', function(e) {
                if (window.innerWidth <= 1024 &&
                    !sidebar.contains(e.target) &&
                    !sidebarToggle.contains(e.target)) {
                    sidebar.classList.remove('active');
                }
            });
        }
    });
</script>

<?php wp_footer(); ?>

</body>
</html>
