import PropTypes from 'prop-types';
import { Box } from '@mui/material';

export default function MarketplaceLayout({ children }) {
  return (
    <Box sx={{ minWidth: 0 }}>{children}</Box>
  );
}

MarketplaceLayout.propTypes = {
  children: PropTypes.node,
};
