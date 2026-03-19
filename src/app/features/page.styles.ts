import type { SxProps, Theme } from '@mui/material/styles';

export const pageRootSx: SxProps<Theme> = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
};

export const scrollRevealInitialSx: SxProps<Theme> = {
  opacity: 0,
};

export const calendarPaperSx: SxProps<Theme> = {
  p: 2,
  borderRadius: 3,
  overflow: 'hidden',
  background: 'background.paper',
  maxWidth: 420,
  width: '100%',
};

export const calendarHeaderSx: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  mb: 1.5,
  px: 0.5,
};

export const calendarNavSx: SxProps<Theme> = {
  display: 'flex',
  gap: 0.5,
};

export const calendarNavButtonSx: SxProps<Theme> = {
  width: 28,
  height: 28,
  borderRadius: 1,
  bgcolor: 'action.hover',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 14,
  cursor: 'pointer',
};

export const calendarDayLabelsSx: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  mb: 0.5,
};

export const calendarDayLabelTextSx: SxProps<Theme> = {
  fontWeight: 600,
  color: 'text.secondary',
  py: 0.5,
};

export const calendarWeekRowSx: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: '2px',
};

export function getCalendarDayCellSx(day: number | null, highlighted: Set<number>): SxProps<Theme> {
  return {
    height: 36,
    borderRadius: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: day && highlighted.has(day) ? 700 : 400,
    bgcolor:
      day && highlighted.has(day) ? 'primary.main' : day === 15 ? 'secondary.main' : 'transparent',
    color: day && (highlighted.has(day) || day === 15) ? 'primary.contrastText' : 'text.primary',
    opacity: day ? 1 : 0,
  };
}

export const calendarLegendSx: SxProps<Theme> = {
  display: 'flex',
  gap: 2,
  mt: 1.5,
  px: 0.5,
};

export const calendarLegendItemSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
};

export const onCallLegendDotSx: SxProps<Theme> = {
  width: 12,
  height: 12,
  borderRadius: 0.5,
  bgcolor: 'primary.main',
};

export const todayLegendDotSx: SxProps<Theme> = {
  width: 12,
  height: 12,
  borderRadius: 0.5,
  bgcolor: 'secondary.main',
};

export const listPaperSx: SxProps<Theme> = {
  borderRadius: 3,
  overflow: 'hidden',
  maxWidth: 460,
  width: '100%',
};

export const listHeaderRowSx: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr 1fr 1fr',
  px: 2,
  py: 1,
  bgcolor: 'primary.main',
  color: 'primary.contrastText',
};

export function getListEntryRowSx(index: number): SxProps<Theme> {
  return {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr',
    px: 2,
    py: 1.25,
    borderBottom: '1px solid',
    borderColor: 'divider',
    '&:last-child': { borderBottom: 'none' },
    bgcolor: index % 2 === 0 ? 'transparent' : 'action.hover',
  };
}

export const listTotalRowSx: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'space-between',
  px: 2,
  py: 1.5,
  bgcolor: 'action.selected',
};

export const gridPaperSx: SxProps<Theme> = {
  borderRadius: 3,
  overflow: 'hidden',
  maxWidth: 520,
  width: '100%',
};

export const gridToolbarSx: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  px: 2,
  py: 1.5,
  bgcolor: 'primary.main',
  color: 'primary.contrastText',
};

export const gridToolbarExportSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
  fontSize: 12,
};

export const gridToolbarIconSx: SxProps<Theme> = {
  fontSize: 16,
};

export const gridHeaderRowSx: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
  px: 2,
  py: 0.75,
  bgcolor: 'action.hover',
  borderBottom: '1px solid',
  borderColor: 'divider',
};

export function getGridEntryRowSx(index: number): SxProps<Theme> {
  return {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
    px: 2,
    py: 1.25,
    borderBottom: '1px solid',
    borderColor: 'divider',
    '&:last-child': { borderBottom: 'none' },
    bgcolor: index % 2 === 0 ? 'transparent' : 'action.hover',
  };
}

export const analyticsPaperSx: SxProps<Theme> = {
  borderRadius: 3,
  overflow: 'hidden',
  maxWidth: 460,
  width: '100%',
  p: 2,
};

export const analyticsBarChartWrapSx: SxProps<Theme> = {
  mb: 2,
};

export const analyticsBarsRowSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'flex-end',
  gap: 1.5,
  height: 80,
};

export const analyticsBarItemSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flex: 1,
};

export function getAnalyticsBarSx(color: string, value: number): SxProps<Theme> {
  return {
    width: '100%',
    height: `${value}%`,
    bgcolor: color,
    borderRadius: '4px 4px 0 0',
    transition: 'height 0.8s ease',
  };
}

export const analyticsBreakdownSx: SxProps<Theme> = {
  borderTop: '1px solid',
  borderColor: 'divider',
  pt: 1.5,
};

export const analyticsLegendRowSx: SxProps<Theme> = {
  display: 'flex',
  gap: 3,
};

export const analyticsLegendItemSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.75,
};

export function getAnalyticsLegendDotSx(color: string): SxProps<Theme> {
  return {
    width: 12,
    height: 12,
    borderRadius: '50%',
    bgcolor: color,
  };
}

export const analyticsSplitBarSx: SxProps<Theme> = {
  mt: 1,
  height: 8,
  borderRadius: 4,
  overflow: 'hidden',
  display: 'flex',
};

export function getAnalyticsSplitSegmentSx(pct: number, color: string): SxProps<Theme> {
  return {
    flex: pct,
    bgcolor: color,
  };
}

export const featureSectionRootSx: SxProps<Theme> = {
  py: { xs: 8, md: 12 },
  opacity: 0,
  transform: 'translateY(40px)',
  transition: 'opacity 0.7s ease, transform 0.7s ease',
};

