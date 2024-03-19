import { ReactNode } from "react"
import { Route, Routes, Navigate, Outlet } from "react-router-dom"
import Login from "../auth/Login"
import { useAuthStore } from "../store/store"
import Dashboard from "../views/admin/Dashboard"
import Games from "../views/admin/Games"
import Display from "../views/court/Display"
import Default from "../layouts/Default"
import Categories from "../views/admin/Categories"
import Officials from "../views/admin/Officials"
import Courts from "../views/admin/Courts"

type ProtectedRouteProps = {
  isAllowed: boolean
  redirectPath?: string
  children?: ReactNode
}

const ProtectedRoute = ({
  isAllowed,
  redirectPath = "/",
  children,
}: ProtectedRouteProps) => {
  if (!isAllowed) {
    return <Navigate to={redirectPath} replace />
  }
  return children ? children : <Outlet />
}

export default () => {
  const isAdmin = useAuthStore((state) => state.isAdmin)
  const user = useAuthStore((state) => state.user)
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="admin/*"
        element={
          <ProtectedRoute isAllowed={isAdmin}>
            <Routes>
              <Route element={<Default />}>
                <Route index path="/dashboard" element={<Dashboard />} />
                <Route path="/games" element={<Games />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/officials" element={<Officials />} />
                <Route path="/courts" element={<Courts />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" />} />
              </Route>
            </Routes>
          </ProtectedRoute>
        }
      />
      <Route
        path="court/*"
        element={
          <ProtectedRoute isAllowed={!!(user && !isAdmin)}>
            <Routes>
              <Route index path="/display" Component={Display} />
              <Route path="*" element={<Navigate to="/display" />} />
            </Routes>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="" />} />
    </Routes>
  )
}
