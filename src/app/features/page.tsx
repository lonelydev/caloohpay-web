'use client';

import React, { useEffect, useRef } from 'react';
import { Box, Button, Chip, Container, Paper, Stack, Typography, useTheme } from '@mui/material';
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
import Link from 'next/link';
import { Header, Footer } from '@/components/common';
import { ROUTES } from '@/lib/constants';

// ─── Scroll-reveal hook ─────────────────────────────────────────────────────

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

// ─── Mock screenshot components ─────────────────────────────────────────────

function CalendarMockup() {
  const theme = useTheme();
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
    <Paper
      elevation={3}
      sx={{
        p: 2,
        borderRadius: 3,
        overflow: 'hidden',
        background: theme.palette.background.paper,
        maxWidth: 420,
        width: '100%',
      }}
    >
      {/* Calendar header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1.5,
          px: 0.5,
        }}
      >
        <Typography variant="subtitle1" fontWeight={700}>
          January 2025
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {['‹', '›'].map((ch) => (
            <Box
              key={ch}
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1,
                bgcolor: 'action.hover',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              {ch}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Day labels */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 0.5 }}>
        {days.map((d) => (
          <Typography
            key={d}
            variant="caption"
            align="center"
            sx={{ fontWeight: 600, color: 'text.secondary', py: 0.5 }}
          >
            {d}
          </Typography>
        ))}
      </Box>

      {/* Calendar cells */}
      {weeks.map((week, wi) => (
        <Box key={wi} sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
          {week.map((day, di) => (
            <Box
              key={di}
              sx={{
                height: 36,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: day && highlighted.has(day) ? 700 : 400,
                bgcolor:
                  day && highlighted.has(day)
                    ? 'primary.main'
                    : day === 15
                      ? 'secondary.main'
                      : 'transparent',
                color:
                  day && (highlighted.has(day) || day === 15)
                    ? 'primary.contrastText'
                    : 'text.primary',
                opacity: day ? 1 : 0,
              }}
            >
              {day ?? ''}
            </Box>
          ))}
        </Box>
      ))}

      {/* Legend */}
      <Box sx={{ display: 'flex', gap: 2, mt: 1.5, px: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: 'primary.main' }} />
          <Typography variant="caption" color="text.secondary">
            On-call
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: 'secondary.main' }} />
          <Typography variant="caption" color="text.secondary">
            Today
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

