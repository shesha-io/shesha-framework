using log4net.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
