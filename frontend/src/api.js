const API_URL = 'http://localhost:5000/api'

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const token = localStorage.getItem('jaatra_token')
  const h = { ...headers }
  if (body) h['Content-Type'] = 'application/json'
  if (token) h.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: h,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error || 'Something went wrong')
    err.status = res.status
    throw err
  }
  return data
}

function uploadImage(file) {
  const token = localStorage.getItem('jaatra_token')
  const form = new FormData()
  form.append('image', file)
  return fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  }).then(async (res) => {
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Upload failed')
    return data.data.url
  })
}

export const api = {
  register: (body) => request('/auth/register', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  getMe: () => request('/users/me'),
  updateMe: (body) => request('/users/me', { method: 'PATCH', body }),
  getWishlist: () => request('/users/me/wishlist'),
  addToWishlist: (id) => request(`/users/me/wishlist/${id}`, { method: 'POST' }),
  removeFromWishlist: (id) => request(`/users/me/wishlist/${id}`, { method: 'DELETE' }),

  getPlaces: (params) => request(`/places?${new URLSearchParams(params)}`),
  getPlace: (id) => request(`/places/${id}`),
  createPlace: (body) => request('/places', { method: 'POST', body }),
  updatePlace: (id, body) => request(`/places/${id}`, { method: 'PUT', body }),
  deletePlace: (id) => request(`/places/${id}`, { method: 'DELETE' }),

  getReviews: (placeId) => request(`/places/${placeId}/reviews`),
  createReview: (placeId, body) => request(`/places/${placeId}/reviews`, { method: 'POST', body }),
  updateReview: (id, body) => request(`/reviews/${id}`, { method: 'PATCH', body }),
  deleteReview: (id) => request(`/reviews/${id}`, { method: 'DELETE' }),
  restoreReview: (id) => request(`/reviews/${id}/restore`, { method: 'PATCH' }),
  markHelpful: (id) => request(`/reviews/${id}/helpful`, { method: 'PATCH' }),
  reportReview: (id, body) => request(`/reviews/${id}/report`, { method: 'POST', body }),

  getReports: (status) => request(`/reports${status ? `?status=${status}` : ''}`),
  resolveReport: (id) => request(`/reports/${id}`, { method: 'PATCH', body: { status: 'resolved' } }),

  uploadImage,
}
