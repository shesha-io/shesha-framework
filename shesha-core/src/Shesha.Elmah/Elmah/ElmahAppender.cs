using ElmahCore;
using log4net.Appender;
using log4net.Core;

namespace Shesha.Elmah
{
    /// <summary>
    /// Elmah log4net Appender
    /// </summary>
    public class ElmahAppender: AppenderSkeleton
    {
        protected override void Append(LoggingEvent loggingEvent)
        {
            var exception = loggingEvent.ExceptionObject;

            if (exception == null || loggingEvent.ExceptionObject.IsExceptionLogged())
                return;

            ElmahExtensions.RiseError(exception);
        }
	}
}
