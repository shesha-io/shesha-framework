import React, { FC } from 'react';
import { LogViewer } from '@/components/logViewer';
import { useProcessLogEvents } from '@/providers/processMonitor/hooks';

export const LogViewerRenderer: FC = ({ }) => {
  const events = useProcessLogEvents();

  return (
    <div style={{ height: '600px' }}>
      <LogViewer logs={events} showHeader={false} />
    </div>
  );
};

