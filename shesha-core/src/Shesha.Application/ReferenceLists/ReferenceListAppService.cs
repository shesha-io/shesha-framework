using Abp.Domain.Repositories;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Shesha.Application.Services.Dto;
using Shesha.ConfigurationItems.Cache;
using Shesha.Domain;
using Shesha.Exceptions;
using Shesha.ReferenceLists.Dto;
using Shesha.Services;
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
        private readonly IReferenceListHelper _refListHelper;
        private readonly IConfigurationItemClientSideCache _clientSideCache;

        public ReferenceListAppService(
            IRepository<ReferenceList, Guid> repository,
            IReferenceListHelper refListHelper, 
            IConfigurationItemClientSideCache clientSideCache
            ) : base(repository)
        {
            _refListHelper = refListHelper;
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
            // check cache
            if (!string.IsNullOrWhiteSpace(input.Md5))
            {
                var cachedMd5 = await _clientSideCache.GetCachedMd5Async(ReferenceList.ItemTypeName, null, input.Module, input.Name);
                if (input.Md5 == cachedMd5)
                    throw new ContentNotModifiedException("Reference list not changed");
            }

            var refList = await _refListHelper.GetReferenceListAsync(new ReferenceListIdentifier(input.Module, input.Name));

            var dto = ObjectMapper.Map<ReferenceListWithItemsDto>(refList);

            dto.Items = await _refListHelper.GetItemsAsync(refList.Id);

            var json = JsonConvert.SerializeObject(dto);
            //await _clientSideCache.SetCachedMd5Async(ReferenceList.ItemTypeName, null, input.Module, input.Name, dto.CacheMd5);

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

        #region private methods

        private string GetMd5(ReferenceListWithItemsDto dto)
        {
            var json = JsonConvert.SerializeObject(dto);
            return json.ToMd5Fingerprint();
        }

        #endregion
    }
}