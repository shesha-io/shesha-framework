using System;
using Abp.Logging;
using Castle.Core.Logging;
using Shesha.Services;

namespace Shesha.Exceptions
{
    /// <summary>
    /// Exception extensions
    /// </summary>
    public static class ExceptionExtensions
    {
        /// <summary>
        /// Returns error message text including messages from the inner exceptions
        /// </summary>
        public static string FullMessage(this Exception e)
        {
            var result = e.Message ?? "none";
            if (e.InnerException != null)
                result += "\r\nInner Exception: " + e.InnerException.FullMessage();

            return result;
        }

        /// <summary>
        /// Logs error using current logger configuration
        /// </summary>
        /// <param name="e"></param>
        public static void LogError(this Exception e)
        {
            var logger = StaticContext.IocManager.Resolve<ILogger>();
            logger?.Error(e.Message, e);
        }

        /// <summary>
        /// Get exception log severity
        /// </summary>
        public static LogSeverity GetLogSeverity(this Exception exception, LogSeverity defaultSeverity = LogSeverity.Error)
        {
            return exception is IHasLogSeverity exceptinWithSeverity
                    ? exceptinWithSeverity.Severity
                    : defaultSeverity;
        }
    }
}
