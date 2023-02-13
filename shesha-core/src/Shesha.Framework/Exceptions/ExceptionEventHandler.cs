using Abp.Dependency;
using Abp.Events.Bus.Exceptions;
using Abp.Events.Bus.Handlers;
using Abp.Logging;

namespace Shesha.Exceptions
{
    /// <summary>
    /// Exception event handler
    /// </summary>
    public class ExceptionEventHandler : IEventHandler<AbpHandledExceptionData>, ITransientDependency
    {
        public void HandleEvent(AbpHandledExceptionData eventData)
        {
            // log exception
            var severity = eventData.Exception.GetLogSeverity();
            if (severity == LogSeverity.Error || severity == LogSeverity.Fatal) 
            {
                eventData.Exception.LogError();
            }
        }
    }
}