export function getFeatureSectionContentSx(reverse?: boolean): SxProps<Theme> {
  return {
    display: 'flex',
    flexDirection: { xs: 'column', md: reverse ? 'row-reverse' : 'row' },
    alignItems: 'center',
    gap: { xs: 5, md: 8 },
  };
}

export const featureTextColumnSx: SxProps<Theme> = {
  flex: 1,
  maxWidth: { md: '44%' },
};

export const featureChipSx: SxProps<Theme> = {
  alignSelf: 'flex-start',
  fontWeight: 600,
};

export const featureChipIconWrapSx: SxProps<Theme> = {
  '& .MuiSvgIcon-root': { fontSize: 16 },
};

export const featureTitleSx: SxProps<Theme> = {
  lineHeight: 1.2,
};

export const featureDescriptionSx: SxProps<Theme> = {
  lineHeight: 1.75,
};

export const featureBulletRowSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 1,
};

export const featureBulletCheckWrapSx: SxProps<Theme> = {
  width: 20,
  height: 20,
  borderRadius: '50%',
  bgcolor: 'primary.main',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  mt: 0.25,
};

export const featureBulletCheckSx: SxProps<Theme> = {
  color: 'primary.contrastText',
  fontWeight: 700,
  fontSize: 10,
};

export function getFeatureMockupColumnSx(reverse?: boolean): SxProps<Theme> {
  return {
    flex: 1,
    display: 'flex',
    justifyContent: reverse ? 'flex-start' : 'flex-end',
    width: '100%',
  };
}

export const heroSectionSx: SxProps<Theme> = {
  background: (theme) =>
    theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #0d1117 100%)'
      : 'linear-gradient(135deg, #e8f4fd 0%, #f0f7ff 50%, #e8f0fe 100%)',
  py: { xs: 10, md: 16 },
  position: 'relative',
  overflow: 'hidden',
};

export const heroCircleTopSx: SxProps<Theme> = {
  position: 'absolute',
  top: '-10%',
  right: '-5%',
  width: 400,
  height: 400,
  borderRadius: '50%',
  background: (theme) =>
    `radial-gradient(circle, ${theme.palette.primary.main}22 0%, transparent 70%)`,
  pointerEvents: 'none',
};

export const heroCircleBottomSx: SxProps<Theme> = {
  position: 'absolute',
  bottom: '-15%',
  left: '-8%',
  width: 500,
  height: 500,
  borderRadius: '50%',
  background: (theme) =>
    `radial-gradient(circle, ${theme.palette.secondary.main}18 0%, transparent 70%)`,
  pointerEvents: 'none',
};

export const heroContainerSx: SxProps<Theme> = {
  position: 'relative',
};

export const heroContentSx: SxProps<Theme> = {
  textAlign: 'center',
  opacity: 0,
  transform: 'translateY(30px)',
  transition: 'opacity 0.8s ease, transform 0.8s ease',
};

export const heroChipSx: SxProps<Theme> = {
  mb: 3,
  fontWeight: 600,
};

export const heroTitleSx: SxProps<Theme> = {
  fontSize: { xs: '2.4rem', sm: '3.2rem', md: '4rem' },
  lineHeight: 1.15,
  mb: 3,
};

export const heroTitleAccentSx: SxProps<Theme> = {
  color: 'primary.main',
};

export const heroSubtitleSx: SxProps<Theme> = {
  maxWidth: 640,
  mx: 'auto',
  mb: 5,
  lineHeight: 1.7,
  fontSize: { xs: '1rem', md: '1.2rem' },
};

export const heroActionsSx: SxProps<Theme> = {
  justifyContent: 'center',
};

export const heroPrimaryButtonSx: SxProps<Theme> = {
  px: 4,
  py: 1.5,
  borderRadius: 3,
  fontWeight: 700,
};

export const heroSecondaryButtonSx: SxProps<Theme> = {
  px: 4,
  py: 1.5,
  borderRadius: 3,
};

export const statsSectionSx: SxProps<Theme> = {
  borderTop: '1px solid',
  borderBottom: '1px solid',
  borderColor: 'divider',
  py: 4,
  bgcolor: 'background.paper',
};

export const statsContentSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: { xs: 'column', sm: 'row' },
  justifyContent: 'space-around',
  gap: 3,
  opacity: 0,
  transform: 'translateY(20px)',
  transition: 'opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s',
};

export const statsItemSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
};

export const statsIconWrapSx: SxProps<Theme> = {
  flexShrink: 0,
};

export function getStatsIconSx(color: string): SxProps<Theme> {
  return {
    color,
  };
}

export function getFeatureStripeSx(index: number): SxProps<Theme> {
  return {
    bgcolor: index % 2 === 0 ? 'background.default' : 'background.paper',
  };
}

export const ctaSectionSx: SxProps<Theme> = {
  py: { xs: 10, md: 14 },
  background: (theme) =>
    `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: 'primary.contrastText',
  textAlign: 'center',
};

export const ctaContentSx: SxProps<Theme> = {
  opacity: 0,
  transform: 'translateY(30px)',
  transition: 'opacity 0.7s ease, transform 0.7s ease',
};

export const ctaSubtitleSx: SxProps<Theme> = {
  opacity: 0.85,
  mb: 5,
  fontWeight: 400,
};

export const ctaButtonSx: SxProps<Theme> = {
  bgcolor: 'white',
  color: 'primary.main',
  px: 5,
  py: 1.75,
  borderRadius: 3,
  fontWeight: 700,
  fontSize: '1rem',
  '&:hover': { bgcolor: 'grey.100' },
};