function ListViewMockup() {
  const theme = useTheme();
  const entries = [
    { date: 'Mon 6 Jan', from: '17:30', to: '09:00', hours: '15.5h', pay: '£50.00' },
    { date: 'Fri 10 Jan', from: '17:30', to: '09:00', hours: '15.5h', pay: '£75.00' },
    { date: 'Sat 11 Jan', from: '09:00', to: '09:00', hours: '24h', pay: '£75.00' },
    { date: 'Sun 12 Jan', from: '09:00', to: '17:30', hours: '8.5h', pay: '£75.00' },
  ];

  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        maxWidth: 460,
        width: '100%',
      }}
    >
      {/* Header row */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          px: 2,
          py: 1,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
        }}
      >
        {['Date', 'OOH Hours', 'Duration', 'Pay'].map((h) => (
          <Typography key={h} variant="caption" fontWeight={700}>
            {h}
          </Typography>
        ))}
      </Box>

      {/* Rows */}
      {entries.map((e, i) => (
        <Box
          key={i}
          sx={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            px: 2,
            py: 1.25,
            borderBottom: `1px solid ${theme.palette.divider}`,
            '&:last-child': { borderBottom: 'none' },
            bgcolor: i % 2 === 0 ? 'transparent' : 'action.hover',
          }}
        >
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

      {/* Total row */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          bgcolor: 'action.selected',
        }}
      >
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
  const theme = useTheme();
  const schedules = [
    { name: 'Backend On-Call', oncalls: 8, weekday: '£150', weekend: '£225', total: '£375' },
    { name: 'Platform SRE', oncalls: 5, weekday: '£100', weekend: '£150', total: '£250' },
    { name: 'Frontend Ops', oncalls: 6, weekday: '£100', weekend: '£225', total: '£325' },
    { name: 'Security Team', oncalls: 4, weekday: '£50', weekend: '£150', total: '£200' },
  ];

  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        maxWidth: 520,
        width: '100%',
      }}
    >
      {/* Toolbar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2,
          py: 1.5,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
        }}
      >
        <Typography variant="subtitle2" fontWeight={700}>
          January 2025 — Payment Grid
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: 12 }}>
          <DownloadIcon sx={{ fontSize: 16 }} />
          <Typography variant="caption">Export CSV</Typography>
        </Box>
      </Box>

      {/* Column headers */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
          px: 2,
          py: 0.75,
          bgcolor: 'action.hover',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        {['Schedule', 'On-Calls', 'Weekday', 'Weekend', 'Total'].map((h) => (
          <Typography key={h} variant="caption" fontWeight={600} color="text.secondary">
            {h}
          </Typography>
        ))}
      </Box>

      {/* Schedule rows */}
      {schedules.map((s, i) => (
        <Box
          key={i}
          sx={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
            px: 2,
            py: 1.25,
            borderBottom: `1px solid ${theme.palette.divider}`,
            '&:last-child': { borderBottom: 'none' },
            bgcolor: i % 2 === 0 ? 'transparent' : 'action.hover',
          }}
        >
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
  const theme = useTheme();
  const bars = [
    { month: 'Sep', value: 60, color: 'primary.main' },
    { month: 'Oct', value: 45, color: 'primary.main' },
    { month: 'Nov', value: 80, color: 'primary.main' },
    { month: 'Dec', value: 95, color: 'secondary.main' },
    { month: 'Jan', value: 70, color: 'primary.main' },
  ];

  const donutSegments = [
    { label: 'Weekday', pct: 42, color: theme.palette.primary.main },
    { label: 'Weekend', pct: 58, color: theme.palette.secondary.main },
  ];

  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        maxWidth: 460,
        width: '100%',
        p: 2,
      }}
    >
      <Typography variant="subtitle2" fontWeight={700} mb={2}>
        Payment Analytics
      </Typography>

      {/* Bar chart */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" mb={1} display="block">
          Monthly OOH Pay (£)
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, height: 80 }}>
          {bars.map((b) => (
            <Box
              key={b.month}
              sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}
            >
              <Box
                sx={{
                  width: '100%',
                  height: `${b.value}%`,
                  bgcolor: b.color,
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.8s ease',
                }}
              />
              <Typography variant="caption" color="text.secondary" mt={0.5}>
                {b.month}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Breakdown */}
      <Box sx={{ borderTop: `1px solid ${theme.palette.divider}`, pt: 1.5 }}>
        <Typography variant="caption" color="text.secondary" mb={1} display="block">
          Weekday vs Weekend Split
        </Typography>
        <Box sx={{ display: 'flex', gap: 3 }}>
          {donutSegments.map((s) => (
            <Box key={s.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: s.color }} />
              <Typography variant="caption" fontWeight={600}>
                {s.pct}% {s.label}
              </Typography>
            </Box>
          ))}
        </Box>
        <Box sx={{ mt: 1, height: 8, borderRadius: 4, overflow: 'hidden', display: 'flex' }}>
          {donutSegments.map((s) => (
            <Box key={s.label} sx={{ flex: s.pct, bgcolor: s.color }} />
          ))}
        </Box>
      </Box>
    </Paper>
  );
}

