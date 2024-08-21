using Abp.Domain.Entities;
using Shesha.Extensions;
using Shesha.Services;
using System;

namespace Shesha.Elmah
{
    /// <summary>
    /// WatchDog extensions
    /// </summary>
    public static class WatchDogExtensions
    {
        public static IDisposable MakeWatchDog<T>(this IEntity<T> entity)
        {
            var errorRef = GetEntityErrorRef(entity);

            var collector = StaticContext.IocManager.Resolve<ILoggingContextCollector>();
            return collector.MakeWatchDog(errorRef.Type, errorRef.Id);
        }

        public static ErrorReference GetEntityErrorRef<T>(this IEntity<T> entity) 
        {
            var id = entity.Id?.ToString();
            var type = entity.GetRealEntityType().FullName;
            return new ErrorReference(type, id);
        }
    }
}
