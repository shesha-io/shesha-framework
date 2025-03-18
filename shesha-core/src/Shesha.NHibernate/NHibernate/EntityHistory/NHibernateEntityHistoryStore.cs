using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.EntityHistory;
using Castle.Core.Logging;
using System;
using System.Threading.Tasks;

namespace Shesha.NHibernate.EntityHistory
{
    public class NHibernateEntityHistoryStore : IEntityHistoryStore, ITransientDependency
    {
        private readonly IRepository<EntityChangeSet, long> _changeSetRepository;
        private readonly IRepository<EntityChange, long> _changesRepository;
        private readonly IRepository<EntityPropertyChange, long> _propChangesRepository;
        public ILogger Logger { get; set; } = new NullLogger();

        /// <summary>
        /// Creates a new <see cref="NHibernateEntityHistoryStore"/>.
        /// </summary>
        public NHibernateEntityHistoryStore(
            IRepository<EntityChangeSet, long> changeSetRepository,
            IRepository<EntityChange, long> changesRepository,
            IRepository<EntityPropertyChange, long> propChangesRepository
            )
        {
            _changeSetRepository = changeSetRepository;
            _changesRepository = changesRepository;
            _propChangesRepository = propChangesRepository;
        }

        public virtual async Task SaveAsync(EntityChangeSet changeSet)
        {
            try
            {
                var obj = changeSet;
                if (obj != null)
                {
                    var entityChanges = obj.EntityChanges;
                    obj.EntityChanges = null;
                    var csId = await _changeSetRepository.InsertAndGetIdAsync(obj);

                    if (entityChanges != null)
                    {
                        foreach (var entityChange in entityChanges)
                        {
                            var propChanges = entityChange.PropertyChanges;
                            entityChange.PropertyChanges = null;
                            entityChange.EntityChangeSetId = csId;
                            var cId = await _changesRepository.InsertAndGetIdAsync(entityChange);
                            if (propChanges != null)
                            {
                                foreach (var propChange in propChanges)
                                {
                                    propChange.EntityChangeId = cId;
                                    var pId = await _propChangesRepository.InsertAndGetIdAsync(propChange);
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception e)
            {
                Logger.Error(e.Message, e);
            }
        }

        public virtual void Save(EntityChangeSet changeSet)
        {
            try
            {
                var obj = changeSet;
                if (obj == null) return;
                var entityChanges = obj.EntityChanges;
                obj.EntityChanges = null;
                var csId = _changeSetRepository.InsertAndGetId(obj);

                if (entityChanges != null)
                {
                    foreach (var entityChange in entityChanges)
                    {
                        var propChanges = entityChange.PropertyChanges;
                        entityChange.PropertyChanges = null;
                        entityChange.EntityChangeSetId = csId;
                        if (string.IsNullOrEmpty(entityChange.EntityId))
                        {
                            // update id for inserted entity
                            entityChange.EntityId = entityChange.EntityEntry.GetType().GetProperty(nameof(IEntity.Id))?.GetValue(entityChange.EntityEntry)?.ToString();
                        }
                        var cId = _changesRepository.InsertAndGetId(entityChange);

                        if (propChanges != null)
                        {
                            foreach (var propChange in propChanges)
                            {
                                propChange.EntityChangeId = cId;
                                var pId = _propChangesRepository.InsertAndGetId(propChange);
                            }
                        }
                    }
                }
            }
            catch (Exception e)
            {
                Logger.Error(e.Message, e);
            }
        }
    }
}