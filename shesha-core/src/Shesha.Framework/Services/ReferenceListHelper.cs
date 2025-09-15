using Abp;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Events.Bus.Entities;
using Abp.Events.Bus.Handlers;
using Abp.ObjectMapping;
using Abp.Runtime.Caching;
using Abp.Threading;
using Shesha.AutoMapper.Dto;
using Shesha.ConfigurationItems.Cache;
using Shesha.Domain;
using Shesha.DynamicEntities;
using Shesha.Extensions;
using Shesha.Services.ReferenceLists.Cache;
using Shesha.Services.ReferenceLists.Dto;
using Shesha.Services.ReferenceLists.Exceptions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Services
{
    public class ReferenceListHelper: IEventHandler<EntityChangedEventData<ReferenceListItem>>,
        IEventHandler<EntityReorderedEventData<ReferenceListItem, Guid>>,
        IReferenceListHelper, ITransientDependency
    {
        private readonly IRepository<ReferenceList, Guid> _listRepository;
        private readonly IRepository<ReferenceListItem, Guid> _itemsRepository;
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly IConfigurationItemClientSideCache _clientSideCache;
        private readonly ITypedCache<Guid, List<ReferenceListItemDto>> _listItemsCache;
        
        /// <summary>
        /// Cache of reference list ids
        /// </summary>
        private readonly ITypedCache<string, Guid> _listIdsCache;

        /// <summary>
        /// Reference to the object to object mapper.
        /// </summary>
        public IObjectMapper ObjectMapper { get; set; } = NullObjectMapper.Instance;

        public ReferenceListHelper(
            IRepository<ReferenceList, Guid> listRepository, 
            IRepository<ReferenceListItem, Guid> itemsRepository, 
            IUnitOfWorkManager unitOfWorkManager, 
            IConfigurationItemClientSideCache clientSideCache,
            IReferenceListItemsCacheHolder listItemsCache,
            IReferenceListIdsCacheHolder listIdsCache
        )
        {
            _listRepository = listRepository;
            _itemsRepository = itemsRepository;
            _unitOfWorkManager = unitOfWorkManager;
            _clientSideCache = clientSideCache;
            _listItemsCache = listItemsCache.Cache;
            _listIdsCache = listIdsCache.Cache;
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
        public string? GetItemDisplayText(ReferenceListIdentifier refListId, Int64? value)
        {
            ValidateRefListId(refListId);

            if (value == null)
                return null;
            
            // make sure that we have active session
            using (ExistingOrNewUnitOfWork())
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

            var values = EntityExtensions.DecomposeIntoBitFlagComponents(value);
            var selectedItems = GetItems(refListId)
                .Where(i => values.Contains(i.ItemValue))
                .ToList();
            
            return selectedItems;
        }

        /// inheritedDoc
        public async Task<List<ReferenceListItemDto>> GetItemsAsync(ReferenceListIdentifier refListId)
        {
            var listId = await GetListIdAsync(refListId);

            return listId != null 
                ? await _listItemsCache.GetAsync(listId.Value, GetItemsAsync)
                : new ();
        }

        /// inheritedDoc
        public List<ReferenceListItemDto> GetItems(ReferenceListIdentifier refListId)
        {
            var listId = GetListId(refListId);

            return listId != null
                ? _listItemsCache.Get(listId.Value, GetItems)
                : new ();
        }

        public List<ReferenceListItemDto> GetItems(Guid listId) 
        {
            var items = _itemsRepository.GetAll()
                .Where(e => e.ReferenceList.Id == listId)
                .OrderBy(e => e.OrderIndex).ThenBy(e => e.Item)
                .ToList();

            var itemDtos = items.Select(e => new ReferenceListItemDto(e)).ToList();
            return itemDtos;
        }

        public async Task<List<ReferenceListItemDto>> GetItemsAsync(Guid refListId)
        {
            var items = await _itemsRepository.GetAll()
                .Where(e => e.ReferenceList.Id == refListId)
                .OrderBy(e => e.OrderIndex).ThenBy(e => e.Item)
                .ToListAsync();

            var itemDtos = items.Select(e => new ReferenceListItemDto(e)).ToList();
            return itemDtos;
        }

        private IQueryable<ReferenceList> GetReferenceListQuery(ReferenceListIdentifier refListId)
        {
            ValidateRefListId(refListId);

            var mayBeLegacy = (refListId.Name ?? "").Contains(".");
            var anyModule = refListId.Module == null && mayBeLegacy;

            var query = _listRepository.GetAll().Where(f => (anyModule || f.Module != null && !f.Module.IsDeleted && f.Module.Name == refListId.Module) && f.Name == refListId.Name);

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

        private string GetListIdCacheKey(ReferenceListIdentifier refListId)
        {
            return $"{refListId.Module}/{refListId.Name}".ToLower();
        }

        public async Task<Guid?> GetListIdAsync(ReferenceListIdentifier refListId)
        {
            var idCacheKey = GetListIdCacheKey(refListId);
            return await _listIdsCache.GetAsync(idCacheKey, async key => {
                using (ExistingOrNewUnitOfWork()) 
                {
                    var list = await GetReferenceListAsync(refListId);
                    return list.Id;
                }                    
            });
        }

        public Guid? GetListId(ReferenceListIdentifier refListId)
        {
            var idCacheKey = GetListIdCacheKey(refListId);
            return _listIdsCache.Get(idCacheKey, key => {
                using (ExistingOrNewUnitOfWork())
                {
                    var list = GetReferenceList(refListId);
                    return list.Id;
                }                    
            });
        }

        #endregion

        public void HandleEvent(EntityChangedEventData<ReferenceListItem> eventData)
        {
            var refList = eventData.Entity?.ReferenceList;

            if (refList != null)
                ClearCacheForRefList(refList);
        }

        private void ClearCacheForRefList(ReferenceList refList) 
        {
            // clear items cache by Id
            _listItemsCache.Remove(refList.Id);

            var refListId = refList.GetReferenceListIdentifier();
            _listIdsCache.Remove(GetListIdCacheKey(refListId));

            // clear client-side cache
            AsyncHelper.RunSync(async () =>
            {
                await _clientSideCache.SetCachedMd5Async(ReferenceList.ItemTypeName, null, refListId.Module, refListId.Name, null);
            });
        }

        /// <summary>
        /// Clear reference list cache
        /// </summary>
        public Task ClearCacheAsync()
        {
            return _listItemsCache.ClearAsync();
        }

        /// <summary>
        /// Decompose raw value into a multivalue reference list DTOs
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="rawValue"></param>
        /// <returns></returns>
        public static List<ReferenceListItemValueDto> DecomposeMultiReferenceListValue<T>(Int64 rawValue) where T : struct, IConvertible
        {
            var result = new List<ReferenceListItemValueDto>();

            if (rawValue.ToString() == "0")
                return result;

            var enumValues = Enum.GetValues(typeof(T)).Cast<Int64>();
            foreach (var r in enumValues)
            {
                if ((rawValue & r) == r)
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

        public void HandleEvent(EntityReorderedEventData<ReferenceListItem, Guid> eventData)
        {
            // Take first item id assuming that reordering is possible only within a list
            var itemId = eventData.Ids.FirstOrDefault();

            using (var uow = _unitOfWorkManager.Begin()) 
            {
                var item = _itemsRepository.FirstOrDefault(itemId);

                if (item?.ReferenceList != null)
                    ClearCacheForRefList(item.ReferenceList);
                
                uow.Complete();
            }
        }

        private IDisposable? ExistingOrNewUnitOfWork()
        {
            if (_unitOfWorkManager.Current != null)
                return null;

            var uow = _unitOfWorkManager.Begin();

            return new DisposeAction(() => {
                uow.Complete();
                uow.Dispose();
            });
        }
    }
}