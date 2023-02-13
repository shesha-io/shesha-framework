using Abp.Application.Services.Dto;

namespace Shesha.Application.Services.Dto
{
    /// <summary>
    /// Standard request of a filtered, paged and sorted list.
    /// </summary>
    public interface IFilteredPagedAndSortedResultRequestDto : IPagedAndSortedResultRequest
    {
        /// <summary>
        /// Filter string in JsonLogic format
        /// </summary>
        string Filter { get; set; }

        /// <summary>
        /// Quick search string. Is used to search entities by text
        /// </summary>
        string QuickSearch { get; set; }
    }
}
