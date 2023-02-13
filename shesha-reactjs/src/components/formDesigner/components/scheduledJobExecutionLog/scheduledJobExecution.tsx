import dynamic from 'next/dynamic';
import React, { FC, useEffect } from 'react';
import { useScheduledJobExecution } from '../../../../providers';
import { getLogText, IScheduledJobExecutionLogDisplay } from './utils';

const LazyLogImport = () => import('react-lazylog').then(m => m.LazyLog);
const LazyLog = dynamic(LazyLogImport, { ssr: false });

const ScheduledJobExecutionLogDisplay: FC<IScheduledJobExecutionLogDisplay> = ({ hubEvents }) => (
  <div style={{ height: '450px' }}>
    <LazyLog extraLines={0} enableSearch url={null} text={getLogText(hubEvents)} follow={true} />
  </div>
);

const ScheduledJobExecutionLog: FC = ({}) => {
  const { executionLogEvents, getExecutionLogRequest } = useScheduledJobExecution();

  useEffect(() => {
    getExecutionLogRequest();
  }, []);

  return <ScheduledJobExecutionLogDisplay hubEvents={executionLogEvents} />;
};

export default ScheduledJobExecutionLog;
