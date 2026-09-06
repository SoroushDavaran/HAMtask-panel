import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Alert, Button, Modal, Form, Input, InputNumber, Popconfirm, message } from 'antd'
import { PlusOutlined, DeleteOutlined, InfoCircleOutlined, AppstoreOutlined } from '@ant-design/icons'
import { getApps, createApp, deleteApp } from '../api/apps'
import { PageHeader, StatStrip, EmptyState, LoadingState, StatusPill } from '../components/UI'
import { useBreadcrumb } from '../components/BreadcrumbContext'

function AppsPage() {
  const { clusterId, namespaceId } = useParams()
  const navigate = useNavigate()

  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form] = Form.useForm()

  useBreadcrumb([
    { title: 'کلاسترها', onClick: () => navigate('/clusters') },
    { title: 'Namespace ها', onClick: () => navigate(`/clusters/${clusterId}/namespaces`) },
    { title: 'App ها' },
  ])

  const fetchApps = async () => {
    try {
      setLoading(true)
      const data = await getApps(namespaceId)
      setApps(data)
      setError(null)
    } catch (err) {
      setError('خطا در دریافت لیست App ها.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApps()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [namespaceId])

  const handleCreate = async (values) => {
    try {
      setCreating(true)
      await createApp(namespaceId, values)
      message.success('App با موفقیت ساخته شد')
      setModalOpen(false)
      form.resetFields()
      fetchApps()
    } catch (err) {
      const detail = err.response?.data?.detail || 'خطا در ساخت App'
      message.error(detail)
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (appId) => {
    try {
      await deleteApp(appId)
      message.success('App حذف شد')
      fetchApps()
    } catch (err) {
      const detail = err.response?.data?.detail || 'خطا در حذف App'
      message.error(detail)
    }
  }

  const readyCount = (app) => app.pods.filter((p) => p.ready).length

  const runningApps = apps.filter((a) => a.pods.length > 0 && readyCount(a) === a.pods.length).length

  return (
    <div className="page">
      <PageHeader
        backLabel="بازگشت به Namespace ها"
        onBack={() => navigate(`/clusters/${clusterId}/namespaces`)}
        title="App ها"
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            App جدید
          </Button>
        }
      />

      {loading ? (
        <LoadingState label="در حال دریافت App ها…" />
      ) : error ? (
        <Alert type="error" message="خطا" description={error} showIcon />
      ) : apps.length === 0 ? (
        <EmptyState
          icon={<AppstoreOutlined />}
          title="هنوز App ای در این Namespace نیست"
          description="با دکمه‌ی «App جدید» اولین Deployment این Namespace را بسازید."
          action={
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
              App جدید
            </Button>
          }
        />
      ) : (
        <>
          <StatStrip
            items={[
              { label: 'App', value: apps.length, accent: true },
              { label: 'کاملاً آماده', value: runningApps },
            ]}
          />

          <div className="card-grid">
            {apps.map((app) => {
              const total = app.pods.length
              const ready = readyCount(app)
              const allReady = total > 0 && ready === total
              const statusClass = total === 0 ? 'status-idle' : allReady ? 'status-ok' : 'status-warn'

              return (
                <div
                  key={app.id}
                  className={`entity-card ${statusClass}`}
                  onClick={() => navigate(`/apps/${app.id}`)}
                >
                  <div className="card-top">
                    <span className="card-title">{app.name}</span>
                    <span className="card-icon">
                      <AppstoreOutlined />
                    </span>
                  </div>

                  <div className="kv-row">
                    <span className="kv-label">Image</span>
                    <span className="kv-value">{app.image}</span>
                  </div>
                  <div className="kv-row">
                    <span className="kv-label">Replicas</span>
                    <span className="kv-value">{app.replicas}</span>
                  </div>
                  <div className="kv-row">
                    <span className="kv-label">منابع</span>
                    <span className="kv-value">
                      {app.cpu} / {app.memory}
                    </span>
                  </div>

                  <div className="card-footer-row">
                    <StatusPill tone={total === 0 ? 'idle' : allReady ? 'ok' : 'warn'} live={allReady}>
                      {total === 0 ? 'بدون Pod' : `Ready ${ready}/${total}`}
                    </StatusPill>
                    <div className="card-actions">
                      <Button
                        type="text"
                        size="small"
                        icon={<InfoCircleOutlined />}
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/apps/${app.id}`)
                        }}
                      >
                        جزئیات
                      </Button>
                      <Popconfirm
                        title="حذف App"
                        description="آیا از حذف این App مطمئن هستید؟"
                        okText="بله، حذف کن"
                        cancelText="انصراف"
                        okButtonProps={{ danger: true }}
                        onConfirm={(e) => {
                          e.stopPropagation()
                          handleDelete(app.id)
                        }}
                        onCancel={(e) => e.stopPropagation()}
                      >
                        <Button
                          danger
                          type="text"
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Popconfirm>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      <Modal
        title="ساخت App جدید"
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          form.resetFields()
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{ replicas: 1, cpu: '250m', memory: '256Mi' }}
        >
          <Form.Item
            name="name"
            label="نام App"
            rules={[{ required: true, message: 'وارد کردن نام الزامی است' }]}
          >
            <Input placeholder="مثلاً my-app" />
          </Form.Item>
          <Form.Item
            name="image"
            label="Image"
            rules={[{ required: true, message: 'وارد کردن Image الزامی است' }]}
          >
            <Input placeholder="مثلاً nginx:latest" />
          </Form.Item>
          <Form.Item name="replicas" label="تعداد Replica" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="cpu" label="CPU">
            <Input placeholder="مثلاً 250m" />
          </Form.Item>
          <Form.Item name="memory" label="Memory">
            <Input placeholder="مثلاً 256Mi" />
          </Form.Item>
          <Form.Item style={{ textAlign: 'left', marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={creating}>
              ایجاد
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AppsPage
