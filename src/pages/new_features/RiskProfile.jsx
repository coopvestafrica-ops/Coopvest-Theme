import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Progress, Tag, Statistic, Table, Button, Select, Descriptions, Tabs, Alert, Tooltip } from 'antd'
import { SafetyOutlined, WarningOutlined, CheckCircleOutlined, ExclamationCircleOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import '../../styles/RiskProfile.css'

const RiskProfile = () => {
  const [loading, setLoading] = useState(true)
  const [memberRiskData, setMemberRiskData] = useState(null)
  const [highRiskMembers, setHighRiskMembers] = useState([])
  const [selectedMember, setSelectedMember] = useState(null)
  const [stats, setStats] = useState({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const mockMemberData = {
        _id: '123',
        member: {
          firstName: 'Adebayo',
          lastName: 'Okafor',
          email: 'adebayo@example.com',
          phone: '+2348012345678',
          memberId: 'MEM-2024-001',
          status: 'active'
        },
        score: 65,
        tier: 'medium',
        components: {
          repaymentBehavior: {
            score: 72,
            weight: 0.30,
            details: {
              onTimePayments: 18,
              latePayments: 3,
              missedPayments: 1,
              averageDaysLate: 5,
              repaymentRate: 85
            }
          },
          contributionConsistency: {
            score: 85,
            weight: 0.25,
            details: {
              monthsActive: 24,
              totalContributions: 480000,
              averageMonthlyContribution: 20000,
              contributionFrequency: 'regular',
              lastContributionDate: '2024-01-15'
            }
          },
          loanHistory: {
            score: 55,
            weight: 0.20,
            details: {
              totalLoans: 5,
              completedLoans: 3,
              defaultedLoans: 1,
              currentOutstanding: 350000,
              loanUtilizationRate: 180
            }
          },
          fraudFlags: {
            score: 100,
            weight: 0.15,
            details: {
              fraudCases: 0,
              referralAbuse: 0,
              suspiciousActivity: 0,
              complianceIssues: 0
            }
          },
          accountStanding: {
            score: 90,
            weight: 0.10,
            details: {
              kycStatus: 'approved',
              accountAge: 24,
              status: 'active',
              suspensionCount: 0
            }
          }
        },
        riskIndicators: [
          { type: 'high_debt_ratio', severity: 'medium', description: 'Loan utilization rate of 180% is elevated' },
          { type: 'missed_payment', severity: 'low', description: '1 missed payment in last 6 months' }
        ],
        recommendations: [
          { action: 'Consider debt consolidation discussion', reason: 'High loan utilization', priority: 'medium' },
          { action: 'Schedule payment plan review', reason: 'Recent payment irregularities', priority: 'low' }
        ],
        calculatedAt: '2024-01-15T10:00:00Z'
      }

      const mockHighRisk = [
        { _id: '1', memberId: { firstName: 'John', lastName: 'Doe', email: 'john@example.com', memberId: 'MEM-001' }, score: 25, tier: 'high', riskIndicators: [{ type: 'fraud_suspicion', severity: 'high' }] },
        { _id: '2', memberId: { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', memberId: 'MEM-002' }, score: 32, tier: 'high', riskIndicators: [{ type: 'missed_payment', severity: 'high' }] },
        { _id: '3', memberId: { firstName: 'Bob', lastName: 'Wilson', email: 'bob@example.com', memberId: 'MEM-003' }, score: 38, tier: 'high', riskIndicators: [{ type: 'late_payment', severity: 'medium' }] }
      ]

      const mockStats = {
        totalMembers: 1000,
        lowRisk: 650,
        mediumRisk: 280,
        highRisk: 70,
        averageScore: 72
      }

      setMemberRiskData(mockMemberData)
      setHighRiskMembers(mockHighRisk)
      setStats(mockStats)
    } catch (error) {
      console.error('Failed to fetch risk data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 70) return '#52c41a'
    if (score >= 40) return '#faad14'
    return '#ff4d4f'
  }

  const getTierColor = (tier) => {
    const colors = { low: 'success', medium: 'warning', high: 'error' }
    return colors[tier]
  }

  const getRiskIndicatorIcon = (severity) => {
    if (severity === 'high') return <WarningOutlined style={{ color: '#ff4d4f' }} />
    if (severity === 'medium') return <ExclamationCircleOutlined style={{ color: '#faad14' }} />
    return <CheckCircleOutlined style={{ color: '#52c41a' }} />
  }

  const componentColumns = [
    { title: 'Component', dataIndex: 'name', key: 'name' },
    { title: 'Score', dataIndex: 'score', key: 'score', render: (score) => <Progress percent={score} size="small" strokeColor={getScoreColor(score)} /> },
    { title: 'Weight', dataIndex: 'weight', key: 'weight', render: (w) => `${(w * 100).toFixed(0)}%` },
    { title: 'Status', key: 'status', render: (_, record) => record.score >= 70 ? 'Good' : record.score >= 40 ? 'Fair' : 'Poor' }
  ]

  const highRiskColumns = [
    { title: 'Member', key: 'member', render: (_, record) => `${record.memberId.firstName} ${record.memberId.lastName}` },
    { title: 'Member ID', dataIndex: ['memberId', 'memberId'], key: 'memberId' },
    { title: 'Risk Score', dataIndex: 'score', key: 'score', render: (s) => <Progress percent={s} size="small" strokeColor="#ff4d4f" /> },
    { 
      title: 'Indicators', 
      dataIndex: 'riskIndicators', 
      key: 'indicators',
      render: (indicators) => indicators.map(i => (
        <Tag key={i.type} color={i.severity === 'high' ? 'red' : i.severity === 'medium' ? 'orange' : 'green'}>
          {i.type.replace('_', ' ')}
        </Tag>
      ))
    },
    { title: 'Action', key: 'action', render: () => <Button size="small">View Details</Button> }
  ]

  return (
    <div className="risk-profile">
      <div className="page-header">
        <h1><SafetyOutlined /> Risk Management</h1>
        <Space>
          <Button onClick={fetchData}>Refresh</Button>
          <Button type="primary">Recalculate All Scores</Button>
        </Space>
      </div>

      {/* Risk Statistics Overview */}
      <Row gutter={[16, 16]} className="stats-section">
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Average Risk Score"
              value={stats.averageScore}
              suffix="/ 100"
              valueStyle={{ color: getScoreColor(stats.averageScore) }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} lg={6}>
          <Card className="stat-card tier-low">
            <Statistic title="Low Risk" value={stats.lowRisk} suffix={`(${((stats.lowRisk/stats.totalMembers)*100).toFixed(0)}%)`} />
            <Progress percent={(stats.lowRisk/stats.totalMembers)*100} showInfo={false} strokeColor="#52c41a" />
          </Card>
        </Col>
        <Col xs={24} sm={8} lg={6}>
          <Card className="stat-card tier-medium">
            <Statistic title="Medium Risk" value={stats.mediumRisk} suffix={`(${((stats.mediumRisk/stats.totalMembers)*100).toFixed(0)}%)`} />
            <Progress percent={(stats.mediumRisk/stats.totalMembers)*100} showInfo={false} strokeColor="#faad14" />
          </Card>
        </Col>
        <Col xs={24} sm={8} lg={6}>
          <Card className="stat-card tier-high">
            <Statistic title="High Risk" value={stats.highRisk} suffix={`(${((stats.highRisk/stats.totalMembers)*100).toFixed(0)}%)`} />
            <Progress percent={(stats.highRisk/stats.totalMembers)*100} showInfo={false} strokeColor="#ff4d4f" />
          </Card>
        </Col>
      </Row>

      <Tabs
        items={[
          {
            key: 'overview',
            label: 'Member Risk Overview',
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Card title="Risk Score Distribution" className="distribution-card">
                    <div className="score-display">
                      <Progress
                        type="dashboard"
                        percent={memberRiskData?.score || 0}
                        strokeColor={getScoreColor(memberRiskData?.score)}
                        format={(percent) => (
                          <div className="score-format">
                            <span className="score-value">{percent}</span>
                            <span className="score-tier">
                              <Tag color={getTierColor(memberRiskData?.tier)}>
                                {memberRiskData?.tier?.toUpperCase()} RISK
                              </Tag>
                            </span>
                          </div>
                        )}
                      />
                    </div>
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card title="Score Components">
                    <Table
                      columns={componentColumns}
                      dataSource={memberRiskData ? [
                        { key: '1', name: 'Repayment Behavior', score: memberRiskData.components.repaymentBehavior.score, weight: memberRiskData.components.repaymentBehavior.weight },
                        { key: '2', name: 'Contribution Consistency', score: memberRiskData.components.contributionConsistency.score, weight: memberRiskData.components.contributionConsistency.weight },
                        { key: '3', name: 'Loan History', score: memberRiskData.components.loanHistory.score, weight: memberRiskData.components.loanHistory.weight },
                        { key: '4', name: 'Fraud Flags', score: memberRiskData.components.fraudFlags.score, weight: memberRiskData.components.fraudFlags.weight },
                        { key: '5', name: 'Account Standing', score: memberRiskData.components.accountStanding.score, weight: memberRiskData.components.accountStanding.weight }
                      ] : []}
                      pagination={false}
                      size="small"
                    />
                  </Card>
                </Col>
                <Col xs={24}>
                  <Card title="Risk Indicators">
                    <div className="risk-indicators">
                      {memberRiskData?.riskIndicators?.map((indicator, index) => (
                        <Alert
                          key={index}
                          message={indicator.type.replace('_', ' ').toUpperCase()}
                          description={indicator.description}
                          type={indicator.severity === 'high' ? 'error' : indicator.severity === 'medium' ? 'warning' : 'info'}
                          showIcon
                          icon={getRiskIndicatorIcon(indicator.severity)}
                          className={`risk-indicator indicator-${indicator.severity}`}
                        />
                      ))}
                    </div>
                  </Card>
                </Col>
                <Col xs={24}>
                  <Card title="Recommendations">
                    <div className="recommendations">
                      {memberRiskData?.recommendations?.map((rec, index) => (
                        <div key={index} className="recommendation-item">
                          <Tag color={rec.priority === 'high' ? 'red' : rec.priority === 'medium' ? 'orange' : 'green'}>
                            {rec.priority.toUpperCase()} PRIORITY
                          </Tag>
                          <Text strong>{rec.action}</Text>
                          <Text type="secondary">{rec.reason}</Text>
                        </div>
                      ))}
                    </div>
                  </Card>
                </Col>
              </Row>
            )
          },
          {
            key: 'high-risk',
            label: (
              <span>
                High Risk Members
                <Tag color="red" style={{ marginLeft: 8 }}>{highRiskMembers.length}</Tag>
              </span>
            ),
            children: (
              <Card>
                {highRiskMembers.length > 0 ? (
                  <Table
                    columns={highRiskColumns}
                    dataSource={highRiskMembers}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: 40 }}>
                    <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a' }} />
                    <p style={{ marginTop: 16 }}>No high risk members found</p>
                  </div>
                )}
              </Card>
            )
          },
          {
            key: 'settings',
            label: 'Risk Settings',
            children: (
              <Card title="Risk Scoring Configuration">
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="Score Calculation Frequency">Monthly</Descriptions.Item>
                  <Descriptions.Item label="High Risk Threshold">
                    <Tag color="red">Score &lt; 40</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Medium Risk Threshold">
                    <Tag color="orange">Score 40-69</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Low Risk Threshold">
                    <Tag color="green">Score &gt;= 70</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Repayment Behavior Weight">30%</Descriptions.Item>
                  <Descriptions.Item label="Contribution Weight">25%</Descriptions.Item>
                  <Descriptions.Item label="Loan History Weight">20%</Descriptions.Item>
                  <Descriptions.Item label="Fraud Flags Weight">15%</Descriptions.Item>
                  <Descriptions.Item label="Account Standing Weight">10%</Descriptions.Item>
                </Descriptions>
                <Button type="primary" style={{ marginTop: 16 }}>Edit Settings</Button>
              </Card>
            )
          }
        ]}
      />
    </div>
  )
}

export default RiskProfile
