using Abp.Dependency;
using Abp.Events.Bus.Exceptions;
using Abp.Events.Bus.Handlers;
using Abp.Logging;
using ElmahCore;
using Shesha.Exceptions;

namespace Shesha.Elmah
{
    /// <summary>
    /// Handles all exceptions handled by Abp and logs them using Elmah
    /// </summary>
    public class ElmahExceptionsHandler : IEventHandler<AbpHandledExceptionData>, ITransientDependency
    {
        /// inheritDoc
        public void HandleEvent(AbpHandledExceptionData eventData)
        {
            if (eventData.Exception != null && !eventData.Exception.IsExceptionLogged())
            {
                var severity = eventData.Exception.GetLogSeverity();
                if (severity == LogSeverity.Error || severity == LogSeverity.Fatal) 
                {
                    ElmahExtensions.RaiseError(eventData.Exception);
                    //eventData.Exception.MarkExceptionAsLogged();
                }
            }
        }
    }
}
