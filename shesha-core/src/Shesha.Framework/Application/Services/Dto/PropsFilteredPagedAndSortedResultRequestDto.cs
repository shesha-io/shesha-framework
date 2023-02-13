using Abp.Application.Services.Dto;

namespace Shesha.Application.Services.Dto
{
    /// <summary>
    /// Filtered, pages and sorted request DTO with properties list
    /// </summary>
    public class PropsFilteredPagedAndSortedResultRequestDto : FilteredPagedAndSortedResultRequestDto
    {
        /// <summary>
        /// List of properties to fetch in GraphQL-like syntax. Supports nested properties 
        /// </summary>
        public string Properties { get; set; }
    }
}
