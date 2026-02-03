import React, { useState } from 'react'
import { MessageSquare, Send, User, Bot, Paperclip, Phone, Mail, Clock, CheckCircle, AlertCircle, Plus, X, Search, Filter } from 'lucide-react'
import MainLayout from '../components/Layout/MainLayout'

const Support = () => {
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data for demonstration
  const mockConversations = [
    { id: 'TKT001', member: 'John Adebayo', subject: 'Loan Disbursement Issue', status: 'open', priority: 'high', lastMessage: 'I still haven\'t received my loan funds', timestamp: '2024-03-15 10:30 AM', unread: 2, messages: [
      { id: 'M1', sender: 'member', text: 'Hi, I was approved for a loan 3 days ago but haven\'t received the funds.', timestamp: '2024-03-15 09:00 AM' },
      { id: 'M2', sender: 'support', text: 'Hello John, let me check your loan status. One moment please.', timestamp: '2024-03-15 09:05 AM' },
      { id: 'M3', sender: 'support', text: 'I can see the disbursement was initiated but there might be a delay with the bank. Let me follow up.', timestamp: '2024-03-15 09:15 AM' },
      { id: 'M4', sender: 'member', text: 'I still haven\'t received my loan funds', timestamp: '2024-03-15 10:30 AM' }
    ]},
    { id: 'TKT002', member: 'Sarah Okonkwo', subject: 'Contribution Receipt Not Received', status: 'pending', priority: 'medium', lastMessage: 'Thank you for your help!', timestamp: '2024-03-15 10:00 AM', unread: 0, messages: [
      { id: 'M1', sender: 'member', text: 'I made a contribution yesterday but haven\'t received a receipt.', timestamp: '2024-03-14 02:00 PM' },
      { id: 'M2', sender: 'support', text: 'Hi Sarah, I\'ve checked and your contribution was received. I\'m sending you a receipt now.', timestamp: '2024-03-14 02:30 PM' },
      { id: 'M3', sender: 'member', text: 'Thank you for your help!', timestamp: '2024-03-15 10:00 AM' }
    ]},
    { id: 'TKT003', member: 'Mike Ogunleye', subject: 'KYC Verification Problem', status: 'open', priority: 'low', lastMessage: 'What documents do I need to upload?', timestamp: '2024-03-15 09:45 AM', unread: 1, messages: [
      { id: 'M1', sender: 'member', text: 'My KYC verification has been pending for a week. Can you check?', timestamp: '2024-03-15 09:30 AM' },
      { id: 'M2', sender: 'support', text: 'Hi Mike, I see some of your documents are blurry. Please upload clearer copies.', timestamp: '2024-03-15 09:40 AM' },
      { id: 'M3', sender: 'member', text: 'What documents do I need to upload?', timestamp: '2024-03-15 09:45 AM' }
    ]},
    { id: 'TKT004', member: 'Grace Ibrahim', subject: 'Account Access Issue', status: 'resolved', priority: 'high', lastMessage: 'Issue has been resolved', timestamp: '2024-03-14 04:00 PM', unread: 0, messages: [
      { id: 'M1', sender: 'member', text: 'I can\'t log into my account. It says password is wrong.', timestamp: '2024-03-14 02:00 PM' },
      { id: 'M2', sender: 'support', text: 'I\'ve reset your password. Please check your email for the reset link.', timestamp: '2024-03-14 02:30 PM' },
      { id: 'M3', sender: 'member', text: 'I was able to log in. Thank you!', timestamp: '2024-03-14 04:00 PM' }
    ]}
  ]

  const mockBotResponses = [
    { trigger: 'loan', response: 'To apply for a loan, go to Loans > New Loan. You need at least 6 months of active membership and a minimum contribution ratio of 70%.' },
    { trigger: 'contribution', response: 'Monthly contributions can be made via bank transfer, card payment, or from your wallet balance. All contributions are recorded instantly.' },
    { trigger: 'kyc', response: 'KYC documents required: Valid ID (National ID, Driver\'s License, or Passport), Proof of Address, and Employment Letter.' },
    { trigger: 'password', response: 'To reset your password, click "Forgot Password" on the login page. You will receive a reset link via email.' },
    { trigger: 'balance', response: 'You can check your wallet balance on the Dashboard or Members page. Select a member and view their wallet details.' }
  ]

  const mockStats = {
    openTickets: 45,
    pendingTickets: 23,
    resolvedToday: 18,
    avgResponseTime: '2.5 hours'
  }

  const conversations = mockConversations
  const stats = mockStats

  const getStatusBadge = (status) => {
    const badges = {
      open: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700 dark:text-red-200' },
      pending: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-700 dark:text-yellow-200' },
      resolved: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700 dark:text-green-200' }
    }
    const badge = badges[status] || badges.open
    return (
      <span className={`px-2 py-1 ${badge.bg} ${badge.text} rounded text-xs font-medium`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getPriorityBadge = (priority) => {
    const badges = {
      high: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700' },
      medium: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-700' },
      low: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-700' }
    }
    const badge = badges[priority] || badges.medium
    return (
      <span className={`px-2 py-1 ${badge.bg} ${badge.text} rounded text-xs font-medium`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    )
  }

  const filteredConversations = conversations.filter(conv => {
    if (filterStatus !== 'all' && conv.status !== filterStatus) return false
    if (searchTerm && !conv.member.toLowerCase().includes(searchTerm.toLowerCase()) && !conv.subject.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return
    // Add message logic here
    setNewMessage('')
  }

  const handleBotResponse = (trigger) => {
    const botResponse = mockBotResponses.find(b => b.trigger === trigger)
    if (botResponse) {
      setNewMessage(botResponse.response)
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="section-title">Support & Helpdesk</h1>
            <p className="text-neutral-600 dark:text-neutral-400">Manage member support tickets and live chat</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Plus size={18} />
            New Ticket
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Open Tickets</p>
                <p className="text-2xl font-bold text-red-600">{stats.openTickets}</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <AlertCircle className="text-red-600 dark:text-red-400" size={24} />
              </div>
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingTickets}</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Clock className="text-yellow-600 dark:text-yellow-400" size={24} />
              </div>
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Resolved Today</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolvedToday}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Avg Response</p>
                <p className="text-2xl font-bold text-blue-600">{stats.avgResponseTime}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Clock className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions / Bot */}
        <div className="card">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 mb-4">Quick Response Bot</h3>
          <div className="flex flex-wrap gap-2">
            {['loan', 'contribution', 'kyc', 'password', 'balance'].map((trigger) => (
              <button
                key={trigger}
                onClick={() => handleBotResponse(trigger)}
                className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors capitalize"
              >
                {trigger} Help
              </button>
            ))}
          </div>
        </div>

        {/* Support Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversation List */}
          <div className="lg:col-span-1 bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Search size={18} className="text-neutral-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex gap-2 mb-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div className="space-y-2">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedConversation?.id === conv.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-700 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-neutral-900 dark:text-neutral-50">{conv.member}</span>
                    {conv.unread > 0 && (
                      <span className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">{conv.subject}</p>
                  <div className="flex items-center justify-between">
                    {getStatusBadge(conv.status)}
                    {getPriorityBadge(conv.priority)}
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">{conv.timestamp}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2 bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <User size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900 dark:text-neutral-50">{selectedConversation.member}</h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">{selectedConversation.subject}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(selectedConversation.status)}
                      {getPriorityBadge(selectedConversation.priority)}
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {selectedConversation.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'support' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          msg.sender === 'support'
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-xs mt-1 ${msg.sender === 'support' ? 'text-blue-200' : 'text-neutral-500'}`}>
                          {msg.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
                  <div className="flex items-center gap-3">
                    <button className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors">
                      <Paperclip size={20} className="text-neutral-500" />
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500 outline-none"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button
                      onClick={handleSendMessage}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setNewMessage('Your issue has been resolved. Is there anything else I can help with?')}
                      className="text-xs px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-full hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                    >
                      Mark Resolved
                    </button>
                    <button
                      onClick={() => setNewMessage('Let me escalate this to our specialized team. They will contact you within 2 hours.')}
                      className="text-xs px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
                    >
                      Escalate
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-neutral-500">
                <div className="text-center">
                  <MessageSquare size={48} className="mx-auto mb-4 text-neutral-300" />
                  <p>Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default Support
