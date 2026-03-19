'use client';

import React, { useEffect, useRef } from 'react';
import { Box, Button, Chip, Container, Paper, Stack, Typography } from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  FormatListBulleted as ListIcon,
  GridView as GridIcon,
  BarChart as ChartIcon,
  ArrowForward as ArrowForwardIcon,
  AccessTime as ClockIcon,
  AttachMoney as MoneyIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import type { SvgIconComponent } from '@mui/icons-material';
import Link from 'next/link';
import { Header, Footer } from '@/components/common';
import { ROUTES } from '@/lib/constants';
import * as styles from './page.styles';

function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          observer.unobserve(el);
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

function CalendarMockup() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeks = [
    [null, null, 1, 2, 3, 4, 5],
    [6, 7, 8, 9, 10, 11, 12],
    [13, 14, 15, 16, 17, 18, 19],
    [20, 21, 22, 23, 24, 25, 26],
    [27, 28, 29, 30, 31, null, null],
  ];
  const highlighted = new Set([8, 9, 10, 14, 15, 16, 17, 22, 23]);

  return (
    <Paper elevation={3} sx={styles.calendarPaperSx}>
      <Box sx={styles.calendarHeaderSx}>
        <Typography variant="subtitle1" fontWeight={700}>
          January 2025
        </Typography>
        <Box sx={styles.calendarNavSx}>
          {['‹', '›'].map((ch) => (
            <Box key={ch} sx={styles.calendarNavButtonSx}>
              {ch}
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={styles.calendarDayLabelsSx}>
        {days.map((d) => (
          <Typography key={d} variant="caption" align="center" sx={styles.calendarDayLabelTextSx}>
            {d}
          </Typography>
        ))}
      </Box>

      {weeks.map((week, wi) => (
        <Box key={wi} sx={styles.calendarWeekRowSx}>
          {week.map((day, di) => (
            <Box key={di} sx={styles.getCalendarDayCellSx(day, highlighted)}>
              {day ?? ''}
            </Box>
          ))}
        </Box>
      ))}

      <Box sx={styles.calendarLegendSx}>
        <Box sx={styles.calendarLegendItemSx}>
          <Box sx={styles.onCallLegendDotSx} />
          <Typography variant="caption" color="text.secondary">
            On-call
          </Typography>
        </Box>
        <Box sx={styles.calendarLegendItemSx}>
          <Box sx={styles.todayLegendDotSx} />
          <Typography variant="caption" color="text.secondary">
            Today
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

function ListViewMockup() {
  const entries = [
    { date: 'Mon 6 Jan', from: '17:30', to: '09:00', hours: '15.5h', pay: '£50.00' },
    { date: 'Fri 10 Jan', from: '17:30', to: '09:00', hours: '15.5h', pay: '£75.00' },
    { date: 'Sat 11 Jan', from: '09:00', to: '09:00', hours: '24h', pay: '£75.00' },
    { date: 'Sun 12 Jan', from: '09:00', to: '17:30', hours: '8.5h', pay: '£75.00' },
  ];

  return (
    <Paper elevation={3} sx={styles.listPaperSx}>
      <Box sx={styles.listHeaderRowSx}>
        {['Date', 'OOH Hours', 'Duration', 'Pay'].map((h) => (
          <Typography key={h} variant="caption" fontWeight={700}>
            {h}
          </Typography>
        ))}
      </Box>

      {entries.map((e, i) => (
        <Box key={e.date} sx={styles.getListEntryRowSx(i)}>
          <Typography variant="body2" fontWeight={500}>
            {e.date}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {e.from}–{e.to}
          </Typography>
          <Typography variant="body2">{e.hours}</Typography>
          <Typography variant="body2" fontWeight={700} color="success.main">
            {e.pay}
          </Typography>
        </Box>
      ))}

      <Box sx={styles.listTotalRowSx}>
        <Typography variant="body2" fontWeight={700}>
          Total
        </Typography>
        <Typography variant="body2" fontWeight={700} color="success.main">
          £275.00
        </Typography>
      </Box>
    </Paper>
  );
}

function GridReportMockup() {
  const schedules = [
    { name: 'Backend On-Call', oncalls: 8, weekday: '£150', weekend: '£225', total: '£375' },
    { name: 'Platform SRE', oncalls: 5, weekday: '£100', weekend: '£150', total: '£250' },
    { name: 'Frontend Ops', oncalls: 6, weekday: '£100', weekend: '£225', total: '£325' },
    { name: 'Security Team', oncalls: 4, weekday: '£50', weekend: '£150', total: '£200' },
  ];

  return (
    <Paper elevation={3} sx={styles.gridPaperSx}>
      <Box sx={styles.gridToolbarSx}>
        <Typography variant="subtitle2" fontWeight={700}>
          January 2025 — Payment Grid
        </Typography>
        <Box sx={styles.gridToolbarExportSx}>
          <DownloadIcon sx={styles.gridToolbarIconSx} />
          <Typography variant="caption">Export CSV</Typography>
        </Box>
      </Box>

      <Box sx={styles.gridHeaderRowSx}>
        {['Schedule', 'On-Calls', 'Weekday', 'Weekend', 'Total'].map((h) => (
          <Typography key={h} variant="caption" fontWeight={600} color="text.secondary">
            {h}
          </Typography>
        ))}
      </Box>

      {schedules.map((s, i) => (
        <Box key={s.name} sx={styles.getGridEntryRowSx(i)}>
          <Typography variant="body2" fontWeight={500} noWrap>
            {s.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {s.oncalls}
          </Typography>
          <Typography variant="body2">{s.weekday}</Typography>
          <Typography variant="body2">{s.weekend}</Typography>
          <Typography variant="body2" fontWeight={700} color="success.main">
            {s.total}
          </Typography>
        </Box>
      ))}
    </Paper>
  );
}

function AnalyticsMockup() {
  const bars = [
    { month: 'Sep', value: 60, color: 'primary.main' },
    { month: 'Oct', value: 45, color: 'primary.main' },
    { month: 'Nov', value: 80, color: 'primary.main' },
    { month: 'Dec', value: 95, color: 'secondary.main' },
    { month: 'Jan', value: 70, color: 'primary.main' },
  ];

  const donutSegments = [
    { label: 'Weekday', pct: 42, color: 'primary.main' },
    { label: 'Weekend', pct: 58, color: 'secondary.main' },
  ];

  return (
    <Paper elevation={3} sx={styles.analyticsPaperSx}>
      <Typography variant="subtitle2" fontWeight={700} mb={2}>
        Payment Analytics
      </Typography>

      <Box sx={styles.analyticsBarChartWrapSx}>
        <Typography variant="caption" color="text.secondary" mb={1} display="block">
          Monthly OOH Pay (£)
        </Typography>
        <Box sx={styles.analyticsBarsRowSx}>
          {bars.map((b) => (
            <Box key={b.month} sx={styles.analyticsBarItemSx}>
              <Box sx={styles.getAnalyticsBarSx(b.color, b.value)} />
              <Typography variant="caption" color="text.secondary" mt={0.5}>
                {b.month}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={styles.analyticsBreakdownSx}>
        <Typography variant="caption" color="text.secondary" mb={1} display="block">
          Weekday vs Weekend Split
        </Typography>
        <Box sx={styles.analyticsLegendRowSx}>
          {donutSegments.map((s) => (
            <Box key={s.label} sx={styles.analyticsLegendItemSx}>
              <Box sx={styles.getAnalyticsLegendDotSx(s.color)} />
              <Typography variant="caption" fontWeight={600}>
                {s.pct}% {s.label}
              </Typography>
            </Box>
          ))}
        </Box>
        <Box sx={styles.analyticsSplitBarSx}>
          {donutSegments.map((s) => (
            <Box key={s.label} sx={styles.getAnalyticsSplitSegmentSx(s.pct, s.color)} />
          ))}
        </Box>
      </Box>
    </Paper>
  );
}

interface FeatureSectionProps {
  icon: React.ReactNode;
  chip: string;
  title: string;
  description: string;
  bullets: string[];
  mockup: React.ReactNode;
  reverse?: boolean;
}

function FeatureSection({
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

interface StatsItem {
  Icon: SvgIconComponent;
  color: string;
  value: string;
  label: string;
}

export default function FeaturesPage() {
  const heroRef = useScrollReveal<HTMLDivElement>();
  const statsRef = useScrollReveal<HTMLDivElement>();
  const ctaRef = useScrollReveal<HTMLDivElement>();

  const features = [
    {
      icon: <CalendarIcon />,
      chip: 'Calendar View',
      title: 'Visualise On-Call Schedules at a Glance',
      description:
        'Browse your PagerDuty on-call schedules in an interactive monthly calendar. Instantly see who is on-call on any given day, navigate between months, and identify your out-of-hours periods — all with full timezone support.',
      bullets: [
        'Monthly calendar view with highlighted on-call days',
        'Navigate forward and back through months effortlessly',
        'Timezone-aware rendering for distributed teams',
        'Colour-coded to distinguish weekday and weekend shifts',
      ],
      mockup: <CalendarMockup />,
      reverse: false,
    },
    {
      icon: <ListIcon />,
      chip: 'List View',
      title: 'Detailed Breakdown of Every On-Call Period',
      description:
        'Switch to the list view for a granular look at each out-of-hours period. See exact start and end times, total OOH hours, and the calculated payment for each shift — weekday at £50, weekend at £75.',
      bullets: [
        'Line-by-line record of every OOH period',
        'Automatic weekday / weekend rate application',
        'Running total and per-entry payment amounts',
        'Minimum 6-hour OOH threshold enforced automatically',
      ],
      mockup: <ListViewMockup />,
      reverse: true,
    },
    {
      icon: <GridIcon />,
      chip: 'Multi-Schedule Grid',
      title: 'Cross-Team Payment Reports in One View',
      description:
        'The payment grid lets admins select multiple PagerDuty schedules and generate a single consolidated report. Compare compensation across teams for any month and export to CSV for payroll in one click.',
      bullets: [
        'Select any combination of schedules',
        'Side-by-side weekday / weekend / total columns',
        'One-click CSV export — Google Sheets compatible',
        'Ideal for engineering managers and finance teams',
      ],
      mockup: <GridReportMockup />,
      reverse: false,
    },
    {
      icon: <ChartIcon />,
      chip: 'Analytics',
      title: 'Insights Into On-Call Trends',
      description:
        'The analytics view surfaces month-over-month payment trends, weekday vs weekend splits, and per-responder breakdowns. Spot patterns, balance workloads, and make data-driven decisions about on-call rotation.',
      bullets: [
        'Monthly payment bar charts',
        'Weekday vs weekend payment proportion',
        'Per-user on-call hours and compensation breakdown',
        'Exportable analytics data for reporting',
      ],
      mockup: <AnalyticsMockup />,
      reverse: true,
    },
  ];

  const stats: StatsItem[] = [
    {
      Icon: ClockIcon,
      color: 'primary.main',
      value: '< 1 min',
      label: 'To generate a full month report',
    },
    {
      Icon: MoneyIcon,
      color: 'success.main',
      value: '£50 / £75',
      label: 'Weekday and weekend OOH rates',
    },
    {
      Icon: GridIcon,
      color: 'secondary.main',
      value: 'Unlimited',
      label: 'Schedules in a single grid report',
    },
    {
      Icon: DownloadIcon,
      color: 'primary.main',
      value: 'CSV Export',
      label: 'Payroll-ready in one click',
    },
  ];

  return (
    <Box sx={styles.pageRootSx}>
      <Header />

      <Box sx={styles.heroSectionSx}>
        <Box sx={styles.heroCircleTopSx} />
        <Box sx={styles.heroCircleBottomSx} />

        <Container maxWidth="lg" sx={styles.heroContainerSx}>
          <Box ref={heroRef} sx={styles.heroContentSx}>
            <Chip
              label="Powered by PagerDuty"
              color="primary"
              size="small"
              sx={styles.heroChipSx}
            />
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
            {stats.map(({ Icon, color, value, label }) => (
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

      {features.map((f, i) => (
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
