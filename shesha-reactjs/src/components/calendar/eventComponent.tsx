
import React, { FC, useMemo } from 'react';
import { useFormState, useGlobalState } from '@/providers';
import ShaIcon from '../shaIcon';
import { evaluateString } from '@/formDesignerUtils';
import { getIcon } from './utils';

// Custom Event Component with Icon
export const EventComponent: FC<any> = ({ event }) => {
  const { formData } = useFormState();
  const { globalState } = useGlobalState();

  const icon = useMemo(() => 
    getIcon(event.icon, formData, globalState, event, 'CalendarOutlined'),
    [event.icon, formData, globalState, event]
  );

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
      <span style={{ fontSize: '14px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {evaluateString(event.title, event)}
      </span>
    </div>
  );
};

