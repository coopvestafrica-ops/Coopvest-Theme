import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Tabs, Table, Tag, Statistic, Progress, Timeline, Descriptions, Badge, Button, Space, Avatar, Alert } from 'antd'
import { UserOutlined, BankOutlined, DollarOutlined, AlertOutlined, CheckCircleOutlined, ClockCircleOutlined, FileTextOutlined } from '@ant-design/icons'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import '../styles/MemberProfile.css'

const { TabPane } = Tabs

const MemberProfile = () => {
  const [loading, setLoading] = useState(true)
  const [member, setMember] = useState(null)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setMember({
        _id: 'MEM001',
        memberId: 'CVD-2024-001234',
        firstName: 'Adeyemi',
        lastName: 'Olumide',
        email: 'adeyemi.olumide@example.com',
        phone: '+234 801 234 5678',
        status: 'active',
        kycStatus: 'approved',
        createdAt: '2023-06-15',
        riskTier: 'low',
        riskScore: 75,
        address: {
          street: '123 Lagos Street',
          city: 'Lagos',
          state: 'Lagos State'
        },
        wallet: {
          balance: 150000,
          availableBalance: 140000,
          lockedBalance: 10000
        },
        statistics: {
          totalContributions: 450000,
          totalLoans: 3,
          activeLoans: 1,
          totalLoanAmount: 350000,
          outstandingBalance: 175000,
          repaymentRate: 96.5
        },
        loans: [
          { _id: 'LN001', principalAmount: 100000, status: 'completed', disbursementDate: '2023-08-15', dueDate: '2024-02-15', totalRepaid: 100000 },
          { _id: 'LN002', principalAmount: 150000, status: 'repaying', disbursementDate: '2024-03-01', dueDate: '2024-09-01', totalRepaid: 75000 },
          { _id: 'LN003', principalAmount: 100000, status: 'pending', disbursementDate: null, dueDate: null, totalRepaid: 0 }
        ],
        contributions: [
          { _id: 'CNT001', amount: 25000, status: 'completed', contributionDate: '2024-01-01', type: 'monthly' },
          { _id: 'CNT002', amount: 25000, status: 'completed', contributionDate: '2023-12-01', type: 'monthly' },
          { _id: 'CNT003', amount: 25000, status: 'completed', contributionDate: '2023-11-01', type: 'monthly' }
        ],
        repayments: [
          { _id: 'REP001', amount: 25000, status: 'completed', date: '2024-01-20', daysLate: 0 },
          { _id: 'REP002', amount: 25000, status: 'completed', date: '2023-12-20', daysLate: 0 },
          { _id: 'REP003', amount: 25000, status: 'completed', date: '2023-11-20', daysLate: 2 }
        ],
        documents: [
          { _id: 'DOC001', type: 'loan_approval', name: 'Loan Approval Letter - LN002', createdAt: '2024-03-01' },
          { _id: 'DOC002', type: 'contribution_statement', name: 'Contribution Statement Q4 2023', createdAt: '2024-01-05' }
        ],
        riskFactors: [
          { type: 'repayment_history', severity: 'low', description: '2 late payments in last 12 months' },
          { type: 'contribution_pattern', severity: 'low', description: 'Consistent monthly contributions' },
          { type: 'kyc_status', severity: 'none', description: 'KYC fully verified' }
        ]
      })
      setLoading(false)
    }, 1000)
  }, [])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(value)
  }

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      pending: 'warning',
      suspended: 'error',
      completed: 'success',
      repaying: 'processing',
      defaulted: 'error'
    }
    return colors[status] || 'default'
  }

  const getRiskColor = (tier) => {
    const colors = { low: '#52c41a', medium: '#faad14', high: '#ff4d4f' }
    return colors[tier] || '#999'
  }

  const loanStatusData = [
    { name: 'Completed', value: 1, color: '#52c41a' },
    { name: 'Repaying', value: 1, color: '#1890ff' },
    { name: 'Pending', value: 1, color: '#faad14' }
  ]

  const repaymentTrend = [
    { month: 'Aug', amount: 100000 },
    { month: 'Sep', amount: 120000 },
    { month: 'Oct', amount: 150000 },
    { month: 'Nov', amount: 180000 },
    { month: 'Dec', amount: 200000 },
    { month: 'Jan', amount: 220000 }
  ]

  if (loading) {
    return <div className="loading">Loading member profile...</div>
  }

  return (
    <div className="member-profile">
      {/* Header */}
      <div className="profile-header">
        <Row align="middle" gutter={24}>
          <Col>
            <Avatar size={80} icon={<UserOutlined />} style={{ backgroundColor: '#003366' }} />
          </Col>
          <Col flex="auto">
            <h1>{member.firstName} {member.lastName}</h1>
            <p className="member-id">Member ID: {member.memberId}</p>
            <Space>
              <Tag color={getStatusColor(member.status)}>{member.status.toUpperCase()}</Tag>
              <Tag color={member.kycStatus === 'approved' ? 'success' : 'warning'}>{member.kycStatus.toUpperCase()}</Tag>
              <Tag color={getRiskColor(member.riskTier)}>RISK: {member.riskTier.toUpperCase()}</Tag>
            </Space>
          </Col>
          <Col>
            <Space direction="vertical">
              <Button type="primary">Edit Member</Button>
              <Button>Send Notification</Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Risk Alert */}
      {member.riskTier === 'high' && (
        <Alert
          message="High Risk Member"
          description="This member has been flagged as high risk. Additional verification required for new loans."
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* KPI Cards */}
      <Row gutter={[16, 16]} className="kpi-section">
        <Col xs={24} sm={12} lg={6}>
          <Card className="kpi-card">
            <Statistic
              title="Total Contributions"
              value={member.statistics.totalContributions}
              prefix={<DollarOutlined />}
              formatter={(value) => formatCurrency(value)}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="kpi-card">
            <Statistic
              title="Active Loans"
              value={member.statistics.activeLoans}
              prefix={<BankOutlined />}
              suffix={`/ ${member.statistics.totalLoans}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="kpi-card">
            <Statistic
              title="Outstanding Balance"
              value={member.statistics.outstandingBalance}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#1890ff' }}
              formatter={(value) => formatCurrency(value)}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="kpi-card">
            <Statistic
              title="Repayment Rate"
              value={member.statistics.repaymentRate}
              suffix="%"
              valueStyle={{ color: member.statistics.repaymentRate >= 90 ? '#52c41a' : '#faad14' }}
            />
            <Progress percent={member.statistics.repaymentRate} showInfo={false} strokeColor={member.statistics.repaymentRate >= 90 ? '#52c41a' : '#faad14'} />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Tabs defaultActiveKey="overview" className="profile-tabs">
        <TabPane tab="Overview" key="overview">
          <Row gutter={[16, 16]}>
            {/* Member Details */}
            <Col xs={24} lg={12}>
              <Card title="Member Details" className="detail-card">
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="Email">{member.email}</Descriptions.Item>
                  <Descriptions.Item label="Phone">{member.phone}</Descriptions.Item>
                  <Descriptions.Item label="Address">{member.address.street}, {member.address.city}, {member.address.state}</Descriptions.Item>
                  <Descriptions.Item label="Member Since">{new Date(member.createdAt).toLocaleDateString()}</Descriptions.Item>
                  <Descriptions.Item label="Risk Score">{member.riskScore}/100</Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            {/* Wallet */}
            <Col xs={24} lg={12}>
              <Card title="Wallet Summary" className="detail-card">
                <Row gutter={16}>
                  <Col span={8}>
                    <Statistic title="Balance" value={member.wallet.balance} formatter={(v) => formatCurrency(v)} />
                  </Col>
                  <Col span={8}>
                    <Statistic title="Available" value={member.wallet.availableBalance} valueStyle={{ color: '#52c41a' }} formatter={(v) => formatCurrency(v)} />
                  </Col>
                  <Col span={8}>
                    <Statistic title="Locked" value={member.wallet.lockedBalance} valueStyle={{ color: '#faad14' }} formatter={(v) => formatCurrency(v)} />
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* Loan Distribution */}
            <Col xs={24} lg={12}>
              <Card title="Loan Distribution" className="chart-card">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={loanStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {loanStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            {/* Risk Factors */}
            <Col xs={24} lg={12}>
              <Card title="Risk Assessment" className="risk-card">
                <Timeline>
                  {member.riskFactors.map((factor, index) => (
                    <Timeline.Item
                      key={index}
                      color={factor.severity === 'high' ? 'red' : factor.severity === 'medium' ? 'orange' : 'green'}
                      dot={factor.severity === 'high' ? <AlertOutlined /> : factor.severity === 'medium' ? <ClockCircleOutlined /> : <CheckCircleOutlined />}
                    >
                      <p className="risk-type">{factor.type.replace('_', ' ').toUpperCase()}</p>
                      <p className="risk-description">{factor.description}</p>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Loans" key="loans">
          <Card title="Loan History">
            <Table
              columns={[
                { title: 'Loan ID', dataIndex: '_id', key: '_id', render: (id) => <span style={{ fontFamily: 'monospace' }}>{id.toUpperCase()}</span> },
                { title: 'Amount', dataIndex: 'principalAmount', key: 'amount', render: (amount) => formatCurrency(amount) },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
                },
                { title: 'Disbursement', dataIndex: 'disbursementDate', key: 'disbursement', render: (date) => date ? new Date(date).toLocaleDateString() : '-' },
                { title: 'Due Date', dataIndex: 'dueDate', key: 'dueDate', render: (date) => date ? new Date(date).toLocaleDateString() : '-' },
                { title: 'Repaid', dataIndex: 'totalRepaid', key: 'repaid', render: (amount) => formatCurrency(amount) }
              ]}
              dataSource={member.loans}
              rowKey="_id"
              pagination={false}
            />
          </Card>
        </TabPane>

        <TabPane tab="Contributions" key="contributions">
          <Card title="Contribution History">
            <Table
              columns={[
                { title: 'Date', dataIndex: 'contributionDate', key: 'date', render: (date) => new Date(date).toLocaleDateString() },
                { title: 'Type', dataIndex: 'type', key: 'type', render: (type) => <Tag>{type.toUpperCase()}</Tag> },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => <Tag color="success">{status.toUpperCase()}</Tag>
                },
                { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (amount) => formatCurrency(amount) }
              ]}
              dataSource={member.contributions}
              rowKey="_id"
              pagination={false}
            />
          </Card>
        </TabPane>

        <TabPane tab="Repayments" key="repayments">
          <Row gutter={16}>
            <Col xs={24} lg={16}>
              <Card title="Repayment Timeline">
                <Table
                  columns={[
                    { title: 'Date', dataIndex: 'date', key: 'date', render: (date) => new Date(date).toLocaleDateString() },
                    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (amount) => formatCurrency(amount) },
                    {
                      title: 'Status',
                      dataIndex: 'status',
                      key: 'status',
                      render: (status) => <Tag color="success">{status.toUpperCase()}</Tag>
                    },
                    {
                      title: 'Days Late',
                      dataIndex: 'daysLate',
                      key: 'daysLate',
                      render: (days) => days > 0 ? <span style={{ color: '#ff4d4f' }}>{days} days</span> : 'On time'
                    }
                  ]}
                  dataSource={member.repayments}
                  rowKey="_id"
                  pagination={false}
                />
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Repayment Trend">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={repaymentTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => `₦${(v/1000)}k`} />
                    <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="amount" fill="#003366" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Documents" key="documents">
          <Card title="Member Documents">
            <Table
              columns={[
                {
                  title: 'Document',
                  key: 'name',
                  render: (_, record) => (
                    <Space>
                      <FileTextOutlined />
                      {record.name}
                    </Space>
                  )
                },
                { title: 'Type', dataIndex: 'type', key: 'type', render: (type) => <Tag>{type.replace('_', ' ').toUpperCase()}</Tag> },
                { title: 'Created', dataIndex: 'createdAt', key: 'createdAt', render: (date) => new Date(date).toLocaleDateString() },
                {
                  title: 'Actions',
                  key: 'actions',
                  render: () => (
                    <Space>
                      <Button size="small">View</Button>
                      <Button size="small">Download</Button>
                    </Space>
                  )
                }
              ]}
              dataSource={member.documents}
              rowKey="_id"
              pagination={false}
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  )
}

export default MemberProfile
