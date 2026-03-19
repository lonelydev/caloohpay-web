import React from 'react';
import { Box, Chip, Container, Stack, Typography } from '@mui/material';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import * as styles from '@/app/features/page.styles';

interface FeatureSectionProps {
  icon: React.ReactNode;
  chip: string;
  title: string;
  description: string;
  bullets: string[];
  mockup: React.ReactNode;
  reverse?: boolean;
}

export function FeatureSection({
  icon,
  chip,
  title,
  description,
  bullets,
  mockup,
  reverse,
}: FeatureSectionProps) {
  const revealRef = useScrollReveal<HTMLDivElement>();

  return (
    <Box ref={revealRef} sx={styles.featureSectionRootSx}>
      <Container maxWidth="lg">
        <Box sx={styles.getFeatureSectionContentSx(reverse)}>
          <Box sx={styles.featureTextColumnSx}>
            <Stack spacing={2.5}>
              <Chip
                icon={<Box sx={styles.featureChipIconWrapSx}>{icon}</Box>}
                label={chip}
                color="primary"
                size="small"
                sx={styles.featureChipSx}
              />
              <Typography variant="h4" fontWeight={700} sx={styles.featureTitleSx}>
                {title}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={styles.featureDescriptionSx}>
                {description}
              </Typography>
              <Stack spacing={1}>
                {bullets.map((b) => (
                  <Box key={b} sx={styles.featureBulletRowSx}>
                    <Box sx={styles.featureBulletCheckWrapSx}>
                      <Typography variant="caption" sx={styles.featureBulletCheckSx}>
                        ✓
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {b}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Box>

          <Box sx={styles.getFeatureMockupColumnSx(reverse)}>{mockup}</Box>
        </Box>
      </Container>
    </Box>
  );
}
