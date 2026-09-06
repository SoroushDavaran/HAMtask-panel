import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Alert, Button, Modal, Form, Input, InputNumber, message } from 'antd'
import { EditOutlined, ReloadOutlined, AppstoreOutlined } from '@ant-design/icons'
import { getAppDetail, updateApp } from '../api/apps'
import { PageHeader, StatStrip, StatusPill, LoadingState, EmptyState } from '../components/UI'
import { useBreadcrumb } from '../components/BreadcrumbContext'

const podTone = (pod) => {
  if (pod.phase === 'Failed') return { tone: 'error', text: 'Failed' }
  if (pod.phase === 'Pending') return { tone: 'warn', text: 'Pending' }
  if (pod.phase === 'Running' && pod.ready) return { tone: 'ok', text: 'Running' }
  return { tone: 'warn', text: 'Not Ready' }
}

function AppDetailPage() {
  const { appId } = useParams()
  const navigate = useNavigate()

  const [app, setApp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  useBreadcrumb([
    { title: 'کلاسترها', onClick: () => navigate('/clusters') },
    { title: app ? app.name : 'App' },
  ])

  const fetchApp = async () => {
    try {
      setLoading(true)
      const data = await getAppDetail(appId)
      setApp(data)
      setError(null)
    } catch (err) {
      setError('خطا در دریافت اطلاعات App.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApp()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId])

  const handleEdit = () => {
    form.setFieldsValue({
      image: app.image,
      replicas: app.replicas,
      cpu: app.cpu,
      memory: app.memory,
    })
    setModalOpen(true)
  }

  const handleSave = async (values) => {
    try {
      setSaving(true)
      await updateApp(appId, values)
      message.success('App با موفقیت به‌روزرسانی شد')
      setModalOpen(false)
      fetchApp()
    } catch (err) {
      const detail = err.response?.data?.detail || 'خطا در به‌روزرسانی App'
      message.error(detail)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="page">
        <LoadingState label="در حال دریافت اطلاعات App…" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="page">
        <Alert type="error" message="خطا" description={error} showIcon />
      </div>
    )
  }

  const readyCount = app.pods.filter((p) => p.ready).length
  const totalCount = app.pods.length
  const allReady = totalCount > 0 && readyCount === totalCount

  return (
    <div className="page">
      <PageHeader
        backLabel="بازگشت"
        onBack={() => navigate(-1)}
        title={app.name}
        subtitle={app.image}
        actions={
          <>
            <Button icon={<ReloadOutlined />} onClick={fetchApp}>
              بروزرسانی
            </Button>
            <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
              ویرایش
            </Button>
          </>
        }
      />

      <StatStrip
        items={[
          { label: 'Replicas', value: app.replicas, accent: true },
          { label: 'CPU', value: app.cpu },
          { label: 'Memory', value: app.memory },
          { label: 'Pod آماده', value: `${readyCount}/${totalCount}` },
        ]}
      />

      <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: 15, color: 'var(--text-strong)' }}>وضعیت Pod ها</h3>
        <StatusPill tone={totalCount === 0 ? 'idle' : allReady ? 'ok' : 'warn'} live={allReady}>
          {totalCount === 0 ? 'بدون Pod' : allReady ? 'همه آماده' : 'در حال آماده‌سازی'}
        </StatusPill>
      </div>

      {totalCount === 0 ? (
        <EmptyState
          icon={<AppstoreOutlined />}
          title="هنوز Pod ای ساخته نشده"
          description="پس از زمان‌بندی روی کلاستر، Pod های این App اینجا نمایش داده می‌شوند."
        />
      ) : (
        <div className="pod-list">
          {app.pods.map((pod) => {
            const meta = podTone(pod)
            return (
              <div className="pod-row" key={pod.name}>
                <span className="pod-name">{pod.name}</span>
                <StatusPill tone={meta.tone} live={meta.tone === 'ok'}>
                  {meta.text}
                </StatusPill>
              </div>
            )
          })}
        </div>
      )}

      <Modal title="ویرایش App" open={modalOpen} onCancel={() => setModalOpen(false)} footer={null}>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="image" label="Image" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="replicas" label="تعداد Replica" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="cpu" label="CPU" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="memory" label="Memory" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item style={{ textAlign: 'left', marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={saving}>
              ذخیره تغییرات
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AppDetailPage
