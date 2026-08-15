import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './App.css'
import "./atelier-editorial.css";
import App from './App.jsx'
import AdminContext from './Context/AdminContext.jsx'
import UserContext from './Context/UserContext.jsx'
import OrderContext from './Context/OrderContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AdminContext>
      <UserContext>
        <OrderContext>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </OrderContext>
      </UserContext>
    </AdminContext>
  </StrictMode>,
)
