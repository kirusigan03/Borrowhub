import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { EquipmentProvider } from './context/EquipmentContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { BookingProvider } from './context/BookingContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <EquipmentProvider>
          <CartProvider>
            <BookingProvider>
              <App />
            </BookingProvider>
          </CartProvider>
        </EquipmentProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
