using log4net.Appender;
using log4net.Core;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace Shesha.Scheduler.SignalR
{
    public class SignalrAppender : AppenderSkeleton
    {
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

                var task = Task.Run(async () =>
                {
                    if (!string.IsNullOrWhiteSpace(GroupName))
                        await _hub.Clients.Group(GroupName).SendAsync("LogEvent", item);
                    else
                        await _hub.Clients.All.SendAsync("LogEvent", item);
                });                
            }
        }
    }
}