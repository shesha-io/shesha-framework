using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Shesha.Authorization;
using Shesha.Extensions;
using Shesha.QuickSearch;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.EntityHistory
{
    /// <summary>
    /// Entity history application service
    /// </summary>
    [SheshaAuthorize(Domain.Enums.RefListPermissionedAccess.AnyAuthenticated)]
    public class EntityHistoryAppService : ApplicationService, IEntityHistoryAppService
    {
        private readonly IEntityHistoryProvider _entityHistoryProvider;
        private readonly IQuickSearcher _quickSearcher;
        
        public EntityHistoryAppService(
            IEntityHistoryProvider entityHistoryProvider,
            IQuickSearcher quickSearcher
        )
        {
            _entityHistoryProvider = entityHistoryProvider;
            _quickSearcher = quickSearcher;
        }

        public async Task<PagedResultDto<EntityHistoryItemDto>> GetAuditTrailAsync(EntityHistoryResultRequestDto input, string entityId, string entityTypeFullName, bool includeEventsOnChildEntities)
        {
            var history = await _entityHistoryProvider.GetAuditTrailAsync(entityId, entityTypeFullName, includeEventsOnChildEntities);

            var totalRowsBeforeFilter = history.Count();

            // Dynamic filter
            if (!string.IsNullOrWhiteSpace(input.QuickSearch))
                history = await _quickSearcher.ApplyQuickSearch(history.AsQueryable(), input.QuickSearch).ToListAsync();

            var totalRows = history.Count();
            var totalPages = (int)Math.Ceiling((double)history.Count() / input.MaxResultCount);

            var takeCount = input.MaxResultCount > -1 ? input.MaxResultCount : int.MaxValue;
            var skipCount = input.SkipCount;

            // Dynamic order by property name
            if (input.Sorting != null)
            {
                var sorting = input.Sorting.Split(",");
                var sort = sorting[0].Split(" ");
                var sortOrder = sort.Length > 1 ? sort[1] : "asc";

                // TODO: review and replace with code from AbpCrudAppService.ApplySorting
                history = history.OrderByDynamic(sort[0], sortOrder.ToLower()).ToList();
            }

            if (skipCount > history.Count) skipCount = 0;

            history = history.Skip(skipCount).Take(takeCount).ToList();

            var dataRows = new List<Dictionary<string, object>>();
            
            var result = new PagedResultDto<EntityHistoryItemDto>
            {
                TotalCount= totalRows,
                Items = history
            };

            return result;
        }
    }
}