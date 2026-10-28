using log4net.Appender;
using log4net.Core;
using System;

namespace Shesha.Scheduler.Logging
{
    public class ScheduledJobEventSourceAppender : AppenderSkeleton
    {
        private readonly object _syncRoot;

        public static event EventHandler<ScheduledJobOnLogEventArgs> OnLog;

        public ScheduledJobEventSourceAppender()
        {
            _syncRoot = new object();
        }

        protected override void Append(LoggingEvent loggingEvent)
        {
            EventHandler<ScheduledJobOnLogEventArgs> handler = OnLog;

            if (handler != null)
            {
                lock (_syncRoot)
                {
                    handler(null, new ScheduledJobOnLogEventArgs(loggingEvent));
                }
            }
        }
    }
}
