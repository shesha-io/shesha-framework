using Abp;
using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Runtime;
using Shesha.Elmah.Exceptions;
using System;
using System.Linq;

namespace Shesha.Elmah
{
    public class LoggingContextCollector : ILoggingContextCollector, ITransientDependency
    {
        private const string ScopeKey = "sha-log-collector";
        private readonly IAmbientScopeProvider<LoggingContextState> _scopeProvider;

        public LoggingContextCollector(IAmbientScopeProvider<LoggingContextState> scopeProvider)
        {
            _scopeProvider = scopeProvider;
        }

        // todo: add methods for state manipulation

        public LoggingContextState CurrentState => _scopeProvider.GetValue(ScopeKey);

        public IDisposable MakeEntityWatchDog<TId>(IEntity<TId> entity)
        {
            var errorRef = WatchDogExtensions.GetEntityErrorRef(entity);
            return MakeWatchDog(errorRef.Type, errorRef.Id);
        }

        public IDisposable MakeWatchDog(ErrorReference errorRef) 
        {
            // todo: register watchdog in the list and check uncompleted ones on finish if the context
            var state = CurrentState;

            var watchDog = new ExceptionWatchDog((exception) => {
                state.AllExceptions.Add(new ExceptionDetails
                {
                    Exception = exception,
                    ErrorReference = errorRef,
                });
            });

            state.ActiveWatchDogs.Add(watchDog);
            watchDog.CleanupAction = () =>
            {
                state.ActiveWatchDogs.TryRemove(watchDog);
            };

            return watchDog;
        }        

        public IDisposable MakeWatchDog(string type, string id)
        {
            return MakeWatchDog(new ErrorReference(type, id));
        }

        /// inheritedDoc
        public IDisposable BeginScope(Action<LoggingContextState> initAction = null)
        {
            var state = new LoggingContextState();
            initAction?.Invoke(state);

            var scope = _scopeProvider.BeginScope(ScopeKey, state);
            return new DisposeAction(() => 
            {
                var uncompletedWatchDogs = state.ActiveWatchDogs.ToList();
                var hasUncompleted = uncompletedWatchDogs.Any();
                foreach (var watchDog in uncompletedWatchDogs)
                    watchDog.Dispose();
                scope.Dispose();

                if (hasUncompleted)
                    throw new WatchDogCleanupException();
            });
        }
    }
}
