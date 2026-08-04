using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Events.Bus.Entities;
using Abp.Events.Bus.Handlers;
using Shesha.Domain;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Shesha.ConfigurationItems.AppKeys
{
#nullable enable
    /// <summary>
    /// Application keys store
    /// </summary>
    public class AppKeysStore : IAppKeysStore, ISingletonDependency
        , IEventHandler<EntityCreatedEventData<FrontEndApp>>
        , IEventHandler<EntityDeletedEventData<FrontEndApp>>
        , IEventHandler<EntityUpdatedEventData<FrontEndApp>>
    {
        private readonly IRepository<FrontEndApp, Guid> _frontEndAppRepository;
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly object _lock = new object();
        private List<string>? _appKeys = null;

        public List<string> AppKeys
        {
            get
            {
                if (_appKeys == null)
                {
                    lock (_lock)
                    {
                        if (_appKeys == null)
                        {
                            using (var uow = _unitOfWorkManager.Begin())
                            {
                                var list = _frontEndAppRepository.GetAllList()
                                                                 .Select(x => x.AppKey)
                                                                 .ToList();
                                uow.Complete();
                                _appKeys = list;
                            }
                        }
                    }
                }
                return _appKeys;
            }
        }

        public AppKeysStore(IUnitOfWorkManager unitOfWorkManager, IRepository<FrontEndApp, Guid> frontEndAppRepository)
        {
            _unitOfWorkManager = unitOfWorkManager;
            _frontEndAppRepository = frontEndAppRepository;
        }

        private void ClearCache() 
        { 
            lock (_lock) 
            {
                _appKeys = null;
            }
        }

        public void HandleEvent(EntityCreatedEventData<FrontEndApp> eventData)
        {
            ClearCache();
        }

        public void HandleEvent(EntityDeletedEventData<FrontEndApp> eventData)
        {
            ClearCache();
        }

        public void HandleEvent(EntityUpdatedEventData<FrontEndApp> eventData)
        {
            ClearCache();
        }
    }
#nullable restore
}
