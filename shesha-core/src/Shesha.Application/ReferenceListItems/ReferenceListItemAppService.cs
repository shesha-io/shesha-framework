using Abp.Application.Services.Dto;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using GraphQL;
using Shesha.ConfigurationItems;
using Shesha.ConfigurationItems.Cache;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.DynamicEntities.Dtos;
using Shesha.Services;
using Shesha.Services.ReferenceLists;
using System;
using System.Threading.Tasks;

namespace Shesha.ReferenceLists
{
    public class ReferenceListItemAppService : DynamicCrudAppService<ReferenceListItem, DynamicDto<ReferenceListItem, Guid>, Guid>
    {
        private readonly IConfigurationFrameworkRuntime _cfRuntime;
        private readonly IConfigurationItemClientSideCache _clientSideCache;

        public ReferenceListItemAppService(
            IRepository<ReferenceListItem, Guid> repository,
            IConfigurationFrameworkRuntime cfRuntime,
            IConfigurationItemClientSideCache clientSideCache
            ) : base(repository)
        {
            _cfRuntime = cfRuntime;
            _clientSideCache = clientSideCache;
        }

        private async Task ClearCache(Guid id)
        {
            var item = Repository.Get(id);
            if (item == null)
                throw new EntityNotFoundException($"ReferenceListItem with id {id} not found");

            await _clientSideCache.SetCachedMd5Async(ReferenceList.ItemTypeName, null, item.ReferenceList.Module?.Name, item.ReferenceList.Name, _cfRuntime.ViewMode, null);
        }

        public override async Task<DynamicDto<ReferenceListItem, Guid>> CreateAsync(DynamicDto<ReferenceListItem, Guid> input)
        {
            await ClearCache(input.Id);
            return await base.CreateAsync(input);
        }

        public override async Task<DynamicDto<ReferenceListItem, Guid>> UpdateAsync(DynamicDto<ReferenceListItem, Guid> input)
        {
            await ClearCache(input.Id);
            return await base.UpdateAsync(input);
        }

        public override async Task DeleteAsync(EntityDto<Guid> input)
        {
            await ClearCache(input.Id);
            await base.DeleteAsync(input);
        }
    }
}