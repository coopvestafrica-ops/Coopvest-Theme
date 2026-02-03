import React, { useState, useEffect } from 'react'
import { Card, List, Badge, Button, Tag, Empty, Tabs, Select, Space, Popconfirm, Typography } from 'antd'
import { BellOutlined, CheckCircleOutlined, WarningOutlined, InfoCircleOutlined, DeleteOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons'
import '../../styles/NotificationCenter.css'

const { Text, Title } = Typography

const NotificationCenter = () => {
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [activeTab, setActiveTab] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')

  useEffect(() => {
    fetchNotifications()
  }, [activeTab, filterPriority])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      // Simulated API call
      const mockNotifications = [
        {
          _id: '1',
          notificationId: 'NOTIF001',
          type: 'loan_approval',
          priority: 'high',
          title: 'Loan Approved',
          message: 'Adebayo Okafor\'s loan application of ₦500,000 has been approved.',
          read: false,
          createdAt: '2024-01-15T10:30:00Z',
          channel: 'in_app'
        },
        {
          _id: '2',
          notificationId: 'NOTIF002',
          type: 'loan_repayment_overdue',
          priority: 'urgent',
          title: 'Payment Overdue',
          message: '3 loans are past due date. Total outstanding: ₦1,250,000',
          read: false,
          createdAt: '2024-01-15T09:15:00Z',
          channel: 'in_app'
        },
        {
          _id: '3',
          notificationId: 'NOTIF003',
          type: 'kyc_approved',
          priority: 'medium',
          title: 'KYC Verification Complete',
          message: 'Sarah Johnson\'s KYC documents have been verified and approved.',
          read: true,
          createdAt: '2024-01-14T16:45:00Z',
          channel: 'in_app'
        },
        {
          _id: '4',
          notificationId: 'NOTIF004',
          type: 'contribution_reminder',
          priority: 'low',
          title: 'Monthly Contribution Reminder',
          message: 'Reminder: 45 members have not made their monthly contribution.',
          read: true,
          createdAt: '2024-01-14T08:00:00Z',
          channel: 'in_app'
        },
        {
          _id: '5',
          notificationId: 'NOTIF005',
          type: 'fraud_alert',
          priority: 'urgent',
          title: 'Suspicious Activity Detected',
          message: 'Multiple accounts using the same device have been detected.',
          read: false,
          createdAt: '2024-01-13T22:30:00Z',
          channel: 'in_app'
        },
        {
          _id: '6',
          notificationId: 'NOTIF006',
          type: 'investment_update',
          priority: 'medium',
          title: 'Investment Matured',
          message: 'Investment #INV-2024-001 of ₦2,000,000 has matured.',
          read: true,
          createdAt: '2024-01-13T14:20:00Z',
          channel: 'email'
        }
      ]

      let filtered = mockNotifications
      if (activeTab === 'unread') {
        filtered = mockNotifications.filter(n => !n.read)
      }
      if (filterPriority !== 'all') {
        filtered = filtered.filter(n => n.priority === filterPriority)
      }

      setNotifications(filtered)
      setUnreadCount(mockNotifications.filter(n => !n.read).length)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId) => {
    // API call to mark as read
    setNotifications(notifications.map(n => 
      n._id === notificationId ? { ...n, read: true } : n
    ))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const handleMarkAllAsRead = async () => {
    // API call to mark all as read
    setNotifications(notifications.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const handleDelete = async (notificationId) => {
    // API call to delete
    setNotifications(notifications.filter(n => n._id !== notificationId))
  }

  const handleDeleteAll = async () => {
    // API call to delete all
    setNotifications([])
  }

  const getPriorityColor = (priority) => {
    const colors = { urgent: '#ff4d4f', high: '#faad14', medium: '#1890ff', low: '#52c41a' }
    return colors[priority] || '#999'
  }

  const getTypeIcon = (type) => {
    if (type.includes('loan')) return <CheckCircleOutlined style={{ color: '#52c41a' }} />
    if (type.includes('fraud') || type.includes('overdue')) return <WarningOutlined style={{ color: '#ff4d4f' }} />
    if (type.includes('kyc')) return <InfoCircleOutlined style={{ color: '#1890ff' }} />
    return <BellOutlined style={{ color: '#999' }} />
  }

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    return `${Math.floor(diffInSeconds / 86400)} days ago`
  }

  const renderNotificationItem = (item) => (
    <List.Item
      className={`notification-item ${!item.read ? 'unread' : ''}`}
      actions={[
        !item.read && (
          <Button 
            type="link" 
            size="small" 
            onClick={() => handleMarkAsRead(item._id)}
          >
            Mark as read
          </Button>
        ),
        <Popconfirm
          title="Delete this notification?"
          onConfirm={() => handleDelete(item._id)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="text" size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ].filter(Boolean)}
    >
      <List.Item.Meta
        avatar={
          <div className="notification-icon" style={{ backgroundColor: getPriorityColor(item.priority) }}>
            {getTypeIcon(item.type)}
          </div>
        }
        title={
          <div className="notification-header">
            <Text strong={!item.read}>{item.title}</Text>
            <Space>
              <Tag color={getPriorityColor(item.priority)}>{item.priority.toUpperCase()}</Tag>
              {item.channel === 'email' && <MailOutlined />}
              {item.channel === 'sms' && <PhoneOutlined />}
            </Space>
          </div>
        }
        description={
          <div className="notification-body">
            <Text type="secondary">{item.message}</Text>
            <Text type="secondary" className="notification-time">
              {formatTimeAgo(item.createdAt)}
            </Text>
          </div>
        }
      />
    </List.Item>
  )

  const tabItems = [
    {
      key: 'all',
      label: (
        <span>
          All <Badge count={notifications.length} style={{ marginLeft: 8 }} />
        </span>
      ),
      children: (
        notifications.length > 0 ? (
          <List
            dataSource={notifications}
            renderItem={renderNotificationItem}
            loading={loading}
          />
        ) : (
          <Empty description="No notifications" />
        )
      )
    },
    {
      key: 'unread',
      label: (
        <span>
          Unread <Badge count={unreadCount} style={{ backgroundColor: '#52c41a', marginLeft: 8 }} />
        </span>
      ),
      children: (
        notifications.filter(n => !n.read).length > 0 ? (
          <List
            dataSource={notifications.filter(n => !n.read)}
            renderItem={renderNotificationItem}
            loading={loading}
          />
        ) : (
          <Empty description="No unread notifications" />
        )
      )
    },
    {
      key: 'sent',
      label: 'Sent',
      children: (
        <List
          dataSource={notifications}
          renderItem={renderNotificationItem}
          loading={loading}
        />
      )
    }
  ]

  return (
    <div className="notification-center">
      <div className="page-header">
        <h1>
          <BellOutlined /> Notification Center
          {unreadCount > 0 && <Badge count={unreadCount} className="unread-badge" />}
        </h1>
        <Space>
          <Select
            value={filterPriority}
            onChange={setFilterPriority}
            style={{ width: 140 }}
            options={[
              { value: 'all', label: 'All Priorities' },
              { value: 'urgent', label: 'Urgent' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' }
            ]}
          />
          <Button onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
            Mark All as Read
          </Button>
          <Popconfirm
            title="Delete all notifications?"
            onConfirm={handleDeleteAll}
            okText="Yes"
            cancelText="No"
          >
            <Button danger>Clear All</Button>
          </Popconfirm>
        </Space>
      </div>

      <Card className="notification-card">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>

      <Card title="Quick Stats" className="stats-card">
        <div className="stats-grid">
          <div className="stat-item">
            <Text type="secondary">Total Notifications</Text>
            <Title level={3}>{notifications.length}</Title>
          </div>
          <div className="stat-item">
            <Text type="secondary">Unread</Text>
            <Title level={3} style={{ color: unreadCount > 0 ? '#ff4d4f' : '#52c41a' }}>
              {unreadCount}
            </Title>
          </div>
          <div className="stat-item">
            <Text type="secondary">Urgent</Text>
            <Title level={3} style={{ color: '#ff4d4f' }}>
              {notifications.filter(n => n.priority === 'urgent').length}
            </Title>
          </div>
          <div className="stat-item">
            <Text type="secondary">Sent via Email</Text>
            <Title level={3}>
              {notifications.filter(n => n.channel === 'email').length}
            </Title>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default NotificationCenter
