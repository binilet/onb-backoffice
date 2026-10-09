import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const SUPER_ROLES = ['system'];

export default function PrivateRoute({ children, allowedRoles }) {
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth._current_user || {});
  const location = useLocation();

  // Remember the page (e.g. an approval link from Telegram) to return to after login.
  if (!token) return <Navigate to="/login" replace state={{ from: location }} />;

  if (user?.mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  if (allowedRoles && !SUPER_ROLES.includes(user?.role) && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/notfound" replace />;
  }

  return children;
}

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

PrivateRoute.defaultProps = {
  allowedRoles: undefined,
};
