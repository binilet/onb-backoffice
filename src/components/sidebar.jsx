import React, { useState } from 'react';
import { ListItem, ListItemIcon, ListItemText, Collapse } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Link } from 'react-router-dom';

import { useTheme } from '@mui/material/styles';
import { ButtonBase, Box, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { alpha } from '@mui/material/styles';

const SidebarItem = ({ icon, text, to, active }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <ButtonBase
      component="div"
      onClick={() => navigate(to)}
      sx={{
        width: '100%',
        textAlign: 'left',
        py: 0.5,
        px: 2,
        borderRadius: 1.5,
        mb: 0.75,
        position: 'relative',
        transition: 'all 0.3s ease',
        bgcolor: active ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
        '&:hover': {
          bgcolor: active 
            ? alpha(theme.palette.primary.main, 0.18) 
            : alpha(theme.palette.action.hover, 0.08)
        },
        overflow: 'hidden',
        justifyContent: 'flex-start'
      }}
    >
      {/* Active indicator - left border */}
      {active && (
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 4,
            height: '70%',
            bgcolor: 'primary.main',
            borderRadius: '0 4px 4px 0',
          }}
        />
      )}
      
      <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
        <Box
          sx={{
            color: active ? theme.palette.primary.main : theme.palette.text.secondary,
            display: 'flex',
            p: 0.75,
            borderRadius: 1.5,
            bgcolor: active ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
            transition: 'all 0.3s ease',
          }}
        >
          {icon}
        </Box>
        <Typography
          variant="body2"
          fontWeight={active ? 700 : 500}
          color={active ? 'primary.main' : 'text.primary'}
          sx={{ flexGrow: 1 }}
        >
          {text}
        </Typography>
        
        {/* Optional: You can add a subtle indicator on the right side */}
        {active && (
          <Box
            sx={{
              width: 8,
              height: 8,
              bgcolor: 'primary.main',
              borderRadius: '50%',
              ml: 'auto'
            }}
          />
        )}
      </Stack>
    </ButtonBase>
  );
};

export default SidebarItem;
