import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Table, Tag, Button, Space, Modal, Form, Input, Select, InputNumber, Slider, Progress, Divider, Descriptions, Statistic, Alert, Drawer, Timeline, Badge } from 'antd'
import { CheckOutlined, CloseOutlined, EyeOutlined, FileTextOutlined, DollarOutlined, UserOutlined, BankOutlined, AlertOutlined } from '@ant-design/icons'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import '../styles/LoanReview.css'

const { Option } = Select
const { TextArea } = Input

const LoanReview = () => {
  const [loading, setLoading] = useState(true)
  const [loans, setLoans] = useState([])
  const [selectedLoan, setSelectedLoan] = useState(null)
  const [detailVisible, setDetailVisible] = useState(false)
  const [approvalModalVisible, setApprovalModalVisible] = useState(false)
  const [rejectionModalVisible, setRejectionModalVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLoans([
        {
          _id: 'LN001',
          memberId: { _id: 'MEM001', firstName: 'Adeyemi', lastName: 'Olumide', memberId: 'CVD-2024-001', riskTier: 'low', riskScore: 85 },
          principalAmount: 150000,
          interestRate: 8,
          termMonths: 6,
          purpose: 'Business Expansion',
          status: 'pending',
          repaymentSchedule: { installmentAmount: 27666 },
          createdAt: '2024-01-15',
          documents: ['ID Verification', 'Business Plan'],
          creditScore: 720,
          existingLoans: 1,
          totalExistingDebt: 50000
        },
        {
          _id: 'LN002',
          memberId: { _id: 'MEM002', firstName: 'Chioma', lastName: 'Nwachukwu', memberId: 'CVD-2024-002', riskTier: 'medium', riskScore: 65 },
          principalAmount: 250000,
          interestRate: 10,
          termMonths: 12,
          purpose: 'Home Improvement',
          status: 'pending',
          repaymentSchedule: { installmentAmount: 22916 },
          createdAt: '2024-01-14',
          documents: ['ID Verification', 'Income Proof'],
          creditScore: 650,
          existingLoans: 2,
          totalExistingDebt: 120000
        },
        {
          _id: 'LN003',
          memberId: { _id: 'MEM003', firstName: 'Emeka', lastName: 'Okonkwo', memberId: 'CVD-2024-003', riskTier: 'high', riskScore: 35 },
          principalAmount: 100000,
          interestRate: 12,
          termMonths: 4,
          purpose: 'Personal',
          status: 'pending',
          repaymentSchedule: { installmentAmount: 27333 },
          createdAt: '2024-01-13',
          documents: ['ID Verification'],
          creditScore: 520,
          existingLoans: 3,
          totalExistingDebt: 200000
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(value)
  }

  const getRiskColor = (tier) => {
    const colors = { low: 'success', medium: 'warning', high: 'error' }
    return colors[tier] || 'default'
  }

  const handleViewDetails = (loan) => {
    setSelectedLoan(loan)
    setDetailVisible(true)
  }

  const handleApprove = () => {
    setApprovalModalVisible(true)
  }

  const handleReject = () => {
    setRejectionModalVisible(true)
  }

  const submitApproval = (values) => {
    console.log('Approve loan:', selectedLoan._id, values)
    setApprovalModalVisible(false)
    // API call would go here
  }

  const submitRejection = (values) => {
    console.log('Reject loan:', selectedLoan._id, values)
    setRejectionModalVisible(false)
    // API call would go here
  }

  const columns = [
    {
      title: 'Loan ID',
      dataIndex: '_id',
      key: '_id',
      render: (id) => <span style={{ fontFamily: 'monospace' }}>{id.toUpperCase()}</span>
    },
    {
      title: 'Member',
      key: 'member',
      render: (_, record) => (
        <Space>
          <UserOutlined />
          {record.memberId.firstName} {record.memberId.lastName}
          <Tag color={getRiskColor(record.memberId.riskTier)}>{record.memberId.riskTier}</Tag>
        </Space>
      )
    },
    {
      title: 'Amount',
      dataIndex: 'principalAmount',
      key: 'amount',
      render: (amount) => formatCurrency(amount),
      sorter: (a, b) => a.principalAmount - b.principalAmount
    },
    {
      title: 'Term',
      dataIndex: 'termMonths',
      key: 'term',
      render: (months) => `${months} months`
    },
    {
      title: 'Purpose',
      dataIndex: 'purpose',
      key: 'purpose'
    },
    {
      title: 'Credit Score',
      dataIndex: 'memberId.creditScore',
      key: 'creditScore',
      render: (score) => (
        <Tag color={score >= 700 ? 'success' : score >= 600 ? 'warning' : 'error'}>
          {score}
        </Tag>
      )
    },
    {
      title: 'Submitted',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => handleViewDetails(record)}>View</Button>
          <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => { setSelectedLoan(record); handleApprove(); }}>Approve</Button>
          <Button size="small" danger icon={<CloseOutlined />} onClick={() => { setSelectedLoan(record); handleReject(); }}>Reject</Button>
        </Space>
      )
    }
  ]

  // Summary stats
  const pendingCount = loans.filter(l => l.status === 'pending').length
  const totalPendingAmount = loans.filter(l => l.status === 'pending').reduce((sum, l) => sum + l.principalAmount, 0)
  const avgRiskScore = loans.length > 0 ? Math.round(loans.reduce((sum, l) => sum + l.memberId.riskScore, 0) / loans.length) : 0

  return (
    <div className="loan-review">
      {/* Summary Cards */}
      <Row gutter={[16, 16]} className="summary-section">
        <Col xs={24} sm={8}>
          <Card className="summary-card">
            <Statistic
              title="Pending Applications"
              value={pendingCount}
              prefix={<BankOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="summary-card">
            <Statistic
              title="Total Pending Amount"
              value={totalPendingAmount}
              prefix={<DollarOutlined />}
              formatter={(value) => formatCurrency(value)}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="summary-card">
            <Statistic
              title="Average Risk Score"
              value={avgRiskScore}
              suffix="/100"
              valueStyle={{ color: avgRiskScore >= 70 ? '#52c41a' : avgRiskScore >= 50 ? '#faad14' : '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Table */}
      <Card title="Loan Applications Awaiting Review" className="table-card">
        <Table
          columns={columns}
          dataSource={loans}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          rowClassName={(record) => record.memberId.riskTier === 'high' ? 'high-risk-row' : ''}
        />
      </Card>

      {/* Detail Drawer */}
      <Drawer
        title={`Loan Application - ${selectedLoan?._id?.toUpperCase()}`}
        placement="right"
        width={600}
        onClose={() => setDetailVisible(false)}
        open={detailVisible}
        extra={
          <Space>
            <Button onClick={() => { setDetailVisible(false); handleReject(); }}>Reject</Button>
            <Button type="primary" onClick={() => { setDetailVisible(false); handleApprove(); }}>Approve</Button>
          </Space>
        }
      >
        {selectedLoan && (
          <>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic title="Amount" value={selectedLoan.principalAmount} formatter={(v) => formatCurrency(v)} />
              </Col>
              <Col span={12}>
                <Statistic title="Monthly Installment" value={selectedLoan.repaymentSchedule?.installmentAmount} formatter={(v) => formatCurrency(v)} />
              </Col>
            </Row>
            <Divider />
            
            <Descriptions title="Loan Details" bordered column={1} size="small">
              <Descriptions.Item label="Purpose">{selectedLoan.purpose}</Descriptions.Item>
              <Descriptions.Item label="Term">{selectedLoan.termMonths} months</Descriptions.Item>
              <Descriptions.Item label="Interest Rate">{selectedLoan.interestRate}%</Descriptions.Item>
              <Descriptions.Item label="Submitted">{new Date(selectedLoan.createdAt).toLocaleDateString()}</Descriptions.Item>
            </Descriptions>
            
            <Divider />
            
            <Descriptions title="Member Information" bordered column={1} size="small">
              <Descriptions.Item label="Name">{selectedLoan.memberId.firstName} {selectedLoan.memberId.lastName}</Descriptions.Item>
              <Descriptions.Item label="Member ID">{selectedLoan.memberId.memberId}</Descriptions.Item>
              <Descriptions.Item label="Risk Tier">
                <Tag color={getRiskColor(selectedLoan.memberId.riskTier)}>{selectedLoan.memberId.riskTier.toUpperCase()}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Credit Score">{selectedLoan.memberId.creditScore}</Descriptions.Item>
              <Descriptions.Item label="Existing Loans">{selectedLoan.existingLoans}</Descriptions.Item>
              <Descriptions.Item label="Existing Debt">{formatCurrency(selectedLoan.totalExistingDebt)}</Descriptions.Item>
            </Descriptions>
            
            <Divider />
            
            <Card title="Risk Assessment" size="small">
              <Row gutter={16}>
                <Col span={8}>
                  <Progress type="circle" percent={selectedLoan.memberId.riskScore} size={80} strokeColor={selectedLoan.memberId.riskScore >= 70 ? '#52c41a' : selectedLoan.memberId.riskScore >= 50 ? '#faad14' : '#ff4d4f'} />
                </Col>
                <Col span={16}>
                  <Timeline>
                    <Timeline.Item color={selectedLoan.memberId.riskScore >= 70 ? 'green' : 'orange'}>
                      <p>Credit Score: {selectedLoan.memberId.creditScore}</p>
                    </Timeline.Item>
                    <Timeline.Item color={selectedLoan.totalExistingDebt < 100000 ? 'green' : 'orange'}>
                      <p>Debt Level: {formatCurrency(selectedLoan.totalExistingDebt)}</p>
                    </Timeline.Item>
                    <Timeline.Item color={selectedLoan.existingLoans <= 2 ? 'green' : 'red'}>
                      <p>Active Loans: {selectedLoan.existingLoans}</p>
                    </Timeline.Item>
                  </Timeline>
                </Col>
              </Row>
            </Card>
          </>
        )}
      </Drawer>

      {/* Approval Modal */}
      <Modal
        title="Approve Loan Application"
        open={approvalModalVisible}
        onCancel={() => setApprovalModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={submitApproval}>
          <Form.Item name="interestRate" label="Interest Rate (%)" initialValue={selectedLoan?.interestRate}>
            <InputNumber min={1} max={30} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="termMonths" label="Term (Months)" initialValue={selectedLoan?.termMonths}>
            <Select>
              <Option value={3}>3 Months</Option>
              <Option value={6}>6 Months</Option>
              <Option value={12}>12 Months</Option>
              <Option value={18}>18 Months</Option>
              <Option value={24}>24 Months</Option>
            </Select>
          </Form.Item>
          <Form.Item name="notes" label="Approval Notes">
            <TextArea rows={3} placeholder="Optional notes for the approval..." />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">Confirm Approval</Button>
              <Button onClick={() => setApprovalModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Rejection Modal */}
      <Modal
        title="Reject Loan Application"
        open={rejectionModalVisible}
        onCancel={() => setRejectionModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={submitRejection}>
          <Form.Item name="reason" label="Rejection Reason" rules={[{ required: true }]}>
            <Select placeholder="Select reason for rejection">
              <Option value="insufficient_credit">Insufficient Credit History</Option>
              <Option value="high_debt_ratio">High Debt-to-Income Ratio</Option>
              <Option value="incomplete_docs">Incomplete Documentation</Option>
              <Option value="ineligible_purpose">Ineligible Loan Purpose</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>
          <Form.Item name="details" label="Additional Details">
            <TextArea rows={3} placeholder="Provide additional details..." />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" danger htmlType="submit">Confirm Rejection</Button>
              <Button onClick={() => setRejectionModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default LoanReview
