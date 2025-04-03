using Abp.Application.Services.Dto;
using Shesha.Application.Services.Dto;

namespace Shesha.EntityHistory
{
    /// <summary>
    /// Filtered, pages and sorted request DTO
    /// </summary>
    public class EntityHistoryResultRequestDto : ShaFilteredPagedAndSortedResultRequestDto, IPagedAndSortedResultRequest
    {
        /// <summary>
        /// Quick search string. Is used to search entities by text
        /// </summary>
        public string? QuickSearch { get; set; }
    }
}
