using Abp.Application.Services.Dto;
using Shesha.Application.Services.Dto;
using System.Collections.Generic;

namespace Shesha.EntityHistory
{
    /// <summary>
    /// Filtered, pages and sorted request DTO
    /// </summary>
    public class EntityHistoryResultRequestDto : PagedAndSortedResultRequestDto, IPagedAndSortedResultRequest
    {
        /// <summary>
        /// Quick search string. Is used to search entities by text
        /// </summary>
        public string QuickSearch { get; set; }
    }
}
