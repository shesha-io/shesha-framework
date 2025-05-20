using Abp;
using Abp.Domain.Entities;
using System;

namespace Shesha.Elmah
{
#nullable enable
    /// <summary>
    /// Null implemenhtation of <see cref="ILoggingContextCollector"/>. Is used for optional dependencies
    /// </summary>
    public class NullLoggingContextCollector : ILoggingContextCollector
    {
        public static readonly ILoggingContextCollector Instance = new NullLoggingContextCollector();

        public LoggingContextState CurrentState => new LoggingContextState();

        public IDisposable BeginScope(Action<LoggingContextState>? initAction = null)
        {
            return NewEmptyAction();
        }

        public IDisposable MakeEntityWatchDog<TId>(IEntity<TId> entity) where TId : notnull
        {
            return NewEmptyAction();
        }

        public IDisposable MakeWatchDog(string type, string id)
        {
            return NewEmptyAction();
        }

        public IDisposable MakeWatchDog(ErrorReference errorRef)
        {
            return NewEmptyAction();
        }

        public IDisposable SetLocationScope(string location)
        {
            return NewEmptyAction();
        }

        private IDisposable NewEmptyAction()
        {
            return new DisposeAction(() => {
                // empty action
            });
        }
    }
#nullable restore
}
