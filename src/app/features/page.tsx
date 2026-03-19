'use client';

import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import Link from 'next/link';
import { Header, Footer } from '@/components/common';
import { FeatureSection } from '@/components/features/FeatureSection';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { ROUTES } from '@/lib/constants';
import { FEATURES, STATS } from './page.constants';
import * as styles from './page.styles';

export default function FeaturesPage() {
  const heroRef = useScrollReveal<HTMLDivElement>();
  const statsRef = useScrollReveal<HTMLDivElement>();
  const ctaRef = useScrollReveal<HTMLDivElement>();

  return (
    <Box sx={styles.pageRootSx}>
      <Header />

      <Box sx={styles.heroSectionSx}>
        <Box sx={styles.heroCircleTopSx} />
        <Box sx={styles.heroCircleBottomSx} />

        <Container maxWidth="lg" sx={styles.heroContainerSx}>
          <Box ref={heroRef} sx={styles.heroContentSx}>
            <Typography variant="h1" fontWeight={800} sx={styles.heroTitleSx}>
              On-Call Pay,{' '}
              <Box component="span" sx={styles.heroTitleAccentSx}>
                Made Simple
              </Box>
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={styles.heroSubtitleSx}>
              CalOohPay automates out-of-hours compensation calculations for engineering teams using
              PagerDuty schedules — saving hours of manual spreadsheet work every month.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={styles.heroActionsSx}>
              <Button
                component={Link}
                href={ROUTES.LOGIN}
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={styles.heroPrimaryButtonSx}
              >
                Get Started Free
              </Button>
              <Button
                component={Link}
                href={ROUTES.DOCUMENTATION}
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                size="large"
                sx={styles.heroSecondaryButtonSx}
              >
                View CLI Tool
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      <Box sx={styles.statsSectionSx}>
        <Container maxWidth="lg">
          <Box ref={statsRef} sx={styles.statsContentSx}>
            {STATS.map(({ Icon, color, value, label }) => (
              <Box key={label} sx={styles.statsItemSx}>
                <Box sx={styles.statsIconWrapSx}>
                  <Icon sx={styles.getStatsIconSx(color)} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    {value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {label}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {FEATURES.map((f, i) => (
        <Box key={f.chip} sx={styles.getFeatureStripeSx(i)}>
          <FeatureSection {...f} />
        </Box>
      ))}

      <Box sx={styles.ctaSectionSx}>
        <Container maxWidth="sm">
          <Box ref={ctaRef} sx={styles.ctaContentSx}>
            <Typography variant="h3" fontWeight={800} mb={2}>
              Ready to save hours every month?
            </Typography>
            <Typography variant="h6" sx={styles.ctaSubtitleSx}>
              Connect your PagerDuty account and generate your first payment report in under a
              minute.
            </Typography>
            <Button
              component={Link}
              href={ROUTES.LOGIN}
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={styles.ctaButtonSx}
            >
              Get Started Free
            </Button>
          </Box>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
