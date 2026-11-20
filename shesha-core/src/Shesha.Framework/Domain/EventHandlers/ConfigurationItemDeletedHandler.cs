using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Events.Bus.Entities;
using Abp.Events.Bus.Handlers;
using Shesha.Extensions;
using System;
using System.Threading.Tasks;

namespace Shesha.Domain.EventHandlers
{
    public class ConfigurationItemDeletedHandler : IAsyncEventHandler<EntityDeletedEventData<ConfigurationItem>>, ITransientDependency
    {
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly IRepository<ConfigurationItem, Guid> _ciRepository;

        public ConfigurationItemDeletedHandler(IUnitOfWorkManager unitOfWorkManager, IRepository<ConfigurationItem, Guid> ciRepository)
        {
            _unitOfWorkManager = unitOfWorkManager;
            _ciRepository = ciRepository;
        }

        public async Task HandleEventAsync(EntityDeletedEventData<ConfigurationItem> eventData)
        {
            var baseEntity = eventData.Entity.ExposedFrom;
            if (baseEntity != null && !baseEntity.IsDeleted)
            {
                if (baseEntity.IsOverriden) 
                {
                    using (var uow = _unitOfWorkManager.Begin())
                    {
                        var hasExposedVersions = await _ciRepository.AnyAsync(e => e.ExposedFrom == baseEntity && !e.IsDeleted && e.Id != eventData.Entity.Id);
                        if (!hasExposedVersions) 
                        {
                            var toUpdate = await _ciRepository.GetAsync(baseEntity.Id);
                            toUpdate.IsOverriden = false;
                            await _ciRepository.UpdateAsync(toUpdate);
                            await uow.CompleteAsync();
                        }                        
                    }
                }                
            }
        }
    }
}
