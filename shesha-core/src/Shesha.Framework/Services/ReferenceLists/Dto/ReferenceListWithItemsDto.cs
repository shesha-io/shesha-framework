using System.Collections.Generic;

namespace Shesha.Services.ReferenceLists.Dto
{
    /// <summary>
    /// Reference list full(with items) DTO
    /// </summary>
    public class ReferenceListWithItemsDto: ReferenceListDto
    {

        public List<ReferenceListItemDto> Items { get; set; } = new List<ReferenceListItemDto>();

        /// <summary>
        /// Cache MD5, is used for client-side caching
        /// </summary>
        public string CacheMd5 { get; set; }
    }
}
