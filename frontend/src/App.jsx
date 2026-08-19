import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Protected from './components/Protected'
import Home from './pages/Home'
import PlaceDetail from './pages/PlaceDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Wishlist from './pages/Wishlist'
import Admin from './pages/Admin'

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/place/:id" element={<PlaceDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Protected><Profile /></Protected>} />
          <Route path="/wishlist" element={<Protected><Wishlist /></Protected>} />
          <Route path="/admin" element={<Protected adminOnly><Admin /></Protected>} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <footer className="footer">Jaatra · field notes from the road — hotels, tables & trails worth the trip.</footer>
    </div>
  )
}
