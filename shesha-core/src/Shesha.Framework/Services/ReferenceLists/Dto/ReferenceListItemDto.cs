using Abp.Application.Services.Dto;
using Shesha.Domain;
using System;

namespace Shesha.Services.ReferenceLists.Dto
{
    /// <summary>
    /// Dto of the <see cref="ReferenceListItem"/>
    /// </summary>
    public class ReferenceListItemDto: EntityDto<Guid>
    {
        /// <summary>
        /// Item name
        /// </summary>
        public string Item { get; set; }

        /// <summary>
        /// Item value
        /// </summary>
        public Int64 ItemValue { get; set; }

        /// <summary>
        /// Item description
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Order index
        /// </summary>
        public Int64 OrderIndex { get; set; }

        /// <summary>
        /// Color associated with the item
        /// </summary>
        public string Color { get; set; }

        /// <summary>
        /// Icon associated with the item
        /// </summary>
        public string Icon { get; set; }

        /// <summary>
        /// Short alias
        /// </summary>
        public string ShortAlias { get; set; }

        public ReferenceListItemDto()
        {
            
        }

        public ReferenceListItemDto(ReferenceListItem item)
        {
            Id = item.Id;
            Item = item.Item;
            ItemValue = item.ItemValue;
            Description = item.Description;
            OrderIndex = item.OrderIndex;
            Color = item.Color;
            Icon = item.Icon;
            ShortAlias = item.ShortAlias;
        }
    }
}
