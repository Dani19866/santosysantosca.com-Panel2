// Pages
import BOM from "./pages/bom"
import Dashboard from "./pages/dashboard"
import HistoryProduction from "./pages/historyProduction"
import LiveProduction from "./pages/liveProduction"
import Login from "./pages/login"
import Machines from "./pages/machines"
import Parameters from "./pages/parameters"
import Products from "./pages/products"
import Sensors from "./pages/sensors"
import Settings from "./pages/settings"
import ProductsMovements from "./pages/products_movements"

// Components
import { BrowserRouter, Routes, Route } from 'react-router-dom';

export default function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Dashboard authProvider={true} />} />
          <Route path="/products" element={<Products authProvider={true} />} />
          <Route path="/products-movements" element={<ProductsMovements authProvider={true} />} />

          <Route path="/settings" element={<Settings authProvider={true} />} />
          <Route path="/live-production" element={<LiveProduction authProvider={true} />} />
          <Route path="/history-production" element={<HistoryProduction />} />
          <Route path="/bom" element={<BOM />} />
          <Route path="/machine-products" element={<Parameters />} />
          <Route path="/machines" element={<Machines />} />
          <Route path="/sensors" element={<Sensors />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}