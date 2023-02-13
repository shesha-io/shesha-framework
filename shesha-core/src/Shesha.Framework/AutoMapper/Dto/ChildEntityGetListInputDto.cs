using System;
using Abp.Application.Services.Dto;
using Shesha.Application.Services.Dto;

namespace Shesha.AutoMapper.Dto
{
    /// <summary>
    /// Generic Dto for getting list of child entities by owner
    /// </summary>
    public class ChildEntityGetListInputDto : FilteredPagedAndSortedResultRequestDto
    {
        /// <summary>
        /// Id of the owner entity
        /// </summary>
        public virtual string OwnerId { get; set; }

        /// <summary>
        /// Type short alias of the owner entity
        /// </summary>
        public virtual string OwnerType { get; set; }
    }
}
