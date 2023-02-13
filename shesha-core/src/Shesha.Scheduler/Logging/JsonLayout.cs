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
                Level = e.Level.DisplayName,
                Message = e.RenderedMessage,
                TimeStamp = e.TimeStamp.ToUniversalTime()
            };
            writer.WriteLine(JsonConvert.SerializeObject(@event) + ",");
            /*
            var dic = new Dictionary<string, object>
            {
                ["processSessionId"] = ProcessSessionId,
                ["level"] = e.Level.DisplayName,
                ["messageObject"] = e.MessageObject,
                ["renderedMessage"] = e.RenderedMessage,
                ["timestampUtc"] = e.TimeStamp.ToUniversalTime().ToString("O"),
                ["logger"] = e.LoggerName,
                ["thread"] = e.ThreadName,
                ["exceptionObject"] = e.ExceptionObject,
                ["exceptionObjectString"] = e.ExceptionObject == null ? null : e.GetExceptionString(),
                ["userName"] = e.UserName,
                ["domain"] = e.Domain,
                ["identity"] = e.Identity,
                ["location"] = e.LocationInformation.FullInfo,
                ["pid"] = ProcessId,
                ["machineName"] = MachineName,
                ["workingSet"] = Environment.WorkingSet,
                ["osVersion"] = Environment.OSVersion.ToString(),
                ["is64bitOS"] = Environment.Is64BitOperatingSystem,
                ["is64bitProcess"] = Environment.Is64BitProcess,
                ["properties"] = e.GetProperties()
            };
            writer.WriteLine(JsonConvert.SerializeObject(dic));
            */
        }
    }
}