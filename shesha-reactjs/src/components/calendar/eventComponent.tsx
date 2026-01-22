
import React, { FC } from 'react';
import { useActualContextExecution } from '@/hooks';
import ShaIcon from '../shaIcon';
import { IEventComponentProps } from './interfaces';

// Custom Event Component with Icon
export const EventComponent: FC<IEventComponentProps> = ({ event }) => {
  const icon = useActualContextExecution(event.icon, { item: event }, 'CalendarOutlined');

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        height: '20px',
        padding: '2px 4px',
      }}
    >
      {event.showIcon && (
        <span style={{ fontSize: '14px' }}>
          <ShaIcon
            readOnly={true}
            iconName={icon}
            style={{ color: event.iconColor }}
          />
        </span>
      )}
      <span style={{ fontSize: '14px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {event.title}
      </span>
    </div>
  );
};

