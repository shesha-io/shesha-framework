using Abp.Application.Services;
using Abp.Configuration;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.EntityHistory;
using Abp.Events.Bus.Entities;
using Abp.ObjectMapping;
using Abp.Reflection;
using GraphQL;
using NHibernate;
using NHibernate.Criterion;
using NHibernate.Intercept;
using NHibernate.Proxy;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.Extensions;
using Shesha.NHibernate.Session;
using Shesha.Reflection;
using Shesha.Services;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using System.Threading;
using Shesha.Application.Services.Dto;
using Abp.Application.Services.Dto;

namespace Shesha.EntityHistory
{
    /// <summary>
    /// Entity history application service
    /// </summary>
    public class EntityHistoryAppService : ApplicationService, IEntityHistoryAppService
    {
        private readonly IEntityHistoryProvider _entityHistoryProvider;

        public EntityHistoryAppService(
            IEntityHistoryProvider entityHistoryProvider
        )
        {
            _entityHistoryProvider = entityHistoryProvider;
        }

        public async Task<PagedResultDto<EntityHistoryItemDto>> GetAuditTrail(FilteredPagedAndSortedResultRequestDto input, string entityId, string entityTypeFullName)
        {
            var history = _entityHistoryProvider.GetAuditTrail(entityId, entityTypeFullName);

            var totalRowsBeforeFilter = history.Count();

            // Dynamic filter
            /*if (!string.IsNullOrEmpty(input.QuickSearch))
            {
                if (input.properties.Length > 0)
                {
                    history = history.LikeDynamic(properties, input.QuickSearch).ToList();
                }
            }*/

            var totalRows = history.Count();
            var totalPages = (int)Math.Ceiling((double)history.Count() / input.MaxResultCount);

            var takeCount = input.MaxResultCount > -1 ? input.MaxResultCount : int.MaxValue;
            var skipCount = input.SkipCount;

            history = history.OrderBy(x => x.CreationTime).ToList();

            // Dynamic order by property name
            /*var sort = input.Sorting.FirstOrDefault();
            if (sort != null)
            {
                history = history.OrderByDynamic(sort.Id, sort.Desc ? "desc" : "asc").ToList();
            }*/

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

            return await Task.FromResult(result);
        }
    }
}