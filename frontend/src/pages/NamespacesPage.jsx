import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { List, Card, Spin, Alert, Empty, Button, Modal, Form, Input, Popconfirm, message, Typography, Space, Tag } from 'antd'
import { PlusOutlined, DeleteOutlined, AppstoreOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { getNamespaces, createNamespace, deleteNamespace } from '../api/namespaces'

const { Title } = Typography

function NamespacesPage() {
  const { clusterId } = useParams()
  const navigate = useNavigate()

  const [namespaces, setNamespaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form] = Form.useForm()

  const fetchNamespaces = async () => {
    try {
      setLoading(true)
      const data = await getNamespaces(clusterId)
      setNamespaces(data)
      setError(null)
    } catch (err) {
      setError('خطا در دریافت لیست Namespace ها.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNamespaces()
  }, [clusterId])

  const handleCreate = async (values) => {
    try {
      setCreating(true)
      await createNamespace(clusterId, values.name)
      message.success('Namespace با موفقیت ساخته شد')
      setModalOpen(false)
      form.resetFields()
      fetchNamespaces()
    } catch (err) {
      const detail = err.response?.data?.detail || 'خطا در ساخت Namespace'
      message.error(detail)
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (namespaceId) => {
    try {
      await deleteNamespace(namespaceId)
      message.success('Namespace حذف شد')
      fetchNamespaces()
    } catch (err) {
      const detail = err.response?.data?.detail || 'خطا در حذف Namespace'
      message.error(detail)
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

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/clusters')}
        style={{ marginBottom: 16 }}
      >
        بازگشت به Cluster ها
      </Button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Namespace ها</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          Namespace جدید
        </Button>
      </div>

      {namespaces.length === 0 ? (
        <Empty description="هیچ Namespace ای وجود ندارد" style={{ marginTop: 60 }} />
      ) : (
        <List
          grid={{ gutter: 16, column: 1 }}
          dataSource={namespaces}
          renderItem={(ns) => (
            <List.Item>
              <Card
                hoverable
                onClick={() => navigate(`/clusters/${clusterId}/namespaces/${ns.id}`)}
                actions={[
                  <Popconfirm
                    key="delete"
                    title="حذف Namespace"
                    description="آیا از حذف این Namespace مطمئن هستید؟"
                    okText="بله، حذف کن"
                    cancelText="انصراف"
                    okButtonProps={{ danger: true }}
                    onConfirm={(e) => {
                      e.stopPropagation()
                      handleDelete(ns.id)
                    }}
                    onCancel={(e) => e.stopPropagation()}
                  >
                    <Button
                      danger
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={(e) => e.stopPropagation()}
                    >
                      حذف
                    </Button>
                  </Popconfirm>,
                  <Button
                    key="apps"
                    type="text"
                    icon={<AppstoreOutlined />}
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/clusters/${clusterId}/namespaces/${ns.id}`)
                    }}
                  >
                    مشاهده App ها
                  </Button>,
                ]}
              >
                <Card.Meta
                  title={ns.name}
                  description={
                    <Space direction="vertical">
                      <Tag color="blue">Active</Tag>
                    </Space>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      )}

      <Modal
        title="ساخت Namespace جدید"
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          form.resetFields()
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="name"
            label="نام Namespace"
            rules={[{ required: true, message: 'وارد کردن نام الزامی است' }]}
          >
            <Input placeholder="مثلاً new-ns" />
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

export default NamespacesPage