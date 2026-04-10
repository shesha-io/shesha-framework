using System.IO;
using log4net.Core;
using log4net.Layout;
using Newtonsoft.Json;
using Shesha.Scheduler.SignalR;

namespace Shesha.Scheduler.Logging
{
    /// <summary>
    /// Json layout for scheduled jobs logging
    /// </summary>
    public class JsonLayout : LayoutSkeleton
    {
        /// inheritedDoc
        public override void ActivateOptions()
        {
        }

        /// inheritedDoc
        public override void Format(TextWriter writer, LoggingEvent e)
        {
            var @event = new EventLogItem
            {
                Level = (e.Level ?? Level.Info).DisplayName,
                Message = e.RenderedMessage ?? "",
                TimeStamp = e.TimeStamp.ToUniversalTime()
            };
            writer.WriteLine(JsonConvert.SerializeObject(@event) + ",");
        }
    }
}