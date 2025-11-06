'use client';

import React from 'react';
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Toolbar,
  Typography,
  useScrollTrigger,
} from '@mui/material';
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { useThemeMode } from '@/context/ThemeContext';
import { ROUTES } from '@/lib/constants';

interface HeaderProps {
  elevation?: number;
}

interface ElevationScrollProps {
  children: React.ReactElement<{ elevation?: number }>;
}

function ElevationScroll({ children }: ElevationScrollProps) {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0,
  });
}

export function Header({ elevation }: HeaderProps) {
  const { mode, toggleTheme } = useThemeMode();

  return (
    <ElevationScroll>
      <AppBar position="sticky" elevation={elevation}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            {/* Logo */}
            <Link href={ROUTES.HOME} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarIcon sx={{ fontSize: 28 }} />
                <Typography
                  variant="h6"
                  noWrap
                  sx={{
                    fontWeight: 700,
                    color: 'inherit',
                  }}
                >
                  CalOohPay
                </Typography>
              </Box>
            </Link>

            {/* Spacer */}
            <Box sx={{ flexGrow: 1 }} />

            {/* Navigation Links */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button color="inherit" component={Link} href={ROUTES.SCHEDULES}>
                Schedules
              </Button>

              {/* Dark Mode Toggle */}
              <IconButton onClick={toggleTheme} color="inherit" aria-label="toggle theme">
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>

              {/* Auth Button - will be conditionally rendered based on auth state */}
              <Button variant="contained" color="secondary" component={Link} href={ROUTES.LOGIN}>
                Sign In
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </ElevationScroll>
  );
}
