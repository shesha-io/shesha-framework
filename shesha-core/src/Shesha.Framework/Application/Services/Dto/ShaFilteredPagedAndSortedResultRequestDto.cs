using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Application.Services.Dto
{
    /// <summary>
    /// Simply implements <see cref="IPagedAndSortedResultRequest"/>. 
    /// </summary>
    public class ShaFilteredPagedAndSortedResultRequestDto: PagedAndSortedResultRequestDto
    {
        [Range(-1, int.MaxValue)]
        public override int MaxResultCount { get; set; } = 10;
    }
}
