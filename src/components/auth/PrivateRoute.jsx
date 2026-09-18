import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const SUPER_ROLES = ['system'];

export default function PrivateRoute({ children, allowedRoles }) {
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth._current_user || {});

  if (!token) return <Navigate to="/login" replace />;

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
