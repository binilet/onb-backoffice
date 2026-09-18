import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ButtonBase, Box, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export default function SidebarItem({ icon, text, to, active = false, disabled = false, onClick }) {
  const theme = useTheme();
  const isDisabled = disabled || !to;
  const isActive = active && !isDisabled;

  return (
    <ButtonBase
      component={isDisabled ? 'button' : Link}
      {...(isDisabled ? { type: 'button' } : { to, onClick })}
      aria-current={isActive ? 'page' : undefined}
      disabled={isDisabled}
      sx={{
        width: '100%',
        textAlign: 'left',
        py: 1.5,
        px: 3,
        borderRadius: 1,
        mb: 1,
        position: 'relative',
        minWidth: 0,
        minHeight: { xs: theme.layout.touchTargetSize, sm: theme.layout.navItemHeight },
        color: isDisabled ? 'text.disabled' : isActive ? 'primary.main' : 'text.secondary',
        bgcolor: isActive ? 'surface.selected' : 'transparent',
        '&:hover': {
          color: isActive ? 'primary.main' : 'text.primary',
          bgcolor: isActive ? 'surface.selectedHover' : 'action.hover',
        },
        '&.Mui-focusVisible': {
          outline: `${theme.layout.focusWidth}px solid ${theme.palette.primary.main}`,
          outlineOffset: -theme.layout.focusWidth,
        },
        '&.Mui-disabled': {
          color: 'text.disabled',
          bgcolor: 'transparent',
        },
        overflow: 'hidden',
        justifyContent: 'flex-start',
      }}
    >
      {isActive && (
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: theme.layout.navIndicatorWidth,
            height: theme.layout.navIconSize,
            bgcolor: 'primary.main',
            borderRadius: theme.layout.navIndicatorRadius,
          }}
        />
      )}

      <Stack component="span" direction="row" spacing={3} alignItems="center" sx={{ width: '100%', minWidth: 0 }}>
        <Box
          component="span"
          sx={{
            color: isDisabled ? 'text.disabled' : isActive ? 'primary.main' : 'text.secondary',
            display: 'flex',
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            width: theme.layout.navIconSize,
            '& .MuiSvgIcon-root': { fontSize: theme.layout.navIconSize },
          }}
        >
          {icon}
        </Box>
        <Typography
          component="span"
          variant="body2"
          fontWeight={isActive ? 600 : 500}
          color="inherit"
          sx={{ flexGrow: 1, minWidth: 0, overflowWrap: 'anywhere' }}
        >
          {text}
        </Typography>
      </Stack>
    </ButtonBase>
  );
}

SidebarItem.propTypes = {
  icon: PropTypes.node.isRequired,
  text: PropTypes.string.isRequired,
  to: PropTypes.string,
  active: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
};
