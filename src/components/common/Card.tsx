'use client';

import { Card as MUICard, CardContent, CardHeader, CardActions } from '@mui/material';
import { ReactNode } from 'react';

interface CardProps {
  title?: string | ReactNode;
  subtitle?: string | ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  elevation?: number;
}

export function Card({ title, subtitle, children, actions, elevation = 1 }: CardProps) {
  return (
    <MUICard elevation={elevation}>
      {(title || subtitle) && <CardHeader title={title} subheader={subtitle} />}
      <CardContent>{children}</CardContent>
      {actions && <CardActions>{actions}</CardActions>}
    </MUICard>
  );
}
