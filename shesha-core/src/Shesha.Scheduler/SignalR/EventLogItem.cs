using System;
using log4net.Core;

namespace Shesha.Scheduler.SignalR
{
    /// <summary>
    /// Represents event log item logged by <see cref="SignalrAppender"/>
    /// </summary>
    public class EventLogItem
    {
        /// <summary>
        /// Logged message
        /// </summary>
        public string Message { get; set; }
        
        /// <summary>
        /// Event timestamp
        /// </summary>
        public DateTime TimeStamp { get; set; }

        /// <summary>
        /// Level (info/warn/error)
        /// </summary>
        public string Level { get; set; }

        public EventLogItem()
        {
            
        }

        /// <summary>
        /// Creates new 
        /// </summary>
        /// <param name="loggingEvent"></param>
        public EventLogItem(LoggingEvent loggingEvent)
        {
            Message = loggingEvent.ExceptionObject != null
                ? loggingEvent.ExceptionObject.Message
                : loggingEvent.RenderedMessage;
            
            TimeStamp = loggingEvent.TimeStamp;

            Level = loggingEvent.Level.Name;
        }
    }
}
