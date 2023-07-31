using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Events.Bus.Entities;
using Abp.Events.Bus.Handlers;
using Abp.ObjectMapping;
using Abp.Runtime.Caching;
using Shesha.AutoMapper.Dto;
using Shesha.ConfigurationItems;
using Shesha.ConfigurationItems.Models;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.Extensions;
using Shesha.Services.ReferenceLists.Dto;
using Shesha.Services.ReferenceLists.Exceptions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Services
{
    public class ReferenceListHelper: IEventHandler<EntityChangedEventData<ReferenceListItem>>, IReferenceListHelper, ITransientDependency
    {
        private const string ListItemsItemsCacheName = "ReferenceListItemsCache";
        private const string ListItemsIdsCacheName = "ReferenceListIdsCache";

        private readonly IRepository<ReferenceList, Guid> _listRepository;
        private readonly IRepository<ReferenceListItem, Guid> _itemsRepository;
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly ICacheManager _cacheManager;
        private readonly IConfigurationFrameworkRuntime _cfRuntime;

        /// <summary>
        /// Reference to the object to object mapper.
        /// </summary>
        public IObjectMapper ObjectMapper { get; set; }

        /// <summary>
        /// Cache of the ReferenceListItems
        /// </summary>
        protected ITypedCache<Guid, List<ReferenceListItemDto>> ListItemsCache => _cacheManager.GetCache<Guid, List<ReferenceListItemDto>>(ListItemsItemsCacheName);
        
        /// <summary>
        /// Cache of reference list ids
        /// </summary>
        protected ITypedCache<string, Guid> ListIdsCache => _cacheManager.GetCache<string, Guid>(ListItemsIdsCacheName);


        public ReferenceListHelper(
            IRepository<ReferenceList, Guid> listRepository, 
            IRepository<ReferenceListItem, Guid> itemsRepository, 
            IUnitOfWorkManager unitOfWorkManager, 
            ICacheManager cacheManager,
            IConfigurationFrameworkRuntime cfRuntime
        )
        {
            _listRepository = listRepository;
            _itemsRepository = itemsRepository;
            _unitOfWorkManager = unitOfWorkManager;
            _cacheManager = cacheManager;
            _cfRuntime = cfRuntime;
        }

        private void ValidateRefListId(ReferenceListIdentifier refListId)
        {
            if (refListId == null)
                throw new ArgumentException($"{nameof(refListId)} must not be null", nameof(refListId));

            if (string.IsNullOrWhiteSpace(refListId.Name))
                throw new ArgumentException($"{nameof(refListId.Name)} must not be null", nameof(refListId));

            if (string.IsNullOrWhiteSpace(refListId.Module) && !(refListId.Name ?? "").Contains(".") /*allow legacy names prefixed with a namespace*/)
                throw new ArgumentException($"`{nameof(refListId.Module)}` must not be null", nameof(refListId));
        }

        /// <summary>
        /// Returns display name of the <see cref="ReferenceListItem"/> in the specified list
        /// </summary>
        /// <param name="refListId">Referencve list identifier</param>
        /// <param name="value">Value of the <see cref="ReferenceListItem"/></param>
        /// <returns></returns>
        public string GetItemDisplayText(ReferenceListIdentifier refListId, Int64? value)
        {
            ValidateRefListId(refListId);

            if (value == null)
                return null;
            
            // make sure that we have active session
            using (_unitOfWorkManager.Current == null ? _unitOfWorkManager.Begin() : null)
            {
                var items = GetItems(refListId);
                return items.FirstOrDefault(i => i.ItemValue == value)?.Item;
            }
        }

        /// inheritedDoc
        public List<ReferenceListItemDto> DecomposeMultiValueIntoItems(ReferenceListIdentifier refListId, Int64? value)
        {
            if (value == null)
                return new List<ReferenceListItemDto>();

            ValidateRefListId(refListId);

            var values = Extensions.EntityExtensions.DecomposeIntoBitFlagComponents(value);
            var selectedItems = GetItems(refListId)
                .Where(i => values.Contains(i.ItemValue))
                .ToList();
            
            return selectedItems;
        }

        /// inheritedDoc
        public async Task<List<ReferenceListItemDto>> GetItemsAsync(ReferenceListIdentifier refListId)
        {
            var listId = await GetListIdAsync(refListId);

            return await ListItemsCache.GetAsync(listId, async id => {
                return await GetItemsAsync(id);
            });
        }

        /// inheritedDoc
        public List<ReferenceListItemDto> GetItems(ReferenceListIdentifier refListId)
        {
            var listId = GetListId(refListId);

            return ListItemsCache.Get(listId, id => {
                return GetItems(id);
            });
        }

        public List<ReferenceListItemDto> GetItems(Guid listId) 
        {
            var items = _itemsRepository.GetAll()
                .Where(e => e.ReferenceList.Id == listId)
                .OrderBy(e => e.OrderIndex).ThenBy(e => e.Item)
                .ToList();

            var itemDtos = items.Select(e => ObjectMapper.Map<ReferenceListItemDto>(e)).ToList();
            return itemDtos;
        }

        public async Task<List<ReferenceListItemDto>> GetItemsAsync(Guid listId)
        {
            var items = await _itemsRepository.GetAll()
                .Where(e => e.ReferenceList.Id == listId)
                .OrderBy(e => e.OrderIndex).ThenBy(e => e.Item)
                .ToListAsync();

            var itemDtos = items.Select(e => ObjectMapper.Map<ReferenceListItemDto>(e)).ToList();
            return itemDtos;
        }

        private IQueryable<ReferenceList> GetReferenceListQuery(ReferenceListIdentifier refListId)
        {
            ValidateRefListId(refListId);

            var mode = _cfRuntime.ViewMode;

            var mayBeLegacy = (refListId.Name ?? "").Contains(".");
            var anyModule = refListId.Module == null && mayBeLegacy;

            var query = _listRepository.GetAll().Where(f => (anyModule || f.Module != null && !f.Module.IsDeleted && f.Module.Name == refListId.Module) && f.Name == refListId.Name);

            switch (mode)
            {
                case ConfigurationItemViewMode.Live:
                    query = query.Where(f => f.VersionStatus == ConfigurationItemVersionStatus.Live);
                    break;
                case ConfigurationItemViewMode.Ready:
                    {
                        var statuses = new ConfigurationItemVersionStatus[] {
                            ConfigurationItemVersionStatus.Live,
                            ConfigurationItemVersionStatus.Ready
                        };

                        query = query.Where(f => statuses.Contains(f.VersionStatus)).OrderByDescending(f => f.VersionNo);
                        break;
                    }
                case ConfigurationItemViewMode.Latest:
                    {
                        var statuses = new ConfigurationItemVersionStatus[] {
                            ConfigurationItemVersionStatus.Live,
                            ConfigurationItemVersionStatus.Ready,
                            ConfigurationItemVersionStatus.Draft
                        };
                        query = query.Where(f => f.IsLast && statuses.Contains(f.VersionStatus));
                        break;
                    }
            }
            return query;
        }

        /// inheritedDoc
        public async Task<ReferenceList> GetReferenceListAsync(ReferenceListIdentifier refListId) 
        {
            var refList = await GetReferenceListQuery(refListId).FirstOrDefaultAsync();

            if (refList == null)
                throw new ReferenceListNotFoundException(refListId);
            return refList;
        }

        /// inheritedDoc
        [UnitOfWork]
        public ReferenceList GetReferenceList(ReferenceListIdentifier refListId)
        {
            var refList = GetReferenceListQuery(refListId).FirstOrDefault();

            if (refList == null)
                throw new ReferenceListNotFoundException(refListId);
            return refList;
        }

        #region Cache

        private string GetListIdCacheKey(ReferenceListIdentifier refListId, ConfigurationItemViewMode viewMode)
        {
            return $"{refListId.Module}/{refListId.Name}:{viewMode}".ToLower();
        }

        private string GetListIdCacheKey(ReferenceListIdentifier refListId)
        {
            return GetListIdCacheKey(refListId, _cfRuntime.ViewMode);
        }

        private async Task<Guid> GetListIdAsync(ReferenceListIdentifier refListId)
        {
            var idCacheKey = GetListIdCacheKey(refListId);
            var listId = await ListIdsCache.GetAsync(idCacheKey, async key => {
                var list = await GetReferenceListAsync(refListId);
                return list.Id;
            });
            return listId;
        }

        private Guid GetListId(ReferenceListIdentifier refListId)
        {
            var idCacheKey = GetListIdCacheKey(refListId);
            var listId = ListIdsCache.Get(idCacheKey, key => {
                var list = GetReferenceList(refListId);
                return list.Id;
            });
            return listId;
        }

        #endregion

        public void HandleEvent(EntityChangedEventData<ReferenceListItem> eventData)
        {
            var refList = eventData.Entity?.ReferenceList;

            if (refList == null)
                return;

            // clear items cache by Id
            ListItemsCache.Remove(refList.Id);

            // clear ids cache by module, nameapce and name
            var modes = Enum.GetValues(typeof(ConfigurationItemViewMode)).Cast<ConfigurationItemViewMode>().ToList();
            var refListId = refList.GetReferenceListIdentifier();
            var keys = modes.Select(mode => GetListIdCacheKey(refListId, mode)).ToArray();
            ListIdsCache.Remove(keys);
        }

        /// <summary>
        /// Clear reference list cache
        /// </summary>
        public async Task ClearCacheAsync()
        {
            await ListItemsCache.ClearAsync();
        }

        ///// <summary>
        ///// Clear reference list cache
        ///// </summary>
        //public async Task ClearCacheAsync(string module, string @namespace, string name)
        //{
        //    await ListItemsCache.RemoveAsync(GetCacheKey(module, @namespace, name));
        //}

        /// <summary>
        /// Decompose raw value into a multivalue reference list DTOs
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="rawValue"></param>
        /// <returns></returns>
        public static List<ReferenceListItemValueDto> DecomposeMultiReferenceListValue<T>(T rawValue) where T : struct, IConvertible
        {
            var result = new List<ReferenceListItemValueDto>();

            if (rawValue.ToString() == "0")
                return result;

            var flag = Enum.Parse(typeof(T), rawValue.ToString()) as Enum;

            foreach (var r in (long[])Enum.GetValues(typeof(T)))
            {
                if ((Convert.ToInt64(flag) & r) == r)
                {
                    var nameValue = new ReferenceListItemValueDto()
                    {
                        Item = Enum.GetName(typeof(T), r),
                        ItemValue = r
                    };

                    result.Add(nameValue);
                }
            }
            return result;
        }
    }
}
