using log4net.Core;
using System;

namespace Shesha.Scheduler.Logging
{
    public class ScheduledJobOnLogEventArgs: EventArgs
    {
        public LoggingEvent LoggingEvent { get; private set; }

        public ScheduledJobOnLogEventArgs(LoggingEvent loggingEvent)
        {
            LoggingEvent = loggingEvent;
        }
    }
}
