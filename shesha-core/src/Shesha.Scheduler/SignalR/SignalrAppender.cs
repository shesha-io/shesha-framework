using log4net.Appender;
using log4net.Core;
using Microsoft.AspNetCore.SignalR;

namespace Shesha.Scheduler.SignalR
{
    public class SignalrAppender : AppenderSkeleton
    {
        //private readonly List<AllEvents>

        private readonly IHubContext<SignalrAppenderHub> _hub;

        /// <summary>
        /// Name of the signalR group
        /// </summary>
        public readonly string GroupName;

        /// <summary>
        /// Default constructor
        /// </summary>
        /// <param name="hub"></param>
        /// <param name="groupName"></param>
        public SignalrAppender(IHubContext<SignalrAppenderHub> hub, string groupName = null)
        {
            _hub = hub;
            GroupName = groupName;
        }

        /// inheritedDoc
        protected override void Append(LoggingEvent loggingEvent)
        {
            // LoggingEvent may be used beyond the lifetime of the Append()
            // so we must fix any volatile data in the event
            loggingEvent.Fix = FixFlags.All;

            //var formattedEvent = RenderLoggingEvent(loggingEvent);

            if (_hub != null)
            {
                var item = new EventLogItem(loggingEvent);
                /*
                var e = new LogEntry(formattedEvent, loggingEvent);
                var logEventObject = new
                {
                    e.FormattedEvent,
                    Message = e.LoggingEvent.ExceptionObject != null ? e.LoggingEvent.ExceptionObject.Message : e.LoggingEvent.RenderedMessage,
                    Level = e.LoggingEvent.Level.Name,
                    TimeStamp = e.LoggingEvent.TimeStamp.ToString("yyyy-MM-dd HH:mm:ss.fff")
                    //e.LoggingEvent.Domain,
                    //e.LoggingEvent.Identity,
                    //e.LoggingEvent.LocationInformation,
                    //e.LoggingEvent.LoggerName,
                    //e.LoggingEvent.MessageObject,
                    //e.LoggingEvent.Properties,
                    //e.LoggingEvent.ThreadName,
                    //e.LoggingEvent.UserName 
                };
                */

                if (!string.IsNullOrWhiteSpace(GroupName))
                    _hub.Clients.Group(GroupName).SendAsync("LogEvent", item);
                else
                    _hub.Clients.All.SendAsync("LogEvent", item);
            }
        }
    }
}
