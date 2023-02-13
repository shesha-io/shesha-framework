using Abp.Application.Services.Dto;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace Shesha.Application.Services.Dto
{
    /// <summary>
    /// Filtered, pages and sorted request DTO
    /// </summary>
    public class FilteredPagedAndSortedResultRequestDto : PagedAndSortedResultRequestDto, IFilteredPagedAndSortedResultRequestDto
    {
        /// <summary>
        /// Filter string in JsonLogic format
        /// </summary>
        public string Filter { get; set; }

        /// <summary>
        /// Quick search string. Is used to search entities by text
        /// </summary>
        public string QuickSearch { get; set; }

        /// <summary>
        /// List of specifications to apply on top of query
        /// </summary>
        public List<string> Specifications { get; set; } = new List<string>();
    }
}
