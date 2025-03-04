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
        public static IDisposable MakeWatchDog<TId>(this IEntity<TId> entity) where TId : notnull
        {
            var errorRef = GetEntityErrorRef(entity);

            var collector = StaticContext.IocManager.Resolve<ILoggingContextCollector>();
            return collector.MakeWatchDog(errorRef.Type, errorRef.Id);
        }

        public static ErrorReference GetEntityErrorRef<TId>(this IEntity<TId> entity) where TId : notnull
        {
            var id = entity.Id.ToString();
            ArgumentException.ThrowIfNullOrWhiteSpace(id, nameof(id));

            var type = entity.GetRealEntityType().GetRequiredFullName();
            return new ErrorReference(type, id);
        }
    }
}
