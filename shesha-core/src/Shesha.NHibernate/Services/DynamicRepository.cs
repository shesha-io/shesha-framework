using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Abp.Dependency;
using Abp.Domain.Uow;
using NHibernate;
using NHibernate.Context;
using NHibernate.Criterion;
using NHibernate.Util;
using Shesha.Configuration.Runtime;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.NHibernate.Session;
using Shesha.NHibernate.UoW;
using Shesha.Utilities;

namespace Shesha.Services
{
    /// <summary>
    /// Dynamic repository
    /// </summary>
    public class DynamicRepository : IDynamicRepository, ITransientDependency
    {
        private readonly IEntityConfigurationStore _entityConfigurationStore;
        private readonly ICurrentSessionContext _currentSessionContext;


        // note: current session doesn't work in unit tests because of static context usage
        private ISession CurrentSession => _currentSessionContext.CurrentSession();

        public DynamicRepository(IEntityConfigurationStore entityConfigurationStore, ICurrentSessionContext currentSessionContext)
        {
            _entityConfigurationStore = entityConfigurationStore;
            _currentSessionContext = currentSessionContext;
        }

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
            await session.DeleteAsync(entity);
        }

        /// <inheritdoc/>
        public IQueryable<T> Query<T>()
        {
            return CurrentSession.Query<T>();
        }
    }
}
