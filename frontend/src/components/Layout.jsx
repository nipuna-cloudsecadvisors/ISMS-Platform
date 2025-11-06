import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiUsers, FiShield, FiFileText, FiAlertTriangle, FiBarChart2, FiLogOut, FiLayers } from 'react-icons/fi';

function Layout({ user, onLogout, children }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navigation = {
    admin: [
      { name: 'Dashboard', path: '/', icon: FiHome },
      { name: 'Users', path: '/users', icon: FiUsers },
      { name: 'Frameworks', path: '/frameworks', icon: FiLayers },
      { name: 'Controls', path: '/controls', icon: FiShield },
      { name: 'Policies', path: '/policies', icon: FiFileText },
      { name: 'Risks', path: '/risks', icon: FiAlertTriangle },
      { name: 'Reports', path: '/reports', icon: FiBarChart2 },
    ],
    compliance_officer: [
      { name: 'Dashboard', path: '/', icon: FiHome },
      { name: 'Frameworks', path: '/frameworks', icon: FiLayers },
      { name: 'Controls', path: '/controls', icon: FiShield },
      { name: 'Policies', path: '/policies', icon: FiFileText },
      { name: 'Risks', path: '/risks', icon: FiAlertTriangle },
      { name: 'Reports', path: '/reports', icon: FiBarChart2 },
    ],
    external_auditor: [
      { name: 'Dashboard', path: '/', icon: FiHome },
      { name: 'Controls', path: '/controls', icon: FiShield },
      { name: 'Policies', path: '/policies', icon: FiFileText },
      { name: 'Risks', path: '/risks', icon: FiAlertTriangle },
      { name: 'Reports', path: '/reports', icon: FiBarChart2 },
    ],
    employee: [
      { name: 'Dashboard', path: '/', icon: FiHome },
      { name: 'My Policies', path: '/policies', icon: FiFileText },
    ],
  };

  const navItems = navigation[user.role] || navigation.employee;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '250px',
        backgroundColor: 'var(--gray-900)',
        color: 'white',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiShield />
            ISMS
          </h1>
        </div>

        <nav style={{ flex: 1 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  marginBottom: '0.25rem',
                  borderRadius: '0.375rem',
                  color: 'white',
                  textDecoration: 'none',
                  backgroundColor: isActive(item.path) ? 'var(--primary)' : 'transparent',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isActive(item.path)) {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.path)) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div style={{
          paddingTop: '1rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
            <div style={{ opacity: 0.7 }}>Signed in as</div>
            <div style={{ fontWeight: '600' }}>{user.full_name}</div>
            <div style={{ opacity: 0.7, textTransform: 'capitalize' }}>
              {user.role.replace('_', ' ')}
            </div>
          </div>
          <button
            onClick={onLogout}
            className="btn"
            style={{
              width: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white'
            }}
          >
            <FiLogOut />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}

export default Layout;
