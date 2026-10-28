using Abp.Application.Services.Dto;
using System;

namespace Shesha.Areas.Dto
{
    public class AreaTreeItemDto : EntityDto<Guid>
    {
        public string Name { get; set; }
        public Guid? ParentId { get; set; }
        public bool HasChilds { get; set; }
    }
}
