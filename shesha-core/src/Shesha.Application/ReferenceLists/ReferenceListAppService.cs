using Abp.Domain.Repositories;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Shesha.Application.Services.Dto;
using Shesha.ConfigurationItems;
using Shesha.ConfigurationItems.Cache;
using Shesha.Domain;
using Shesha.Exceptions;
using Shesha.ReferenceLists.Dto;
using Shesha.Services;
using Shesha.Services.ReferenceLists;
using Shesha.Services.ReferenceLists.Dto;
using Shesha.Services.ReferenceLists.Exceptions;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.ReferenceLists
{
    public class ReferenceListAppService : SheshaCrudServiceBase<ReferenceList, ReferenceListDto, Guid, FilteredPagedAndSortedResultRequestDto, CreateReferenceListDto, UpdateReferenceListDto, GetReferenceListByIdInput>
    {
        private readonly IRepository<Module, Guid> _moduleRepository;
        private readonly IReferenceListHelper _refListHelper;
        private readonly IReferenceListManager _refListManager;
        private readonly IConfigurationFrameworkRuntime _cfRuntime;
        private readonly IConfigurationItemClientSideCache _clientSideCache;

        public ReferenceListAppService(
            IRepository<ReferenceList, Guid> repository,
            IReferenceListHelper refListHelper, 
            IReferenceListManager refListManager,
            IRepository<Module, Guid> moduleRepository,
            IConfigurationFrameworkRuntime cfRuntime,
            IConfigurationItemClientSideCache clientSideCache
            ) : base(repository)
        {
            _refListHelper = refListHelper;
            _refListManager = refListManager;
            _moduleRepository = moduleRepository;
            _cfRuntime = cfRuntime;
            _clientSideCache = clientSideCache;
        }

        /// <summary>
        /// Get current form configuration by name
        /// </summary>
        /// <returns></returns>
        /// <exception cref="ReferenceListNotFoundException"></exception>
        [HttpGet]
        public async Task<ReferenceListWithItemsDto> GetByNameAsync(GetReferenceListByNameInput input)
        {
            var mode = _cfRuntime.ViewMode;

            // check cache
            if (!string.IsNullOrWhiteSpace(input.Md5))
            {
                var cachedMd5 = await _clientSideCache.GetCachedMd5Async(ReferenceList.ItemTypeName, null, input.Module, input.Name, mode);
                if (input.Md5 == cachedMd5)
                    throw new ContentNotModifiedException("Reference list not changed");
            }

            var refList = await _refListHelper.GetReferenceListAsync(new ReferenceListIdentifier(input.Module, input.Name));

            var dto = ObjectMapper.Map<ReferenceListWithItemsDto>(refList);

            var items = await _refListHelper.GetRevisionItemsAsync(refList.Revision.Id);
            dto.Items = items.Select(item => ObjectMapper.Map<ReferenceListItemDto>(item)).ToList();

            var json = JsonConvert.SerializeObject(dto);
            dto.CacheMd5 = GetMd5(dto);
            await _clientSideCache.SetCachedMd5Async(ReferenceList.ItemTypeName, null, input.Module, input.Name, mode, dto.CacheMd5);

            return dto;
        }

        /// <summary>
        /// Get ReferenceList Items
        /// </summary>
        [HttpGet]
        public async Task<List<ReferenceListItemDto>> GetItemsAsync(string module, string name)
        {
            return await _refListHelper.GetItemsAsync(new ReferenceListIdentifier(module, name));
        }

        /// <summary>
        /// Clear reference list cache
        /// </summary>
        [HttpPost]
        [Route("/api/services/app/[controller]/ClearCache")]
        public async Task ClearCacheFullAsync() 
        {
            await _refListHelper.ClearCacheAsync();
        }

        /// <summary>
        /// Update reference list
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        public override async Task<ReferenceListDto> UpdateAsync(UpdateReferenceListDto input)
        {
            CheckUpdatePermission();

            var entity = await GetEntityByIdAsync(input.Id);

            await _refListManager.UpdateAsync(entity, input);

            await CurrentUnitOfWork.SaveChangesAsync();

            var module = input.ModuleId.HasValue
                ? await _moduleRepository.GetAsync(input.ModuleId.Value)
                : null;

            await _clientSideCache.SetCachedMd5Async(ReferenceList.ItemTypeName, null, module?.Name, input.Name, _cfRuntime.ViewMode, null);

            return MapToEntityDto(entity);
        }

        /// <summary>
        /// Create reference list
        /// </summary>
        public override async Task<ReferenceListDto> CreateAsync(CreateReferenceListDto input)
        {
            CheckCreatePermission();

            var refList = await _refListManager.CreateAsync(input);
            
            await CurrentUnitOfWork.SaveChangesAsync();

            return MapToEntityDto(refList);
        }

        #region private methods

        private string GetMd5(ReferenceListWithItemsDto dto)
        {
            var json = JsonConvert.SerializeObject(dto);
            return json.ToMd5Fingerprint();
        }

        #endregion
    }
}