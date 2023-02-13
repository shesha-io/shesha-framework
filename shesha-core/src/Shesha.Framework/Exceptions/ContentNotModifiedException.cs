using Abp;
using Abp.Logging;
using System;

namespace Shesha.Exceptions
{
    /// <summary>
    /// Exception that indicated that the content was not modified. Is used for client-side caching
    /// </summary>
    public class ContentNotModifiedException : AbpException, IHasLogSeverity, IHasErrorCode
    {
        /// <summary>
        /// Default log severity
        /// </summary>
        public static LogSeverity DefaultLogSeverity = LogSeverity.Debug;

        public ContentNotModifiedException(string message) : base(message)
        {
        }

        public LogSeverity Severity { get; set; } = DefaultLogSeverity;
        public int Code { get; set; } = 304;
    }
}
