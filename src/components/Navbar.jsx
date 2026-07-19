import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  const { pathname } = useLocation()

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <span className="brand-name">CRUCIBLE</span>
        <span className="brand-badge">INDUSTRIAL</span>
      </Link>
      <nav>
        <Link to="/" className={pathname === '/' ? 'active' : ''}>
          Home
        </Link>
        <Link to="/forecaster" className={pathname === '/forecaster' ? 'active' : ''}>
          Forecaster
        </Link>
      </nav>
    </header>
  )
}
