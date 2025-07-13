import { Navigate } from 'react-router-dom'

const AdminRoute = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken')
  const adminInfo = localStorage.getItem('adminInfo')

  if (!adminToken || !adminInfo) {
    return <Navigate to="/admin-login" replace />
  }

  return children
}

export default AdminRoute 