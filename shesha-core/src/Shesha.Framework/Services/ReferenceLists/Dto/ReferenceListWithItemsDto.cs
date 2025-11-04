using Shesha.Dto;
using System.Collections.Generic;

namespace Shesha.Services.ReferenceLists.Dto
{
    /// <summary>
    /// Reference list full(with items) DTO
    /// </summary>
    public class ReferenceListWithItemsDto: ConfigurationItemDto
    {

        public List<ReferenceListItemDto> Items { get; set; } = new List<ReferenceListItemDto>();
    }
}
