import React, { useState } from 'react'
import { MessageSquare, Send, User, Bot, Paperclip, Clock, CheckCircle, AlertCircle, Plus, X, Search } from 'lucide-react'
import MainLayout from '../components/Layout/MainLayout'

const Support = () => {
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const mockConversations = [
    { id: 'TKT001', member: 'John Adebayo', subject: 'Loan Disbursement Issue', status: 'open', priority: 'high', lastMessage: 'I still haven\'t received my loan funds', timestamp: '2024-03-15 10:30 AM', unread: 2, messages: [
      { id: 'M1', sender: 'member', text: 'Hi, I was approved for a loan 3 days ago but haven\'t received the funds.', timestamp: '2024-03-15 09:00 AM' },
      { id: 'M2', sender: 'support', text: 'Hello John, let me check your loan status. One moment please.', timestamp: '2024-03-15 09:05 AM' }
    ]},
    { id: 'TKT002', member: 'Sarah Okonkwo', subject: 'Contribution Receipt', status: 'pending', priority: 'medium', lastMessage: 'Thank you for your help!', timestamp: '2024-03-15 10:00 AM', unread: 0, messages: [
      { id: 'M1', sender: 'member', text: 'I made a contribution yesterday but haven\'t received a receipt.', timestamp: '2024-03-14 02:00 PM' }
    ]},
    { id: 'TKT003', member: 'Mike Ogunleye', subject: 'KYC Verification', status: 'open', priority: 'low', lastMessage: 'What documents do I need?', timestamp: '2024-03-15 09:45 AM', unread: 1, messages: [
      { id: 'M1', sender: 'member', text: 'My KYC verification has been pending for a week.', timestamp: '2024-03-15 09:30 AM' }
    ]}
  ]

  const mockBotResponses = [
    { trigger: 'loan', response: 'To apply for a loan, go to Loans > New Loan. Minimum 6 months membership required.' },
    { trigger: 'contribution', response: 'Monthly contributions can be made via bank transfer, card payment, or wallet balance.' },
    { trigger: 'kyc', response: 'KYC documents: Valid ID, Proof of Address, Employment Letter.' }
  ]

  const stats = { openTickets: 45, pendingTickets: 23, resolvedToday: 18, avgResponseTime: '2.5 hours' }

  const getStatusBadge = (status) => {
    const badges = {
      open: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700' },
      pending: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-700' },
      resolved: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700' }
    }
    const badge = badges[status] || badges.open
    return <span className={`px-2 py-1 ${badge.bg} ${badge.text} rounded text-xs font-medium`}>{status}</span>
  }

  const getPriorityBadge = (priority) => {
    const badges = { high: 'bg-red-100 text-red-700', medium: 'bg-yellow-100 text-yellow-700', low: 'bg-blue-100 text-blue-700' }
    const badge = badges[priority] || badges.medium
    return <span className={`px-2 py-1 ${badge} rounded text-xs font-medium`}>{priority}</span>
  }

  const filteredConversations = mockConversations.filter(conv => {
    if (filterStatus !== 'all' && conv.status !== filterStatus) return false
    if (searchTerm && !conv.member.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return
    setNewMessage('')
  }

  const handleBotResponse = (trigger) => {
    const botResponse = mockBotResponses.find(b => b.trigger === trigger)
    if (botResponse) setNewMessage(botResponse.response)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="section-title">Support & Helpdesk</h1>
            <p className="text-neutral-600 dark:text-neutral-400">Manage member support tickets and live chat</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
            <Plus size={18} />New Ticket
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card-hover">
            <div className="flex items-start justify-between">
              <div><p className="text-sm text-neutral-600 mb-1">Open Tickets</p><p className="text-2xl font-bold text-red-600">{stats.openTickets}</p></div>
              <div className="p-3 bg-red-100 rounded-lg"><AlertCircle className="text-red-600" size={24} /></div>
            </div>
          </div>
          <div className="card-hover">
            <div className="flex items-start justify-between">
              <div><p className="text-sm text-neutral-600 mb-1">Pending</p><p className="text-2xl font-bold text-yellow-600">{stats.pendingTickets}</p></div>
              <div className="p-3 bg-yellow-100 rounded-lg"><Clock className="text-yellow-600" size={24} /></div>
            </div>
          </div>
          <div className="card-hover">
            <div className="flex items-start justify-between">
              <div><p className="text-sm text-neutral-600 mb-1">Resolved Today</p><p className="text-2xl font-bold text-green-600">{stats.resolvedToday}</p></div>
              <div className="p-3 bg-green-100 rounded-lg"><CheckCircle className="text-green-600" size={24} /></div>
            </div>
          </div>
          <div className="card-hover">
            <div className="flex items-start justify-between">
              <div><p className="text-sm text-neutral-600 mb-1">Avg Response</p><p className="text-2xl font-bold text-blue-600">{stats.avgResponseTime}</p></div>
              <div className="p-3 bg-blue-100 rounded-lg"><Clock className="text-blue-600" size={24} /></div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-bold mb-4">Quick Response Bot</h3>
          <div className="flex flex-wrap gap-2">
            {['loan', 'contribution', 'kyc'].map((trigger) => (
              <button key={trigger} onClick={() => handleBotResponse(trigger)} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 capitalize">
                {trigger} Help
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border p-4">
            <div className="flex items-center gap-2 mb-4">
              <Search size={18} className="text-neutral-400" />
              <input type="text" placeholder="Search tickets..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg" />
            </div>
            <div className="space-y-2">
              {filteredConversations.map((conv) => (
                <div key={conv.id} onClick={() => setSelectedConversation(conv)} className={`p-4 rounded-lg cursor-pointer ${selectedConversation?.id === conv.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-neutral-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{conv.member}</span>
                    {conv.unread > 0 && <span className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">{conv.unread}</span>}
                  </div>
                  <p className="text-sm text-neutral-600 mb-2">{conv.subject}</p>
                  <div className="flex items-center justify-between">{getStatusBadge(conv.status)}{getPriorityBadge(conv.priority)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-neutral-800 rounded-xl shadow-sm border flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"><User size={20} className="text-blue-600" /></div>
                      <div><h3 className="font-semibold">{selectedConversation.member}</h3><p className="text-sm text-neutral-600">{selectedConversation.subject}</p></div>
                    </div>
                    <div className="flex items-center gap-2">{getStatusBadge(selectedConversation.status)}{getPriorityBadge(selectedConversation.priority)}</div>
                  </div>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {selectedConversation.messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'support' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-3 rounded-lg ${msg.sender === 'support' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-neutral-100 rounded-bl-none'}`}>
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-xs mt-1 ${msg.sender === 'support' ? 'text-blue-200' : 'text-neutral-500'}`}>{msg.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t">
                  <div className="flex items-center gap-3">
                    <button className="p-2 hover:bg-neutral-100 rounded-lg"><Paperclip size={20} className="text-neutral-500" /></button>
                    <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type your message..." className="flex-1 px-4 py-2 border rounded-lg" onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} />
                    <button onClick={handleSendMessage} className="p-2 bg-blue-600 text-white rounded-lg"><Send size={20} /></button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-neutral-500">
                <div className="text-center"><MessageSquare size={48} className="mx-auto mb-4 text-neutral-300" /><p>Select a conversation</p></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default Support
