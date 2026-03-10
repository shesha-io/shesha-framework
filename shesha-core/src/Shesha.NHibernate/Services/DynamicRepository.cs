using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Uow;
using NHibernate;
using Shesha.Configuration.Runtime;
using Shesha.Domain.Attributes;
using Shesha.Extensions;
using Shesha.NHibernate.Repositories;
using Shesha.NHibernate.Session;
using Shesha.Reflection;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace Shesha.Services
{
    /// <summary>
    /// Dynamic repository
    /// </summary>
    public class DynamicRepository : IDynamicRepository, ITransientDependency
    {
        private readonly IEntityTypeConfigurationStore _entityConfigurationStore;
        private readonly INhCurrentSessionContext _currentSessionContext;

        // note: current session doesn't work in unit tests because of static context usage
        private ISession CurrentSession => _currentSessionContext.Session;

        public DynamicRepository(IEntityTypeConfigurationStore entityConfigurationStore, INhCurrentSessionContext currentSessionContext)
        {
            CurrentUnitOfWorkProvider = default!;

            _entityConfigurationStore = entityConfigurationStore;
            _currentSessionContext = currentSessionContext;
        }

        /// <summary>
        /// Reference to the current UOW provider.
        /// </summary>
        public ICurrentUnitOfWorkProvider CurrentUnitOfWorkProvider { get; set; }

        /// <inheritdoc/>
        public async Task<object> GetAsync(string entityTypeShortAlias, string id)
        {
            var entityConfiguration = _entityConfigurationStore.Get(entityTypeShortAlias);
            if (entityConfiguration == null)
                throw new Exception($"Failed to get a configuration of an entity with {nameof(EntityAttribute.TypeShortAlias)} = '{entityTypeShortAlias}'");
            return await GetAsync(entityConfiguration.EntityType, id);
        }

        /// <inheritdoc/>
        public object Get(string entityTypeShortAlias, string id)
        {
            var entityConfiguration = _entityConfigurationStore.Get(entityTypeShortAlias);
            if (entityConfiguration == null)
                throw new Exception($"Failed to get a configuration of an entity with {nameof(EntityAttribute.TypeShortAlias)} = '{entityTypeShortAlias}'");
            return Get(entityConfiguration.EntityType, id);
        }

        /// <inheritdoc/>
        public async Task<object> GetAsync(Type entityType, string id)
        {
            var parsedId = Parser.ParseId(id, entityType);
            var session = CurrentSession;
            return await session.GetAsync(entityType, parsedId);
        }

        /// <inheritdoc/>
        public object Get(Type entityType, string id)
        {
            var parsedId = Parser.ParseId(id, entityType);
            var session = CurrentSession;
            return session.Get(entityType, parsedId);
        }

        /// <inheritdoc/>
        public async Task SaveOrUpdateAsync(object entity)
        {
            var session = CurrentSession;
            await session.SaveOrUpdateAsync(entity);
        }

        /// <inheritdoc/>
        public async Task DeleteAsync(object entity)
        {
            var session = CurrentSession;
            var isHardDelete = IsHardDeleteEntity(entity);

            if (!isHardDelete && entity is ISoftDelete softDeleteEntity)
            {
                softDeleteEntity.IsDeleted = true;
                await SaveOrUpdateAsync(entity);
            }
            else
            {
                await session.DeleteAsync(entity);
            }
        }

        protected virtual int? GetCurrentTenantIdOrNull()
        {
            if (CurrentUnitOfWorkProvider?.Current != null)
            {
                return CurrentUnitOfWorkProvider.Current.GetTenantId();
            }

            return null;
        }

        protected virtual bool IsHardDeleteEntity(object entity)
        {
            if (CurrentUnitOfWorkProvider?.Current?.Items == null)
            {
                return false;
            }

            if (!CurrentUnitOfWorkProvider.Current.Items.ContainsKey(UnitOfWorkExtensionDataTypes.HardDelete))
            {
                return false;
            }

            var hardDeleteItems = CurrentUnitOfWorkProvider.Current.Items[UnitOfWorkExtensionDataTypes.HardDelete];
            if (!(hardDeleteItems is HashSet<string> objects))
            {
                return false;
            }

            var currentTenantId = GetCurrentTenantIdOrNull();
            var hardDeleteKey = Abp.Domain.Entities.EntityHelper.GetHardDeleteKey(entity, currentTenantId);
            return objects.Contains(hardDeleteKey);
        }

        /// <inheritdoc/>
        public IQueryable<T> Query<T>()
        {
            return CurrentSession.Query<T>();
        }

        public IQueryable Query<T>(string entityType)
        {
            return CurrentSession.Query<T>(entityType);
        }

        public IQueryable Where(Type entityType, LambdaExpression lambda)
        {
            var where = new Func<IQueryable<int>, Expression<Func<int, bool>>, IQueryable<int>>(Queryable.Where).Method;
            var whereForMyType = where.GetGenericMethodDefinition().MakeGenericMethod(entityType);
            var query = CurrentSession.Query<object>(entityType.FullName).Cast(entityType.GetRequiredFullName());

            return whereForMyType.Invoke(query, [query, lambda]).ForceCastAs<IQueryable>();
        }
    }
}
