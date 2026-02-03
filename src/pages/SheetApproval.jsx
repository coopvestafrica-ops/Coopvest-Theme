import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Table, Tag, Button, Space, Modal, Form, Input, Select, Tabs, Timeline, Badge, Descriptions, Divider, Statistic, Alert, InputNumber } from 'antd'
import { CheckOutlined, CloseOutlined, EyeOutlined, FileOutlined, UserOutlined, ClockCircleOutlined, HistoryOutlined } from '@ant-design/icons'
import '../styles/SheetApproval.css'

const { Option } = Select
const { TextArea } = Input

const SheetApproval = () => {
  const [loading, setLoading] = useState(true)
  const [approvals, setApprovals] = useState([])
  const [selectedApproval, setSelectedApproval] = useState(null)
  const [detailVisible, setDetailVisible] = useState(false)
  const [actionModalVisible, setActionModalVisible] = useState(false)
  const [actionType, setActionType] = useState('')
  const [form] = Form.useForm()

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setApprovals([
        {
          _id: 'SA001',
          sheetName: 'New Member Applications',
          sheetId: 'SHT-2024-001',
          submittedBy: 'Admin James',
          submittedAt: '2024-01-15T10:30:00',
          rowsCount: 15,
          status: 'pending',
          changes: [
            { row: 1, action: 'add', data: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' } },
            { row: 2, action: 'add', data: { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' } }
          ],
          comment: '15 new member applications for January batch'
        },
        {
          _id: 'SA002',
          sheetName: 'Loan Rate Update',
          sheetId: 'SHT-2024-002',
          submittedBy: 'Finance Team',
          submittedAt: '2024-01-14T14:20:00',
          rowsCount: 5,
          status: 'pending',
          changes: [
            { row: 1, action: 'modify', data: { loanType: 'Personal', oldRate: 10, newRate: 9.5 } },
            { row: 2, action: 'modify', data: { loanType: 'Business', oldRate: 12, newRate: 11 } }
          ],
          comment: 'Quarterly interest rate adjustment'
        },
        {
          _id: 'SA003',
          sheetName: 'Contribution Schedule',
          sheetId: 'SHT-2024-003',
          submittedBy: 'Operations',
          submittedAt: '2024-01-13T09:15:00',
          rowsCount: 25,
          status: 'approved',
          approvedBy: 'Super Admin',
          approvedAt: '2024-01-14T11:00:00',
          changes: [],
          comment: 'February contribution schedule'
        },
        {
          _id: 'SA004',
          sheetName: 'Member Status Update',
          sheetId: 'SHT-2024-004',
          submittedBy: 'HR Team',
          submittedAt: '2024-01-12T16:45:00',
          rowsCount: 8,
          status: 'rejected',
          rejectedBy: 'Compliance Officer',
          rejectedAt: '2024-01-13T10:30:00',
          reason: 'Incomplete documentation for suspended members',
          changes: [],
          comment: 'Monthly status review updates'
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusColor = (status) => {
    const colors = { pending: 'gold', approved: 'success', rejected: 'error' }
    return colors[status] || 'default'
  }

  const handleViewDetails = (approval) => {
    setSelectedApproval(approval)
    setDetailVisible(true)
  }

  const handleAction = (type) => {
    setActionType(type)
    setActionModalVisible(true)
  }

  const submitAction = (values) => {
    console.log(`${actionType} approval:`, selectedApproval._id, values)
    setActionModalVisible(false)
    form.resetFields()
  }

  const columns = [
    {
      title: 'Sheet ID',
      dataIndex: 'sheetId',
      key: 'sheetId',
      render: (id) => <span style={{ fontFamily: 'monospace' }}>{id}</span>
    },
    {
      title: 'Sheet Name',
      dataIndex: 'sheetName',
      key: 'sheetName'
    },
    {
      title: 'Submitted By',
      dataIndex: 'submittedBy',
      key: 'submittedBy',
      render: (name) => <Space><UserOutlined />{name}</Space>
    },
    {
      title: 'Rows',
      dataIndex: 'rowsCount',
      key: 'rowsCount',
      render: (count) => <Badge count={count} style={{ backgroundColor: '#1890ff' }} />
    },
    {
      title: 'Submitted',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (date) => new Date(date).toLocaleString()
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => handleViewDetails(record)}>View</Button>
          {record.status === 'pending' && (
            <>
              <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => { setSelectedApproval(record); handleAction('approve'); }}>Approve</Button>
              <Button size="small" danger icon={<CloseOutlined />} onClick={() => { setSelectedApproval(record); handleAction('reject'); }}>Reject</Button>
            </>
          )}
        </Space>
      )
    }
  ]

  const pendingCount = approvals.filter(a => a.status === 'pending').length

  return (
    <div className="sheet-approval">
      {/* Summary */}
      <Row gutter={[16, 16]} className="summary-section">
        <Col xs={24} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="Pending Approvals"
              value={pendingCount}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="Approved Today"
              value={3}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="Rejected Today"
              value={1}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<CloseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="Total Sheets"
              value={approvals.length}
              prefix={<FileOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Table */}
      <Card title="Sheet Approval Queue" className="table-card">
        <Table
          columns={columns}
          dataSource={approvals}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={`Sheet Details - ${selectedApproval?.sheetId}`}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        width={700}
        footer={selectedApproval?.status === 'pending' ? [
          <Button key="reject" danger onClick={() => { setDetailVisible(false); handleAction('reject'); }}>Reject</Button>,
          <Button key="approve" type="primary" onClick={() => { setDetailVisible(false); handleAction('approve'); }}>Approve</Button>
        ] : [
          <Button key="close" onClick={() => setDetailVisible(false)}>Close</Button>
        ]}
      >
        {selectedApproval && (
          <>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Sheet Name">{selectedApproval.sheetName}</Descriptions.Item>
              <Descriptions.Item label="Sheet ID">{selectedApproval.sheetId}</Descriptions.Item>
              <Descriptions.Item label="Submitted By">{selectedApproval.submittedBy}</Descriptions.Item>
              <Descriptions.Item label="Submitted At">{new Date(selectedApproval.submittedAt).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Rows">{selectedApproval.rowsCount}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedApproval.status)}>{selectedApproval.status.toUpperCase()}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Comment" span={2}>{selectedApproval.comment}</Descriptions.Item>
            </Descriptions>

            {selectedApproval.status !== 'pending' && (
              <>
                <Divider />
                <Descriptions title="Approval History" bordered column={1} size="small">
                  {selectedApproval.approvedBy && (
                    <>
                      <Descriptions.Item label="Approved By">{selectedApproval.approvedBy}</Descriptions.Item>
                      <Descriptions.Item label="Approved At">{new Date(selectedApproval.approvedAt).toLocaleString()}</Descriptions.Item>
                    </>
                  )}
                  {selectedApproval.rejectedBy && (
                    <>
                      <Descriptions.Item label="Rejected By">{selectedApproval.rejectedBy}</Descriptions.Item>
                      <Descriptions.Item label="Rejected At">{new Date(selectedApproval.rejectedAt).toLocaleString()}</Descriptions.Item>
                      <Descriptions.Item label="Rejection Reason">{selectedApproval.reason}</Descriptions.Item>
                    </>
                  )}
                </Descriptions>
              </>
            )}

            {selectedApproval.changes.length > 0 && (
              <>
                <Divider />
                <Card title="Proposed Changes" size="small">
                  <Timeline>
                    {selectedApproval.changes.map((change, index) => (
                      <Timeline.Item
                        key={index}
                        color={change.action === 'add' ? 'green' : change.action === 'modify' ? 'blue' : 'red'}
                      >
                        <p><Tag>{change.action.toUpperCase()}</Tag> Row {change.row}</p>
                        <pre style={{ fontSize: 12, background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
                          {JSON.stringify(change.data, null, 2)}
                        </pre>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Card>
              </>
            )}
          </>
        )}
      </Modal>

      {/* Action Modal */}
      <Modal
        title={actionType === 'approve' ? 'Approve Sheet' : 'Reject Sheet'}
        open={actionModalVisible}
        onCancel={() => setActionModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={submitAction}>
          {actionType === 'approve' ? (
            <>
              <Form.Item name="notes" label="Approval Notes">
                <TextArea rows={3} placeholder="Optional notes..." />
              </Form.Item>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">Confirm Approval</Button>
                  <Button onClick={() => setActionModalVisible(false)}>Cancel</Button>
                </Space>
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item name="reason" label="Rejection Reason" rules={[{ required: true }]}>
                <Select placeholder="Select reason">
                  <Option value="incomplete_data">Incomplete Data</Option>
                  <Option value="invalid_format">Invalid Format</Option>
                  <Option value="policy_violation">Policy Violation</Option>
                  <Option value="duplicate_entries">Duplicate Entries</Option>
                  <Option value="other">Other</Option>
                </Select>
              </Form.Item>
              <Form.Item name="details" label="Additional Details">
                <TextArea rows={3} placeholder="Provide more details..." />
              </Form.Item>
              <Form.Item>
                <Space>
                  <Button type="primary" danger htmlType="submit">Confirm Rejection</Button>
                  <Button onClick={() => setActionModalVisible(false)}>Cancel</Button>
                </Space>
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  )
}

export default SheetApproval
