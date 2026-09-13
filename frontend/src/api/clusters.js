import apiClient from './client'

export const getClusters = async () => {
  const response = await apiClient.get('/clusters/')
  return response.data
}