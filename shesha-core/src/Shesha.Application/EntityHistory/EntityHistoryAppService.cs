using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Shesha.Authorization;
using Shesha.Extensions;
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

        public EntityHistoryAppService(
            IEntityHistoryProvider entityHistoryProvider
        )
        {
            _entityHistoryProvider = entityHistoryProvider;
        }

        public async Task<PagedResultDto<EntityHistoryItemDto>> GetAuditTrail(EntityHistoryResultRequestDto input, string entityId, string entityTypeFullName, bool includeEventsOnChildEntities)
        {
            var history = await _entityHistoryProvider.GetAuditTrailAsync(entityId, entityTypeFullName, includeEventsOnChildEntities);

            var totalRowsBeforeFilter = history.Count();

            // Dynamic filter
            if (!string.IsNullOrEmpty(input.QuickSearch))
            {
                history = history.LikeDynamic(input.QuickSearch).ToList();
            }

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
                history = history.OrderByDynamic(sort[0], sortOrder.ToLower()).ToList();
            }

            if (skipCount > history.Count) skipCount = 0;

            history = history.Skip(skipCount).Take(takeCount).ToList();

            var dataRows = new List<Dictionary<string, object>>();
            
            /*var authorizedColumns =
                tableConfig.Columns //.Where(c => c.AuthorizationRules == null || c.AuthorizationRules.IsAuthorized())
            .ToList();

            foreach (var item in history)
            {
                var row = new Dictionary<string, object>();
                foreach (var col in authorizedColumns)
                {
                    var value = item.GetType().GetProperty(col.PropertyName)?.GetValue(item);
                    row.Add(col.PropertyName, value);
                }

                dataRows.Add(row);
            }*/

            var result = new PagedResultDto<EntityHistoryItemDto>
            {
                TotalCount= totalRows,
                Items = history
            };

            return result;
        }
    }
}