using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using Shesha.AutoMapper.Dto;
using Shesha.Domain;
using System;

namespace Shesha.Areas.Dto
{
    [AutoMap(typeof(Area))]
    public class AreaDto: EntityDto<Guid>
    {
        public required string Name { get; set; }
        public string? ShortName { get; set; }
        public EntityReferenceDto<Guid?>? ParentArea { get; set; }
        public string? Comments { get; set; }
        public ReferenceListItemValueDto? AreaType { get; set; }
    }
}
