import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import './App.css'
import AdminDashboard from './admin/AdminDashboard.jsx'
import AdminLayout from './admin/AdminLayout.jsx'
import AdminLogin from './admin/AdminLogin.jsx'
import ManageBookings from './admin/ManageBookings.jsx'
import ManageTables from './admin/ManageTables.jsx'
import Footer from './components/Footer.jsx'
import Navbar from './components/Navbar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import RouteNotice from './components/RouteNotice.jsx'
import BookTable from './pages/BookTable.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import MyBookings from './pages/MyBookings.jsx'
import Register from './pages/Register.jsx'
import Tables from './pages/Tables.jsx'

function CustomerLayout() {
  return (
    <div className="site-shell">
      <Navbar />
      <main className="site-main">
        <RouteNotice />
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<CustomerLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/tables" element={<Tables />} />
            <Route path="/book-table" element={<BookTable />} />
            <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/register" element={<Register />} />
        </Route>
        <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="tables" element={<ManageTables />} />
          <Route path="bookings" element={<ManageBookings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