// ─── Feature section ─────────────────────────────────────────────────────────

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
    <Box
      ref={revealRef}
      sx={{
        py: { xs: 8, md: 12 },
        opacity: 0,
        transform: 'translateY(40px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: reverse ? 'row-reverse' : 'row' },
            alignItems: 'center',
            gap: { xs: 5, md: 8 },
          }}
        >
          {/* Text column */}
          <Box sx={{ flex: 1, maxWidth: { md: '44%' } }}>
            <Stack spacing={2.5}>
              <Chip
                icon={<Box sx={{ '& .MuiSvgIcon-root': { fontSize: 16 } }}>{icon}</Box>}
                label={chip}
                color="primary"
                size="small"
                sx={{ alignSelf: 'flex-start', fontWeight: 600 }}
              />
              <Typography variant="h4" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                {title}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                {description}
              </Typography>
              <Stack spacing={1}>
                {bullets.map((b) => (
                  <Box key={b} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        mt: 0.25,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ color: 'primary.contrastText', fontWeight: 700, fontSize: 10 }}
                      >
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

          {/* Mockup column */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: reverse ? 'flex-start' : 'flex-end',
              width: '100%',
            }}
          >
            {mockup}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

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

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      {/* ── Hero ── */}
      <Box
        sx={{
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #0d1117 100%)'
              : 'linear-gradient(135deg, #e8f4fd 0%, #f0f7ff 50%, #e8f0fe 100%)',
          py: { xs: 10, md: 16 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative background circles */}
        <Box
          sx={{
            position: 'absolute',
            top: '-10%',
            right: '-5%',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: (theme) =>
              `radial-gradient(circle, ${theme.palette.primary.main}22 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '-15%',
            left: '-8%',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: (theme) =>
              `radial-gradient(circle, ${theme.palette.secondary.main}18 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Box
            ref={heroRef}
            sx={{
              textAlign: 'center',
              opacity: 0,
              transform: 'translateY(30px)',
              transition: 'opacity 0.8s ease, transform 0.8s ease',
            }}
          >
            <Chip
              label="Powered by PagerDuty"
              color="primary"
              size="small"
              sx={{ mb: 3, fontWeight: 600 }}
            />
            <Typography
              variant="h1"
              fontWeight={800}
              sx={{
                fontSize: { xs: '2.4rem', sm: '3.2rem', md: '4rem' },
                lineHeight: 1.15,
                mb: 3,
              }}
            >
              On-Call Pay,{' '}
              <Box component="span" sx={{ color: 'primary.main' }}>
                Made Simple
              </Box>
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{
                maxWidth: 640,
                mx: 'auto',
                mb: 5,
                lineHeight: 1.7,
                fontSize: { xs: '1rem', md: '1.2rem' },
              }}
            >
              CalOohPay automates out-of-hours compensation calculations for engineering teams using
              PagerDuty schedules — saving hours of manual spreadsheet work every month.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                component={Link}
                href={ROUTES.LOGIN}
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{ px: 4, py: 1.5, borderRadius: 3, fontWeight: 700 }}
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
                sx={{ px: 4, py: 1.5, borderRadius: 3 }}
              >
                View CLI Tool
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* ── Stats bar ── */}
      <Box
        sx={{
          borderTop: '1px solid',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 4,
          bgcolor: 'background.paper',
        }}
      >
        <Container maxWidth="lg">
          <Box
            ref={statsRef}
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-around',
              gap: 3,
              opacity: 0,
              transform: 'translateY(20px)',
              transition: 'opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s',
            }}
          >
            {[
              {
                icon: <ClockIcon sx={{ color: 'primary.main' }} />,
                value: '< 1 min',
                label: 'To generate a full month report',
              },
              {
                icon: <MoneyIcon sx={{ color: 'success.main' }} />,
                value: '£50 / £75',
                label: 'Weekday and weekend OOH rates',
              },
              {
                icon: <GridIcon sx={{ color: 'secondary.main' }} />,
                value: 'Unlimited',
                label: 'Schedules in a single grid report',
              },
              {
                icon: <DownloadIcon sx={{ color: 'primary.main' }} />,
                value: 'CSV Export',
                label: 'Payroll-ready in one click',
              },
            ].map(({ icon, value, label }) => (
              <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ flexShrink: 0 }}>{icon}</Box>
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

      {/* ── Feature sections ── */}
      {features.map((f, i) => (
        <Box
          key={f.chip}
          sx={{
            bgcolor: i % 2 === 0 ? 'background.default' : 'background.paper',
          }}
        >
          <FeatureSection {...f} />
        </Box>
      ))}

      {/* ── CTA ── */}
      <Box
        sx={{
          py: { xs: 10, md: 14 },
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'primary.contrastText',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="sm">
          <Box
            ref={ctaRef}
            sx={{
              opacity: 0,
              transform: 'translateY(30px)',
              transition: 'opacity 0.7s ease, transform 0.7s ease',
            }}
          >
            <Typography variant="h3" fontWeight={800} mb={2}>
              Ready to save hours every month?
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.85, mb: 5, fontWeight: 400 }}>
              Connect your PagerDuty account and generate your first payment report in under a
              minute.
            </Typography>
            <Button
              component={Link}
              href={ROUTES.LOGIN}
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                px: 5,
                py: 1.75,
                borderRadius: 3,
                fontWeight: 700,
                fontSize: '1rem',
                '&:hover': { bgcolor: 'grey.100' },
              }}
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
