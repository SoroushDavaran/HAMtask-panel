import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  List, Card, Spin, Alert, Empty, Button, Modal, Form, Input,
  InputNumber, Popconfirm, message, Typography, Tag, Space
} from 'antd'
import { PlusOutlined, DeleteOutlined, ArrowLeftOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { getApps, createApp, deleteApp } from '../api/apps'

const { Title, Text } = Typography

function AppsPage() {
  const { clusterId, namespaceId } = useParams()
  const navigate = useNavigate()

  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form] = Form.useForm()

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
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(`/clusters/${clusterId}/namespaces`)}
        style={{ marginBottom: 16 }}
      >
        بازگشت به Namespace ها
      </Button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>App ها</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          App جدید
        </Button>
      </div>

      {apps.length === 0 ? (
        <Empty description="هیچ App ای وجود ندارد" style={{ marginTop: 60 }} />
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 3 }}
          dataSource={apps}
          renderItem={(app) => {
            const total = app.pods.length
            const ready = readyCount(app)
            const allReady = total > 0 && ready === total

            return (
              <List.Item>
                <Card
                  hoverable
                  onClick={() => navigate(`/apps/${app.id}`)}
                  actions={[
                    <Popconfirm
                      key="delete"
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
                      <Button danger type="text" icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()}>
                        حذف
                      </Button>
                    </Popconfirm>,
                    <Button
                      key="detail"
                      type="text"
                      icon={<InfoCircleOutlined />}
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/apps/${app.id}`)
                      }}
                    >
                      جزئیات
                    </Button>,
                  ]}
                >
                  <Card.Meta
                    title={app.name}
                    description={
                      <Space direction="vertical" size={4} style={{ width: '100%' }}>
                        <Text type="secondary">Image: {app.image}</Text>
                        <Text type="secondary">Replicas: {app.replicas}</Text>
                        <Text type="secondary">CPU: {app.cpu} | Memory: {app.memory}</Text>
                        <Tag color={allReady ? 'green' : total === 0 ? 'default' : 'orange'}>
                          {total === 0 ? 'بدون Pod' : `Ready: ${ready}/${total}`}
                        </Tag>
                      </Space>
                    }
                  />
                </Card>
              </List.Item>
            )
          }}
        />
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