import apiClient from './client'

export const getNamespaces = async (clusterId) => {
  const response = await apiClient.get('/namespaces/', {
    params: { cluster_id: clusterId },
  })
  return response.data
}

export const createNamespace = async (clusterId, name) => {
  const response = await apiClient.post('/namespaces/', {
    cluster_id: clusterId,
    name,
  })
  return response.data
}

export const deleteNamespace = async (namespaceId) => {
  await apiClient.delete(`/namespaces/${namespaceId}/`)
}