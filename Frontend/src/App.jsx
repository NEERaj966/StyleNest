import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import UserNavbar from './Componants/UserNavbar'
import AdminNavbar from './Componants/AdminNavbar'
import UserSignUP from './Pages/UserSignUP'
import Home from './Pages/Home'
import About from './Pages/About'
import UserLogin from './Pages/UserLogin'
import AdminLogin from './Pages/AdminLogin'
import AdminHome from './Pages/AdminHome'
import AdminProtectedWrapper from './Pages/adminProtectedWrapper'
import Breakfast from './Pages/Breakfast'
import Lunch from './Pages/Lunch'
import Dinner from './Pages/Dinner'
import OrderPage from './Pages/OrderPage'
import AdminStockLogs from './Pages/AdminStockLogs'
import Favorites from './Pages/Favorites'
import Products from './Pages/products'
import ProductDetailPage from './Pages/ProductDetails'
import ProductEdit from './Pages/ProductEdit'
import AdminProductDetail from './Pages/productdetailAdmin'
import AddressPage from './Pages/AddressDetail'
import PaymentPage from './Pages/Payment'
import MyOrders from './Pages/myorders'
import OrderDetails from './Pages/orderDetail'
import AdminOrders from "./Pages/AdminOrder";
import AdminDashboard from './Pages/AdminDashboard'

const App = () => {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <div>
      {isAdminRoute ? <AdminNavbar /> : <UserNavbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<UserSignUP />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/breakfast" element={<Breakfast />} />
        <Route path="/lunch" element={<Lunch />} />
        <Route path="/dinner" element={<Dinner />} />
        <Route path="/orders" element={<OrderPage />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/about" element={<About />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/product/:id"
          element={<ProductDetailPage />}
        />

        <Route
          path="/payment"
          element={<PaymentPage />}
        />

        <Route
          path="/myorders"
          element={<MyOrders />}
        />

        <Route
          path="/orders/:id"
          element={<OrderDetails />}
        />

        <Route
          path="/addresses"
          element={<AddressPage />}
        />


        <Route

          path="/admin/product/:id"
          element={
            <AdminProtectedWrapper>
              <AdminProductDetail />
            </AdminProtectedWrapper>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminProtectedWrapper>
              <AdminHome />
            </AdminProtectedWrapper>
          }
        />

        <Route
          path="admin/dashboard"
          element={
            <AdminProtectedWrapper>
              <AdminDashboard />
            </AdminProtectedWrapper>
          }
        />
        <Route
          path="/admin/menu"
          element={
            <AdminProtectedWrapper>
              <Products />
            </AdminProtectedWrapper>
          }
        />

        <Route
          path="/admin/edit-product/:id"
          element={
            <AdminProtectedWrapper>
              <ProductEdit />
            </AdminProtectedWrapper>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminProtectedWrapper>
              <AdminOrders />
            </AdminProtectedWrapper>
          }
        />


        <Route
          path="/admin/stock-logs"
          element={
            <AdminProtectedWrapper>
              <AdminStockLogs />
            </AdminProtectedWrapper>
          }
        />
      </Routes>
    </div>
  )
}

export default App
