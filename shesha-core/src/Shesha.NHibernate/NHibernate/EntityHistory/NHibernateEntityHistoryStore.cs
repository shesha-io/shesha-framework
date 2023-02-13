using System;
using System.Threading;
using System.Threading.Tasks;
using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.EntityHistory;
using Castle.Core.Logging;
using NUglify.Helpers;
using Shesha.Domain;

namespace Shesha.NHibernate.EntityHistory
{
    public class NHibernateEntityHistoryStore : IEntityHistoryStore, ITransientDependency
    {
        private readonly IRepository<EntityChangeSet, long> _changeSetRepository;
        private readonly IRepository<EntityChange, long> _changesRepository;
        private readonly IRepository<EntityPropertyChange, long> _propChangesRepository;
        private readonly IRepository<EntityHistoryEvent, Guid> _historyEventRepository;
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
                    entityChanges.ForEach(async x =>
                    {
                        var propChanges = x.PropertyChanges;
                        x.PropertyChanges = null;
                        x.EntityChangeSetId = csId;
                        var cId = await _changesRepository.InsertAndGetIdAsync(x);
                        propChanges.ForEach(async p =>
                        {
                            p.EntityChangeId = cId;
                            var pId = await _propChangesRepository.InsertAndGetIdAsync(p);
                        });

                    });
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
                entityChanges.ForEach(x =>
                {
                    var propChanges = x.PropertyChanges;
                    x.PropertyChanges = null;
                    x.EntityChangeSetId = csId;
                    if (string.IsNullOrEmpty(x.EntityId))
                    {
                        // update id for inserted entity
                        x.EntityId = x.EntityEntry.GetType().GetProperty(nameof(IEntity.Id))?.GetValue(x.EntityEntry)?.ToString();
                    }
                    var cId = _changesRepository.InsertAndGetId(x);
                    propChanges.ForEach(p =>
                    {
                        p.EntityChangeId = cId;
                        var pId = _propChangesRepository.InsertAndGetId(p);
                    });

                });
            }
            catch (Exception e)
            {
                Logger.Error(e.Message, e);
            }
        }
    }
}