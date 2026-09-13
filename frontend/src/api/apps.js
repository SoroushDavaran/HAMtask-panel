import apiClient from './client'

export const getApps = async (namespaceId) => {
  const response = await apiClient.get('/apps/', {
    params: { namespace_id: namespaceId },
  })
  return response.data
}

export const createApp = async (namespaceId, values) => {
  const response = await apiClient.post('/apps/', {
    namespace_id: namespaceId,
    name: values.name,
    image: values.image,
    replicas: values.replicas,
    cpu: values.cpu,
    memory: values.memory,
  })
  return response.data
}

export const deleteApp = async (appId) => {
  await apiClient.delete(`/apps/${appId}/`)
}

export const getAppDetail = async (appId) => {
  const response = await apiClient.get(`/apps/${appId}/`)
  return response.data
}

export const updateApp = async (appId, values) => {
  const response = await apiClient.patch(`/apps/${appId}/`, values)
  return response.data
}