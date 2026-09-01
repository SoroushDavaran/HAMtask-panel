import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Spin, Alert, Button, Modal, Form, Input, InputNumber,
  message, Typography, Tag, Card, Descriptions, List, Space
} from 'antd'
import {
  ArrowLeftOutlined, EditOutlined, ReloadOutlined,
  CheckCircleFilled, ClockCircleFilled, CloseCircleFilled
} from '@ant-design/icons'
import { getAppDetail, updateApp } from '../api/apps'

const { Title } = Typography

const getPodStatusMeta = (pod) => {
  if (pod.phase === 'Failed') {
    return { color: 'error', text: 'Failed', icon: <CloseCircleFilled /> }
  }
  if (pod.phase === 'Pending') {
    return { color: 'gold', text: 'Pending', icon: <ClockCircleFilled /> }
  }
  if (pod.phase === 'Running' && pod.ready) {
    return { color: 'success', text: 'Running', icon: <CheckCircleFilled /> }
  }
  return { color: 'orange', text: 'Not Ready', icon: <ClockCircleFilled /> }
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
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
        <Spin size="large" tip="در حال بارگذاری..." />
      </div>
    )
  }

  if (error) {
    return <Alert type="error" message="خطا" description={error} showIcon style={{ margin: 24 }} />
  }

  const readyCount = app.pods.filter((p) => p.ready).length
  const totalCount = app.pods.length

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
        بازگشت
      </Button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>{app.name}</Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchApp}>
            بروزرسانی
          </Button>
          <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
            ویرایش
          </Button>
        </Space>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Image">{app.image}</Descriptions.Item>
          <Descriptions.Item label="Replicas">{app.replicas}</Descriptions.Item>
          <Descriptions.Item label="CPU">{app.cpu}</Descriptions.Item>
          <Descriptions.Item label="Memory">{app.memory}</Descriptions.Item>
          <Descriptions.Item label="وضعیت کلی">
            <Tag color={readyCount === totalCount && totalCount > 0 ? 'success' : 'warning'}>
              {totalCount === 0 ? 'بدون Pod' : `${readyCount} از ${totalCount} Pod آماده`}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Title level={4}>وضعیت Pod ها</Title>
      {totalCount === 0 ? (
        <Alert type="info" message="هنوز هیچ Pod ای برای این App ساخته نشده است." showIcon />
      ) : (
        <List
          dataSource={app.pods}
          renderItem={(pod) => {
            const meta = getPodStatusMeta(pod)
            return (
              <List.Item>
                <Card style={{ width: '100%' }} size="small">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography.Text code>{pod.name}</Typography.Text>
                    <Tag icon={meta.icon} color={meta.color}>
                      {meta.text}
                    </Tag>
                  </div>
                </Card>
              </List.Item>
            )
          }}
        />
      )}

      <Modal
        title="ویرایش App"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
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