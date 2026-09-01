import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Row, Col, Card, Spin, Alert, Empty, Tag, Typography } from 'antd'
import { CloudServerOutlined } from '@ant-design/icons'
import { getClusters } from '../api/clusters'

const { Title, Text } = Typography

function ClustersPage() {
  const [clusters, setClusters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchClusters = async () => {
      try {
        setLoading(true)
        const data = await getClusters()
        setClusters(data)
        setError(null)
      } catch (err) {
        setError('خطا در دریافت لیست کلاسترها. لطفاً از اجرای Backend مطمئن شوید.')
      } finally {
        setLoading(false)
      }
    }
    fetchClusters()
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
        <Spin size="large" tip="در حال بارگذاری..." />
      </div>
    )
  }

  if (error) {
    return <Alert type="error" message="خطا" description={error} showIcon style={{ margin: 24 }} />
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Cluster ها</Title>

      {clusters.length === 0 ? (
        <Empty description="هیچ Cluster ای ثبت نشده است" style={{ marginTop: 60 }} />
      ) : (
        <Row gutter={[16, 16]}>
          {clusters.map((cluster) => (
            <Col xs={24} sm={12} md={8} lg={6} key={cluster.id}>
              <Card
                hoverable
                onClick={() => navigate(`/clusters/${cluster.id}/namespaces`)}
                title={
                  <span>
                    <CloudServerOutlined style={{ marginLeft: 8, color: '#1677ff' }} />
                    {cluster.name}
                  </span>
                }
              >
                <p>
                  <Text type="secondary">آدرس:</Text> {cluster.address}
                </p>
                <p>
                  <Text type="secondary">تعداد Namespace:</Text> {cluster.namespace_count}
                </p>
                <Tag color="green">Active</Tag>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  )
}

export default ClustersPage