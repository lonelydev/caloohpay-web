import {
  CalendarMonth as CalendarIcon,
  FormatListBulleted as ListIcon,
  GridView as GridIcon,
  BarChart as ChartIcon,
  AccessTime as ClockIcon,
  AttachMoney as MoneyIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import type { SvgIconComponent } from '@mui/icons-material';
import { CalendarMockup } from '@/components/features/CalendarMockup';
import { ListViewMockup } from '@/components/features/ListViewMockup';
import { GridReportMockup } from '@/components/features/GridReportMockup';
import { AnalyticsMockup } from '@/components/features/AnalyticsMockup';

export interface FeatureItem {
  icon: React.ReactNode;
  chip: string;
  title: string;
  description: string;
  bullets: string[];
  mockup: React.ReactNode;
  reverse?: boolean;
}

export interface StatsItem {
  Icon: SvgIconComponent;
  color: string;
  value: string;
  label: string;
}

export const FEATURES: FeatureItem[] = [
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

export const STATS: StatsItem[] = [
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
