using System;
using Abp.AutoMapper;
using Shesha.AutoMapper.Dto;
using Shesha.Domain;

namespace Shesha.Areas.Dto
{
    [AutoMapTo(typeof(Area))]
    public class AreaCreateDto
    {
        public string Name { get; set; }
        public string ShortName { get; set; }
        public EntityReferenceDto<Guid?> ParentArea { get; set; }
        public string Comments { get; set; }
        public ReferenceListItemValueDto AreaType { get; set; }
    }
}
