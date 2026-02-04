<?php
/**
 * Template Name: Dashboard Template
 * Description: A comprehensive admin dashboard template for Coopvest cooperative management platform.
 *
 * @package Coopvest\Admin
 * @since 2.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

// Get the current user.
$current_user = wp_get_current_user();

// Get current page slug.
$current_page = get_query_var( 'pagename' ) ? get_query_var( 'pagename' ) : 'dashboard';

// Get stats.
$total_members = count_users()['total_users'];
$active_loans = wp_count_posts( 'loan' )->publish;
$active_investments = wp_count_posts( 'investment' )->publish;
?>

<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="<?php bloginfo( 'description' ); ?>">
    <link rel="profile" href="https://gmpg.org/xfn/11">
    <title><?php bloginfo( 'name' ); ?> - Admin Dashboard</title>

    <?php wp_head(); ?>
</head>

<body <?php body_class( 'admin-dashboard' ); ?>>
<?php wp_body_open(); ?>

<div class="admin-sidebar" id="adminSidebar">
    <!-- Sidebar Header -->
    <div class="admin-sidebar-header">
        <a href="<?php echo esc_url( home_url( '/dashboard' ) ); ?>" class="admin-logo">
            <div class="admin-logo-icon">
                <span class="dashicons dashicons-chart-area" style="color: white; font-size: 20px;"></span>
            </div>
            <div>
                <div class="admin-logo-text"><?php bloginfo( 'name' ); ?></div>
                <div class="admin-logo-tagline">Admin Panel</div>
            </div>
        </a>
    </div>

    <!-- Navigation -->
    <nav class="admin-sidebar-nav">
        <!-- Overview Section -->
        <div class="admin-nav-section">
            <div class="admin-nav-section-title"><?php esc_html_e( 'Overview', 'coopvest-admin' ); ?></div>
            <a href="<?php echo esc_url( home_url( '/dashboard' ) ); ?>" class="admin-nav-item <?php echo ( ! $current_page || 'dashboard' === $current_page ) ? 'active' : ''; ?>">
                <span class="admin-nav-icon dashicons dashicons-dashboard"></span>
                <span class="admin-nav-label"><?php esc_html_e( 'Dashboard', 'coopvest-admin' ); ?></span>
            </a>
            <a href="<?php echo esc_url( home_url( '/dashboard/analytics' ) ); ?>" class="admin-nav-item <?php echo ( 'analytics' === $current_page ) ? 'active' : ''; ?>">
                <span class="admin-nav-icon dashicons dashicons-chart-bar"></span>
                <span class="admin-nav-label"><?php esc_html_e( 'Analytics', 'coopvest-admin' ); ?></span>
            </a>
        </div>

        <!-- Members Section -->
        <div class="admin-nav-section">
            <div class="admin-nav-section-title"><?php esc_html_e( 'Members', 'coopvest-admin' ); ?></div>
            <a href="<?php echo esc_url( home_url( '/dashboard/members' ) ); ?>" class="admin-nav-item <?php echo ( 'members' === $current_page ) ? 'active' : ''; ?>">
                <span class="admin-nav-icon dashicons dashicons-groups"></span>
                <span class="admin-nav-label"><?php esc_html_e( 'All Members', 'coopvest-admin' ); ?></span>
                <span class="admin-nav-badge"><?php echo esc_html( $total_members ); ?></span>
            </a>
            <a href="<?php echo esc_url( home_url( '/dashboard/members/add' ) ); ?>" class="admin-nav-item">
                <span class="admin-nav-icon dashicons dashicons-plus"></span>
                <span class="admin-nav-label"><?php esc_html_e( 'Add Member', 'coopvest-admin' ); ?></span>
            </a>
            <a href="<?php echo esc_url( home_url( '/dashboard/risk-assessment' ) ); ?>" class="admin-nav-item <?php echo ( 'risk-assessment' === $current_page ) ? 'active' : ''; ?>">
                <span class="admin-nav-icon dashicons dashicons-shield"></span>
                <span class="admin-nav-label"><?php esc_html_e( 'Risk Assessment', 'coopvest-admin' ); ?></span>
            </a>
        </div>

        <!-- Finance Section -->
        <div class="admin-nav-section">
            <div class="admin-nav-section-title"><?php esc_html_e( 'Finance', 'coopvest-admin' ); ?></div>
            <a href="<?php echo esc_url( home_url( '/dashboard/loans' ) ); ?>" class="admin-nav-item <?php echo ( 'loans' === $current_page ) ? 'active' : ''; ?>">
                <span class="admin-nav-icon dashicons dashicons-money"></span>
                <span class="admin-nav-label"><?php esc_html_e( 'Loans', 'coopvest-admin' ); ?></span>
                <span class="admin-nav-badge"><?php echo esc_html( $active_loans ); ?></span>
            </a>
            <a href="<?php echo esc_url( home_url( '/dashboard/investments' ) ); ?>" class="admin-nav-item <?php echo ( 'investments' === $current_page ) ? 'active' : ''; ?>">
                <span class="admin-nav-icon dashicons dashicons-chart-line"></span>
                <span class="admin-nav-label"><?php esc_html_e( 'Investments', 'coopvest-admin' ); ?></span>
            </a>
            <a href="<?php echo esc_url( home_url( '/dashboard/wallet' ) ); ?>" class="admin-nav-item <?php echo ( 'wallet' === $current_page ) ? 'active' : ''; ?>">
                <span class="admin-nav-icon dashicons dashicons-welcome-widgets-masonry"></span>
                <span class="admin-nav-label"><?php esc_html_e( 'E-Wallet', 'coopvest-admin' ); ?></span>
            </a>
            <a href="<?php echo esc_url( home_url( '/dashboard/contributions' ) ); ?>" class="admin-nav-item <?php echo ( 'contributions' === $current_page ) ? 'active' : ''; ?>">
                <span class="admin-nav-icon dashicons dashicons-pressthis"></span>
                <span class="admin-nav-label"><?php esc_html_e( 'Contributions', 'coopvest-admin' ); ?></span>
            </a>
        </div>

        <!-- Tools Section -->
        <div class="admin-nav-section">
            <div class="admin-nav-section-title"><?php esc_html_e( 'Tools', 'coopvest-admin' ); ?></div>
            <a href="<?php echo esc_url( home_url( '/dashboard/documents' ) ); ?>" class="admin-nav-item <?php echo ( 'documents' === $current_page ) ? 'active' : ''; ?>">
                <span class="admin-nav-icon dashicons dashicons-media-document"></span>
                <span class="admin-nav-label"><?php esc_html_e( 'Documents', 'coopvest-admin' ); ?></span>
            </a>
            <a href="<?php echo esc_url( home_url( '/dashboard/referrals' ) ); ?>" class="admin-nav-item <?php echo ( 'referrals' === $current_page ) ? 'active' : ''; ?>">
                <span class="admin-nav-icon dashicons dashicons-share"></span>
                <span class="admin-nav-label"><?php esc_html_e( 'Referrals', 'coopvest-admin' ); ?></span>
            </a>
            <a href="<?php echo esc_url( home_url( '/dashboard/reports' ) ); ?>" class="admin-nav-item <?php echo ( 'reports' === $current_page ) ? 'active' : ''; ?>">
                <span class="admin-nav-icon dashicons dashicons-portfolio"></span>
                <span class="admin-nav-label"><?php esc_html_e( 'Reports', 'coopvest-admin' ); ?></span>
            </a>
        </div>

        <!-- Settings Section -->
        <div class="admin-nav-section">
            <div class="admin-nav-section-title"><?php esc_html_e( 'Settings', 'coopvest-admin' ); ?></div>
            <a href="<?php echo esc_url( home_url( '/dashboard/settings' ) ); ?>" class="admin-nav-item <?php echo ( 'settings' === $current_page ) ? 'active' : ''; ?>">
                <span class="admin-nav-icon dashicons dashicons-admin-generic"></span>
                <span class="admin-nav-label"><?php esc_html_e( 'Settings', 'coopvest-admin' ); ?></span>
            </a>
            <a href="<?php echo esc_url( home_url( '/dashboard/notifications' ) ); ?>" class="admin-nav-item <?php echo ( 'notifications' === $current_page ) ? 'active' : ''; ?>">
                <span class="admin-nav-icon dashicons dashicons-bell"></span>
                <span class="admin-nav-label"><?php esc_html_e( 'Notifications', 'coopvest-admin' ); ?></span>
                <span class="admin-nav-badge">5</span>
            </a>
        </div>
    </nav>

    <!-- Sidebar Footer -->
    <div class="admin-sidebar-footer">
        <div class="admin-upgrade-card">
            <div class="admin-upgrade-title"><?php esc_html_e( 'Upgrade to Pro', 'coopvest-admin' ); ?></div>
            <div class="admin-upgrade-desc"><?php esc_html_e( 'Unlock all features with our premium plan.', 'coopvest-admin' ); ?></div>
            <button class="admin-upgrade-btn"><?php esc_html_e( 'Upgrade Now', 'coopvest-admin' ); ?></button>
        </div>
    </div>
</div>

<!-- Main Content -->
<main class="admin-main">
    <!-- Header -->
    <header class="admin-header">
        <div class="admin-header-left">
            <button class="admin-menu-toggle" id="sidebarToggle" aria-label="Toggle Sidebar">
                <span class="dashicons dashicons-menu-alt2"></span>
            </button>
            <nav class="admin-breadcrumb">
                <a href="<?php echo esc_url( home_url( '/dashboard' ) ); ?>"><?php esc_html_e( 'Home', 'coopvest-admin' ); ?></a>
                <span class="admin-breadcrumb-separator">/</span>
                <span class="admin-breadcrumb-current">
                    <?php
                    $titles = array(
                        'dashboard'        => __( 'Dashboard', 'coopvest-admin' ),
                        'members'          => __( 'Members', 'coopvest-admin' ),
                        'loans'            => __( 'Loans', 'coopvest-admin' ),
                        'investments'      => __( 'Investments', 'coopvest-admin' ),
                        'wallet'           => __( 'E-Wallet', 'coopvest-admin' ),
                        'contributions'    => __( 'Contributions', 'coopvest-admin' ),
                        'risk-assessment'  => __( 'Risk Assessment', 'coopvest-admin' ),
                        'documents'        => __( 'Documents', 'coopvest-admin' ),
                        'referrals'        => __( 'Referrals', 'coopvest-admin' ),
                        'reports'          => __( 'Reports', 'coopvest-admin' ),
                        'analytics'        => __( 'Analytics', 'coopvest-admin' ),
                        'settings'         => __( 'Settings', 'coopvest-admin' ),
                        'notifications'    => __( 'Notifications', 'coopvest-admin' ),
                    );
                    echo isset( $titles[ $current_page ] ) ? $titles[ $current_page ] : __( 'Dashboard', 'coopvest-admin' );
                    ?>
                </span>
            </nav>
        </div>

        <div class="admin-header-right">
            <div class="admin-search">
                <span class="admin-search-icon dashicons dashicons-search"></span>
                <input type="search" class="admin-search-input" placeholder="<?php esc_attr_e( 'Search members, loans, investments...', 'coopvest-admin' ); ?>">
            </div>

            <button class="admin-notification-btn" id="notificationBtn" aria-label="Notifications">
                <span class="dashicons dashicons-bell"></span>
                <span class="admin-notification-badge">5</span>
            </button>

            <div class="admin-user-menu" id="userMenu">
                <div class="admin-user-avatar">
                    <?php echo esc_html( substr( $current_user->display_name, 0, 2 ) ); ?>
                </div>
                <div class="admin-user-info">
                    <div class="admin-user-name"><?php echo esc_html( $current_user->display_name ); ?></div>
                    <div class="admin-user-role"><?php esc_html_e( 'Administrator', 'coopvest-admin' ); ?></div>
                </div>
                <span class="dashicons dashicons-arrow-down-alt2" style="color: #64748b;"></span>
            </div>
        </div>
    </header>

    <!-- Content -->
    <div class="admin-content">
        <!-- Dashboard Overview -->
        <div class="admin-page-header">
            <h1 class="admin-page-title"><?php esc_html_e( 'Welcome back!', 'coopvest-admin' ); ?></h1>
            <p class="admin-page-description"><?php esc_html_e( 'Here\'s what\'s happening with your cooperative today.', 'coopvest-admin' ); ?></p>
        </div>

        <!-- Stats Cards -->
        <div class="admin-stats">
            <div class="admin-stat-card">
                <div class="admin-stat-header">
                    <div class="admin-stat-icon blue">
                        <span class="dashicons dashicons-groups" style="font-size: 24px;"></span>
                    </div>
                    <span class="admin-stat-trend up">
                        <span class="dashicons dashicons-arrow-up-alt2"></span>
                        12%
                    </span>
                </div>
                <div class="admin-stat-value"><?php echo number_format( $total_members ); ?></div>
                <div class="admin-stat-label"><?php esc_html_e( 'Total Members', 'coopvest-admin' ); ?></div>
                <div class="admin-stat-comparison"><?php esc_html_e( 'vs last month', 'coopvest-admin' ); ?></div>
            </div>

            <div class="admin-stat-card">
                <div class="admin-stat-header">
                    <div class="admin-stat-icon green">
                        <span class="dashicons dashicons-money" style="font-size: 24px;"></span>
                    </div>
                    <span class="admin-stat-trend up">
                        <span class="dashicons dashicons-arrow-up-alt2"></span>
                        8%
                    </span>
                </div>
                <div class="admin-stat-value"><?php echo number_format( $active_loans ); ?></div>
                <div class="admin-stat-label"><?php esc_html_e( 'Active Loans', 'coopvest-admin' ); ?></div>
                <div class="admin-stat-comparison"><?php esc_html_e( 'vs last month', 'coopvest-admin' ); ?></div>
            </div>

            <div class="admin-stat-card">
                <div class="admin-stat-header">
                    <div class="admin-stat-icon purple">
                        <span class="dashicons dashicons-chart-line" style="font-size: 24px;"></span>
                    </div>
                    <span class="admin-stat-trend up">
                        <span class="dashicons dashicons-arrow-up-alt2"></span>
                        15%
                    </span>
                </div>
                <div class="admin-stat-value"><?php echo number_format( $active_investments ); ?></div>
                <div class="admin-stat-label"><?php esc_html_e( 'Investments', 'coopvest-admin' ); ?></div>
                <div class="admin-stat-comparison"><?php esc_html_e( 'vs last month', 'coopvest-admin' ); ?></div>
            </div>

            <div class="admin-stat-card">
                <div class="admin-stat-header">
                    <div class="admin-stat-icon amber">
                        <span class="dashicons dashicons-pressthis" style="font-size: 24px;"></span>
                    </div>
                    <span class="admin-stat-trend up">
                        <span class="dashicons dashicons-arrow-up-alt2"></span>
                        5%
                    </span>
                </div>
                <div class="admin-stat-value">$124K</div>
                <div class="admin-stat-label"><?php esc_html_e( 'Total Savings', 'coopvest-admin' ); ?></div>
                <div class="admin-stat-comparison"><?php esc_html_e( 'vs last month', 'coopvest-admin' ); ?></div>
            </div>

            <div class="admin-stat-card">
                <div class="admin-stat-header">
                    <div class="admin-stat-icon cyan">
                        <span class="dashicons dashicons-smiley" style="font-size: 24px;"></span>
                    </div>
                    <span class="admin-stat-trend up">
                        <span class="dashicons dashicons-arrow-up-alt2"></span>
                        3%
                    </span>
                </div>
                <div class="admin-stat-value">98%</div>
                <div class="admin-stat-label"><?php esc_html_e( 'Approval Rate', 'coopvest-admin' ); ?></div>
                <div class="admin-stat-comparison"><?php esc_html_e( 'vs last month', 'coopvest-admin' ); ?></div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="admin-quick-actions">
            <a href="<?php echo esc_url( admin_url( 'user-new.php' ) ); ?>" class="admin-quick-action">
                <div class="admin-quick-action-icon blue">
                    <span class="dashicons dashicons-plus" style="font-size: 20px;"></span>
                </div>
                <div class="admin-quick-action-info">
                    <h4><?php esc_html_e( 'Add Member', 'coopvest-admin' ); ?></h4>
                    <p><?php esc_html_e( 'Register a new member', 'coopvest-admin' ); ?></p>
                </div>
            </a>

            <a href="<?php echo esc_url( admin_url( 'post-new.php?post_type=loan' ) ); ?>" class="admin-quick-action">
                <div class="admin-quick-action-icon green">
                    <span class="dashicons dashicons-money" style="font-size: 20px;"></span>
                </div>
                <div class="admin-quick-action-info">
                    <h4><?php esc_html_e( 'New Loan', 'coopvest-admin' ); ?></h4>
                    <p><?php esc_html_e( 'Process a loan application', 'coopvest-admin' ); ?></p>
                </div>
            </a>

            <a href="<?php echo esc_url( home_url( '/dashboard/wallet' ) ); ?>" class="admin-quick-action">
                <div class="admin-quick-action-icon purple">
                    <span class="dashicons dashicons-welcome-widgets-masonry" style="font-size: 20px;"></span>
                </div>
                <div class="admin-quick-action-info">
                    <h4><?php esc_html_e( 'E-Wallet', 'coopvest-admin' ); ?></h4>
                    <p><?php esc_html_e( 'Manage wallets & transactions', 'coopvest-admin' ); ?></p>
                </div>
            </a>

            <a href="<?php echo esc_url( home_url( '/dashboard/reports' ) ); ?>" class="admin-quick-action">
                <div class="admin-quick-action-icon amber">
                    <span class="dashicons dashicons-download" style="font-size: 20px;"></span>
                </div>
                <div class="admin-quick-action-info">
                    <h4><?php esc_html_e( 'Export Reports', 'coopvest-admin' ); ?></h4>
                    <p><?php esc_html_e( 'Generate financial reports', 'coopvest-admin' ); ?></p>
                </div>
            </a>
        </div>

        <!-- Charts & Activity Grid -->
        <div class="admin-charts-grid">
            <!-- Revenue Chart Card -->
            <div class="admin-chart-card">
                <div class="admin-chart-header">
                    <h3 class="admin-chart-title"><?php esc_html_e( 'Revenue Overview', 'coopvest-admin' ); ?></h3>
                    <div class="admin-chart-actions">
                        <button class="admin-chart-period active"><?php esc_html_e( 'Week', 'coopvest-admin' ); ?></button>
                        <button class="admin-chart-period"><?php esc_html_e( 'Month', 'coopvest-admin' ); ?></button>
                        <button class="admin-chart-period"><?php esc_html_e( 'Year', 'coopvest-admin' ); ?></button>
                    </div>
                </div>
                <div class="admin-chart-container">
                    <div class="admin-chart-placeholder">
                        <div class="loading-spinner"></div>
                        <p style="margin-top: 1rem;"><?php esc_html_e( 'Chart will render here', 'coopvest-admin' ); ?></p>
                        <p class="text-sm text-gray"><?php esc_html_e( 'Integrate with your charting library', 'coopvest-admin' ); ?></p>
                    </div>
                </div>
            </div>

            <!-- Recent Activity Card -->
            <div class="admin-chart-card">
                <div class="admin-chart-header">
                    <h3 class="admin-chart-title"><?php esc_html_e( 'Recent Activity', 'coopvest-admin' ); ?></h3>
                    <a href="#" class="btn btn-sm btn-outline"><?php esc_html_e( 'View All', 'coopvest-admin' ); ?></a>
                </div>
                <div class="admin-activity-list">
                    <div class="admin-activity-item">
                        <div class="admin-activity-icon success">
                            <span class="dashicons dashicons-yes-alt"></span>
                        </div>
                        <div class="admin-activity-content">
                            <div class="admin-activity-title"><?php esc_html_e( 'Loan Approved', 'coopvest-admin' ); ?></div>
                            <div class="admin-activity-description"><?php esc_html_e( 'John Doe\'s loan application approved', 'coopvest-admin' ); ?></div>
                        </div>
                        <span class="admin-activity-time">2m ago</span>
                    </div>

                    <div class="admin-activity-item">
                        <div class="admin-activity-icon info">
                            <span class="dashicons dashicons-admin-users"></span>
                        </div>
                        <div class="admin-activity-content">
                            <div class="admin-activity-title"><?php esc_html_e( 'New Member Joined', 'coopvest-admin' ); ?></div>
                            <div class="admin-activity-description"><?php esc_html_e( 'Sarah Wilson registered successfully', 'coopvest-admin' ); ?></div>
                        </div>
                        <span class="admin-activity-time">15m ago</span>
                    </div>

                    <div class="admin-activity-item">
                        <div class="admin-activity-icon purple">
                            <span class="dashicons dashicons-chart-line"></span>
                        </div>
                        <div class="admin-activity-content">
                            <div class="admin-activity-title"><?php esc_html_e( 'Investment Created', 'coopvest-admin' ); ?></div>
                            <div class="admin-activity-description"><?php esc_html_e( 'New investment plan added by Mike Johnson', 'coopvest-admin' ); ?></div>
                        </div>
                        <span class="admin-activity-time">1h ago</span>
                    </div>

                    <div class="admin-activity-item">
                        <div class="admin-activity-icon warning">
                            <span class="dashicons dashicons-warning"></span>
                        </div>
                        <div class="admin-activity-content">
                            <div class="admin-activity-title"><?php esc_html_e( 'Payment Due Reminder', 'coopvest-admin' ); ?></div>
                            <div class="admin-activity-description"><?php esc_html_e( '5 loans have upcoming due dates', 'coopvest-admin' ); ?></div>
                        </div>
                        <span class="admin-activity-time">3h ago</span>
                    </div>

                    <div class="admin-activity-item">
                        <div class="admin-activity-icon success">
                            <span class="dashicons dashicons-yes-alt"></span>
                        </div>
                        <div class="admin-activity-content">
                            <div class="admin-activity-title"><?php esc_html_e( 'Contribution Received', 'coopvest-admin' ); ?></div>
                            <div class="admin-activity-description"><?php esc_html_e( 'Monthly contribution from 25 members', 'coopvest-admin' ); ?></div>
                        </div>
                        <span class="admin-activity-time">5h ago</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Members Table -->
        <div class="admin-table-card">
            <div class="admin-table-header">
                <h3 class="admin-table-title"><?php esc_html_e( 'Recent Members', 'coopvest-admin' ); ?></h3>
                <div class="admin-table-filters">
                    <button class="admin-table-filter active"><?php esc_html_e( 'All', 'coopvest-admin' ); ?></button>
                    <button class="admin-table-filter"><?php esc_html_e( 'Active', 'coopvest-admin' ); ?></button>
                    <button class="admin-table-filter"><?php esc_html_e( 'Pending', 'coopvest-admin' ); ?></button>
                    <button class="admin-table-filter"><?php esc_html_e( 'Inactive', 'coopvest-admin' ); ?></button>
                </div>
            </div>
            <div class="admin-table-container">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th><?php esc_html_e( 'Member', 'coopvest-admin' ); ?></th>
                            <th><?php esc_html_e( 'Status', 'coopvest-admin' ); ?></th>
                            <th><?php esc_html_e( 'Loans', 'coopvest-admin' ); ?></th>
                            <th><?php esc_html_e( 'Savings', 'coopvest-admin' ); ?></th>
                            <th><?php esc_html_e( 'Risk Score', 'coopvest-admin' ); ?></th>
                            <th><?php esc_html_e( 'Joined', 'coopvest-admin' ); ?></th>
                            <th><?php esc_html_e( 'Actions', 'coopvest-admin' ); ?></th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php
                        $sample_members = array(
                            array( 'name' => 'John Doe', 'email' => 'john@example.com', 'status' => 'active', 'loans' => 2, 'savings' => '$5,000', 'risk' => 25, 'joined' => 'Jan 15, 2024' ),
                            array( 'name' => 'Sarah Wilson', 'email' => 'sarah@example.com', 'status' => 'active', 'loans' => 1, 'savings' => '$3,200', 'risk' => 15, 'joined' => 'Feb 3, 2024' ),
                            array( 'name' => 'Mike Johnson', 'email' => 'mike@example.com', 'status' => 'pending', 'loans' => 0, 'savings' => '$1,000', 'risk' => 45, 'joined' => 'Feb 10, 2024' ),
                            array( 'name' => 'Emily Brown', 'email' => 'emily@example.com', 'status' => 'active', 'loans' => 3, 'savings' => '$8,500', 'risk' => 20, 'joined' => 'Jan 22, 2024' ),
                            array( 'name' => 'David Lee', 'email' => 'david@example.com', 'status' => 'inactive', 'loans' => 1, 'savings' => '$2,100', 'risk' => 60, 'joined' => 'Dec 5, 2023' ),
                        );

                        foreach ( $sample_members as $member ) :
                            $risk_class = $member['risk'] < 30 ? 'low' : ( $member['risk'] < 60 ? 'medium' : 'high' );
                            ?>
                            <tr>
                                <td>
                                    <div class="member-cell">
                                        <div class="member-avatar"><?php echo esc_html( substr( $member['name'], 0, 2 ) ); ?></div>
                                        <div class="member-info">
                                            <h4><?php echo esc_html( $member['name'] ); ?></h4>
                                            <p><?php echo esc_html( $member['email'] ); ?></p>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span class="status-badge <?php echo esc_attr( $member['status'] ); ?>">
                                        <?php echo esc_html( ucfirst( $member['status'] ) ); ?>
                                    </span>
                                </td>
                                <td><?php echo esc_html( $member['loans'] ); ?></td>
                                <td><?php echo esc_html( $member['savings'] ); ?></td>
                                <td>
                                    <div class="table-progress">
                                        <div class="table-progress-bar">
                                            <div class="table-progress-fill <?php echo esc_attr( $risk_class ); ?>" style="width: <?php echo esc_attr( $member['risk'] ); ?>%;"></div>
                                        </div>
                                        <div class="table-progress-text"><?php echo esc_html( $member['risk'] ); ?>%</div>
                                    </div>
                                </td>
                                <td><?php echo esc_html( $member['joined'] ); ?></td>
                                <td>
                                    <div class="action-btns">
                                        <button class="action-btn view" title="<?php esc_attr_e( 'View', 'coopvest-admin' ); ?>">
                                            <span class="dashicons dashicons-visibility"></span>
                                        </button>
                                        <button class="action-btn edit" title="<?php esc_attr_e( 'Edit', 'coopvest-admin' ); ?>">
                                            <span class="dashicons dashicons-edit"></span>
                                        </button>
                                        <button class="action-btn delete" title="<?php esc_attr_e( 'Delete', 'coopvest-admin' ); ?>">
                                            <span class="dashicons dashicons-trash"></span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</main>

<!-- Notification Panel -->
<div class="notification-panel" id="notificationPanel">
    <div class="notification-panel-header">
        <h3 class="notification-panel-title"><?php esc_html_e( 'Notifications', 'coopvest-admin' ); ?></h3>
        <button class="notification-panel-close" id="notificationClose">
            <span class="dashicons dashicons-no-alt"></span>
        </button>
    </div>
    <div class="notification-list">
        <div class="notification-item unread">
            <div class="notification-icon" style="background: #dbeafe; color: #2563eb;">
                <span class="dashicons dashicons-money"></span>
            </div>
            <div class="notification-content">
                <div class="notification-title"><?php esc_html_e( 'Loan Application Received', 'coopvest-admin' ); ?></div>
                <div class="notification-message"><?php esc_html_e( 'John Doe has submitted a new loan application for review.', 'coopvest-admin' ); ?></div>
                <div class="notification-time"><?php esc_html_e( '5 minutes ago', 'coopvest-admin' ); ?></div>
            </div>
        </div>

        <div class="notification-item unread">
            <div class="notification-icon" style="background: #d1fae5; color: #10b981;">
                <span class="dashicons dashicons-yes-alt"></span>
            </div>
            <div class="notification-content">
                <div class="notification-title"><?php esc_html_e( 'Payment Received', 'coopvest-admin' ); ?></div>
                <div class="notification-message"><?php esc_html_e( 'Monthly contribution of $5,000 received from 25 members.', 'coopvest-admin' ); ?></div>
                <div class="notification-time"><?php esc_html_e( '1 hour ago', 'coopvest-admin' ); ?></div>
            </div>
        </div>

        <div class="notification-item">
            <div class="notification-icon" style="background: #fef3c7; color: #f59e0b;">
                <span class="dashicons dashicons-warning"></span>
            </div>
            <div class="notification-content">
                <div class="notification-title"><?php esc_html_e( 'Loan Payment Due', 'coopvest-admin' ); ?></div>
                <div class="notification-message"><?php esc_html_e( '5 loans have payments due within the next 3 days.', 'coopvest-admin' ); ?></div>
                <div class="notification-time"><?php esc_html_e( '3 hours ago', 'coopvest-admin' ); ?></div>
            </div>
        </div>

        <div class="notification-item">
            <div class="notification-icon" style="background: #ede9fe; color: #7c3aed;">
                <span class="dashicons dashicons-admin-users"></span>
            </div>
            <div class="notification-content">
                <div class="notification-title"><?php esc_html_e( 'New Member Registration', 'coopvest-admin' ); ?></div>
                <div class="notification-message"><?php esc_html_e( 'Sarah Wilson has completed registration and is awaiting approval.', 'coopvest-admin' ); ?></div>
                <div class="notification-time"><?php esc_html_e( 'Yesterday', 'coopvest-admin' ); ?></div>
            </div>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('adminSidebar');

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });

        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 1024 &&
                !sidebar.contains(e.target) &&
                !sidebarToggle.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        });
    }

    const notificationBtn = document.getElementById('notificationBtn');
    const notificationPanel = document.getElementById('notificationPanel');
    const notificationClose = document.getElementById('notificationClose');

    if (notificationBtn && notificationPanel) {
        notificationBtn.addEventListener('click', function() {
            notificationPanel.classList.toggle('active');
        });

        if (notificationClose) {
            notificationClose.addEventListener('click', function() {
                notificationPanel.classList.remove('active');
            });
        }
    }

    const chartPeriods = document.querySelectorAll('.admin-chart-period');
    chartPeriods.forEach(function(btn) {
        btn.addEventListener('click', function() {
            chartPeriods.forEach(function(b) { b.classList.remove('active'); });
            this.classList.add('active');
        });
    });

    const tableFilters = document.querySelectorAll('.admin-table-filter');
    tableFilters.forEach(function(btn) {
        btn.addEventListener('click', function() {
            tableFilters.forEach(function(b) { b.classList.remove('active'); });
            this.classList.add('active');
        });
    });
});
</script>

<?php wp_footer(); ?>

</body>
</html>
