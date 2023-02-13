using System;
using Abp.Application.Services.Dto;
using Shesha.AutoMapper.Dto;

namespace Shesha.Areas.Dto
{
    public class AreaUpdateDto : EntityDto<Guid>
    {
        public string Name { get; set; }
        public string ShortName { get; set; }
        public string Comments { get; set; }
        public ReferenceListItemValueDto AreaType { get; set; }
    }
}
