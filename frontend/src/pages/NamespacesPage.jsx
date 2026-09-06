import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Alert, Button, Modal, Form, Input, Popconfirm, message } from 'antd'
import { PlusOutlined, DeleteOutlined, AppstoreOutlined, DatabaseOutlined } from '@ant-design/icons'
import { getNamespaces, createNamespace, deleteNamespace } from '../api/namespaces'
import { PageHeader, StatStrip, EmptyState, LoadingState, StatusPill } from '../components/UI'
import { useBreadcrumb } from '../components/BreadcrumbContext'

function NamespacesPage() {
  const { clusterId } = useParams()
  const navigate = useNavigate()

  const [namespaces, setNamespaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form] = Form.useForm()

  useBreadcrumb([
    { title: 'کلاسترها', onClick: () => navigate('/clusters') },
    { title: 'Namespace ها' },
  ])

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return (
    <div className="page">
      <PageHeader
        backLabel="بازگشت به کلاسترها"
        onBack={() => navigate('/clusters')}
        title="Namespace ها"
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            Namespace جدید
          </Button>
        }
      />

      {loading ? (
        <LoadingState label="در حال دریافت Namespace ها…" />
      ) : error ? (
        <Alert type="error" message="خطا" description={error} showIcon />
      ) : namespaces.length === 0 ? (
        <EmptyState
          icon={<DatabaseOutlined />}
          title="هنوز Namespace ای ساخته نشده"
          description="با دکمه‌ی «Namespace جدید» اولین فضای کاری این کلاستر را بسازید."
          action={
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
              Namespace جدید
            </Button>
          }
        />
      ) : (
        <>
          <StatStrip items={[{ label: 'Namespace', value: namespaces.length, accent: true }]} />

          <div className="card-grid">
            {namespaces.map((ns) => (
              <div
                key={ns.id}
                className="entity-card status-ok"
                onClick={() => navigate(`/clusters/${clusterId}/namespaces/${ns.id}`)}
              >
                <div className="card-top">
                  <span className="card-title">{ns.name}</span>
                  <span className="card-icon">
                    <DatabaseOutlined />
                  </span>
                </div>

                <div className="card-footer-row">
                  <StatusPill tone="ok">فعال</StatusPill>
                  <div className="card-actions">
                    <Button
                      type="text"
                      size="small"
                      icon={<AppstoreOutlined />}
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/clusters/${clusterId}/namespaces/${ns.id}`)
                      }}
                    >
                      App ها
                    </Button>
                    <Popconfirm
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
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Popconfirm>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
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
