import React from 'react';
import { Tooltip, Chip } from '@mui/material';
import { CalendarMonth as CalendarIcon } from '@mui/icons-material';
import { PagerDutySchedule } from '@/lib/types';
import {
  ScheduleCard as StyledCard,
  ScheduleCardContent,
  CardHeader,
  CardTextContent,
  ScheduleName,
  ScheduleDescription,
  CardSpacer,
} from './ScheduleCard.styles';

interface ScheduleCardProps {
  schedule: PagerDutySchedule;
  onClick: () => void;
}

/**
 * Individual schedule card component with consistent styling and layout.
 * Shows schedule name, description, and timezone with proper text truncation.
 */
const ScheduleCard: React.FC<ScheduleCardProps> = ({ schedule, onClick }) => {
  return (
    <Tooltip title={schedule.name} arrow enterDelay={500} placement="top">
      <StyledCard elevation={2} onClick={onClick} role="article">
        <ScheduleCardContent>
          <CardHeader>
            <CalendarIcon color="primary" sx={{ flexShrink: 0 }} />
            <CardTextContent>
              <ScheduleName>{schedule.name}</ScheduleName>
              {schedule.description && (
                <ScheduleDescription>{schedule.description}</ScheduleDescription>
              )}
            </CardTextContent>
          </CardHeader>

          {/* Spacer to push timezone chip to bottom */}
          <CardSpacer />

          {schedule.time_zone && (
            <Chip
              label={schedule.time_zone}
              size="small"
              variant="outlined"
              sx={{
                alignSelf: 'flex-start',
                maxWidth: '100%',
                '& .MuiChip-label': {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                },
              }}
            />
          )}
        </ScheduleCardContent>
      </StyledCard>
    </Tooltip>
  );
};

export default ScheduleCard;
