using Abp.Domain.Entities;
using System;

namespace Shesha.Elmah
{
    public interface ILoggingContextCollector
    {
        /// <summary>
        /// Make a watchdog for entity to link all unhandled exception to a specified entity
        /// </summary>
        IDisposable MakeEntityWatchDog<TId>(IEntity<TId> entity) where TId : notnull;

        IDisposable MakeWatchDog(string type, string id);
        IDisposable MakeWatchDog(ErrorReference errorRef);

        /// <summary>
        /// Current error reference
        /// </summary>
        /// <returns></returns>
        LoggingContextState CurrentState { get; }

        /// <summary>
        /// Begin collector scope. Should be used on the top level only
        /// </summary>
        /// <param name="initAction"></param>
        /// <returns></returns>
        IDisposable BeginScope(Action<LoggingContextState>? initAction = null);

        /// <summary>
        /// Specify location scope, is used to collect user-friendly locations of unhandled exceptions
        /// </summary>
        /// <param name="location"></param>
        /// <returns></returns>
        IDisposable SetLocationScope(string location);
    }
}
