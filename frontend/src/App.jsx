import { Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Search from "./pages/Search"
import EquipmentDetail from "./pages/EquipmentDetail"
import ListEquipment from "./pages/ListEquipment"
import MyListings from "./pages/MyListings"
import MyBookings from "./pages/MyBookings"
import Cart from "./pages/Cart"
import Admin from "./pages/Admin"
import { useCart } from "./context/CartContext"

export default function App() {
  const { cartCount } = useCart()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar cartCount={cartCount} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/search" element={<Search />} />
          <Route path="/equipment/:id" element={<EquipmentDetail />} />
          <Route path="/list-equipment" element={<ListEquipment />} />
          <Route path="/my-listings" element={<MyListings />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
