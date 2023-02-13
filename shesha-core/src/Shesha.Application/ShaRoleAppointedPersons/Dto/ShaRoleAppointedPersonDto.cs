using System;
using System.Collections.Generic;
using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using Shesha.AutoMapper.Dto;
using Shesha.Domain;

namespace Shesha.ShaRoleAppointedPersons.Dto
{
    [AutoMapFrom(typeof(ShaRoleAppointedPerson))]
    public class ShaRoleAppointedPersonDto : EntityDto<Guid>, IShaRoleAppointedPersonDto
    {
        public Guid RoleId { get; set; }
        public EntityReferenceDto<Guid?> Person { get; set; }
        public List<EntityReferenceDto<Guid>> Regions { get; set; } = new List<EntityReferenceDto<Guid>>();
    }
}