import React, { useState, useEffect, useRef } from 'react'
import { Card, Row, Col, List, Input, Button, Avatar, Badge, Tag, Space, Select, Divider, Empty, Typography } from 'antd'
import { SendOutlined, UserOutlined, PaperClipOutlined, SearchOutlined, MoreOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import '../styles/SupportChat.css'

const { Text } = Typography
const { TextArea } = Input
const { Option } = Select

const SupportChat = () => {
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setConversations([
        {
          id: 'conv001',
          member: { _id: 'MEM001', firstName: 'Adeyemi', lastName: 'Olumide', memberId: 'CVD-2024-001', avatar: null },
          subject: 'Loan Application Status',
          status: 'open',
          priority: 'high',
          lastMessage: 'When will my loan be approved?',
          lastMessageAt: '2024-01-15T14:30:00',
          unreadCount: 2,
          messages: [
            { id: 'msg001', sender: 'member', content: 'Hello, I submitted a loan application 3 days ago and haven\'t heard back.', timestamp: '2024-01-15T10:00:00' },
            { id: 'msg002', sender: 'admin', content: 'Hi Adeyemi, thank you for reaching out. Let me check the status of your application.', timestamp: '2024-01-15T10:15:00' },
            { id: 'msg003', sender: 'admin', content: 'Your application is under review by our loan committee. We should have a decision by tomorrow.', timestamp: '2024-01-15T10:20:00' },
            { id: 'msg004', sender: 'member', content: 'Thank you! When will my loan be approved?', timestamp: '2024-01-15T14:30:00' }
          ]
        },
        {
          id: 'conv002',
          member: { _id: 'MEM002', firstName: 'Chioma', lastName: 'Nwachukwu', memberId: 'CVD-2024-002', avatar: null },
          subject: 'Contribution Issue',
          status: 'pending',
          priority: 'medium',
          lastMessage: 'I tried making a contribution but it failed.',
          lastMessageAt: '2024-01-15T12:00:00',
          unreadCount: 1,
          messages: [
            { id: 'msg005', sender: 'member', content: 'I attempted to make my monthly contribution but the payment failed even though I have funds.', timestamp: '2024-01-15T12:00:00' }
          ]
        },
        {
          id: 'conv003',
          member: { _id: 'MEM003', firstName: 'Emeka', lastName: 'Okonkwo', memberId: 'CVD-2024-003', avatar: null },
          subject: 'Rollover Request',
          status: 'resolved',
          priority: 'low',
          lastMessage: 'Thank you for your help!',
          lastMessageAt: '2024-01-14T16:00:00',
          unreadCount: 0,
          messages: [
            { id: 'msg006', sender: 'member', content: 'I need to request a loan rollover.', timestamp: '2024-01-14T09:00:00' },
            { id: 'msg007', sender: 'admin', content: 'Hi Emeka, I can help you with that. Please provide your loan ID.', timestamp: '2024-01-14T09:15:00' },
            { id: 'msg008', sender: 'member', content: 'It\'s LOAN-2024-001', timestamp: '2024-01-14T09:30:00' },
            { id: 'msg009', sender: 'admin', content: 'Your rollover request has been processed. You will receive a confirmation email shortly.', timestamp: '2024-01-14T10:00:00' },
            { id: 'msg010', sender: 'member', content: 'Thank you for your help!', timestamp: '2024-01-14T16:00:00' }
          ]
        },
        {
          id: 'conv004',
          member: { _id: 'MEM004', firstName: 'Folake', lastName: 'Adeyemi', memberId: 'CVD-2024-004', avatar: null },
          subject: 'Account Access',
          status: 'open',
          priority: 'high',
          lastMessage: 'I cannot login to my account',
          lastMessageAt: '2024-01-15T08:00:00',
          unreadCount: 1,
          messages: [
            { id: 'msg011', sender: 'member', content: 'I cannot login to my account. It says my password is incorrect but I\'m sure it\'s correct.', timestamp: '2024-01-15T08:00:00' }
          ]
        }
      ])
      setLoading(false)
    }, 500)
  }, [])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (selectedConversation) {
      setMessages(selectedConversation.messages)
      // Mark as read
      setConversations(conversations.map(c =>
        c.id === selectedConversation.id ? { ...c, unreadCount: 0 } : c
      ))
    }
  }, [selectedConversation, conversations])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation)
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return

    const newMsg = {
      id: `msg${Date.now()}`,
      sender: 'admin',
      content: newMessage,
      timestamp: new Date().toISOString()
    }

    setMessages([...messages, newMsg])
    setNewMessage('')

    // Update conversation last message
    setConversations(conversations.map(c =>
      c.id === selectedConversation.id
        ? { ...c, lastMessage: newMessage, lastMessageAt: newMsg.timestamp }
        : c
    ))
  }

  const getStatusColor = (status) => {
    const colors = { open: 'processing', pending: 'warning', resolved: 'success', closed: 'default' }
    return colors[status] || 'default'
  }

  const getPriorityColor = (priority) => {
    const colors = { high: 'error', medium: 'warning', low: 'success' }
    return colors[priority] || 'default'
  }

  const filteredConversations = conversations.filter(conv => {
    if (filter !== 'all' && conv.status !== filter) return false
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      return conv.member.firstName.toLowerCase().includes(search) ||
        conv.member.lastName.toLowerCase().includes(search) ||
        conv.subject.toLowerCase().includes(search)
    }
    return true
  })

  const openCount = conversations.filter(c => c.status === 'open').length

  return (
    <div className="support-chat">
      <Row gutter={16} className="chat-container">
        {/* Conversation List */}
        <Col xs={24} md={8} className="conversation-list">
          <Card
            title={
              <Space>
                <span>Conversations</span>
                <Badge count={openCount} style={{ backgroundColor: '#1890ff' }} />
              </Space>
            }
            extra={
              <Select value={filter} onChange={setFilter} style={{ width: 120 }} size="small">
                <Option value="all">All</Option>
                <Option value="open">Open</Option>
                <Option value="pending">Pending</Option>
                <Option value="resolved">Resolved</Option>
              </Select>
            }
            className="list-card"
          >
            <Input
              placeholder="Search conversations..."
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ marginBottom: 16 }}
              size="small"
            />
            <List
              dataSource={filteredConversations}
              renderItem={(item) => (
                <List.Item
                  className={`conversation-item ${selectedConversation?.id === item.id ? 'selected' : ''}`}
                  onClick={() => handleSelectConversation(item)}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge count={item.unreadCount} size="small">
                        <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#003366' }} />
                      </Badge>
                    }
                    title={
                      <Space>
                        <span>{item.member.firstName} {item.member.lastName}</span>
                        <Tag color={getPriorityColor(item.priority)} style={{ fontSize: 10 }}>{item.priority}</Tag>
                      </Space>
                    }
                    description={
                      <>
                        <div style={{ fontWeight: 500, marginBottom: 4 }}>{item.subject}</div>
                        <div style={{ color: '#666', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.lastMessage}
                        </div>
                        <div style={{ color: '#999', fontSize: 11, marginTop: 4 }}>
                          {new Date(item.lastMessageAt).toLocaleString()}
                        </div>
                      </>
                    }
                  />
                </List.Item>
              )}
              locale={{ emptyText: <Empty description="No conversations" /> }}
            />
          </Card>
        </Col>

        {/* Chat Area */}
        <Col xs={24} md={16} className="chat-area">
          {selectedConversation ? (
            <Card className="chat-card" bodyStyle={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 0 }}>
              {/* Chat Header */}
              <div className="chat-header">
                <Space>
                  <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#003366' }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      {selectedConversation.member.firstName} {selectedConversation.member.lastName}
                    </div>
                    <div style={{ fontSize: 12, color: '#666' }}>
                      {selectedConversation.member.memberId} | {selectedConversation.subject}
                    </div>
                  </div>
                </Space>
                <Space>
                  <Tag color={getStatusColor(selectedConversation.status)}>{selectedConversation.status.toUpperCase()}</Tag>
                  <Tag color={getPriorityColor(selectedConversation.priority)}>{selectedConversation.priority.toUpperCase()}</Tag>
                  <Button size="small" icon={<MoreOutlined />} />
                </Space>
              </div>

              {/* Messages */}
              <div className="messages-container">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message ${msg.sender === 'admin' ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      {msg.sender === 'admin' && (
                        <div className="message-sender">
                          <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 4 }} />
                          You
                        </div>
                      )}
                      <div className="message-text">{msg.content}</div>
                      <div className="message-time">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="message-input">
                <Row gutter={8} align="middle">
                  <Col>
                    <Button icon={<PaperClipOutlined />} />
                  </Col>
                  <Col flex="auto">
                    <TextArea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      autoSize={{ minRows: 1, maxRows: 4 }}
                      onPressEnter={(e) => {
                        if (!e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                    />
                  </Col>
                  <Col>
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      Send
                    </Button>
                  </Col>
                </Row>
              </div>
            </Card>
          ) : (
            <Card className="empty-chat-card">
              <Empty
                description="Select a conversation to start chatting"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </Card>
          )}
        </Col>
      </Row>
    </div>
  )
}

export default SupportChat
