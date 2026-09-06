import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert } from 'antd'
import { ClusterOutlined, DatabaseOutlined } from '@ant-design/icons'
import { getClusters } from '../api/clusters'
import { PageHeader, StatStrip, EmptyState, LoadingState, StatusPill } from '../components/UI'

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

  const totalNamespaces = clusters.reduce((sum, c) => sum + (c.namespace_count || 0), 0)

  return (
    <div className="page">
      <PageHeader
        title="کلاسترها"
        subtitle="نقطه‌ی شروع برای مدیریت کلاسترهای Kubernetes متصل‌شده"
      />

      {loading ? (
        <LoadingState label="در حال دریافت کلاسترها…" />
      ) : error ? (
        <Alert type="error" message="خطا" description={error} showIcon />
      ) : clusters.length === 0 ? (
        <EmptyState
          icon={<ClusterOutlined />}
          title="هنوز کلاستری ثبت نشده"
          description="برای شروع، یک کلاستر Kubernetes را از طریق Backend به این کنسول متصل کنید."
        />
      ) : (
        <>
          <StatStrip
            items={[
              { label: 'کلاستر', value: clusters.length, accent: true },
              { label: 'مجموع Namespace', value: totalNamespaces },
            ]}
          />

          <div className="card-grid">
            {clusters.map((cluster) => (
              <div
                key={cluster.id}
                className="entity-card status-ok"
                onClick={() => navigate(`/clusters/${cluster.id}/namespaces`)}
              >
                <div className="card-top">
                  <span className="card-title">{cluster.name}</span>
                  <span className="card-icon">
                    <ClusterOutlined />
                  </span>
                </div>

                <div className="kv-row">
                  <span className="kv-label">آدرس</span>
                  <span className="kv-value">{cluster.address}</span>
                </div>
                <div className="kv-row">
                  <span className="kv-label">
                    <DatabaseOutlined style={{ marginLeft: 6 }} />
                    Namespace
                  </span>
                  <span className="kv-value">{cluster.namespace_count}</span>
                </div>

                <div className="card-footer-row">
                  <StatusPill tone="ok" live>
                    متصل
                  </StatusPill>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default ClustersPage
