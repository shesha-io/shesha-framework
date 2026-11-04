using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using Shesha.AutoMapper.Dto;
using Shesha.Domain;
using System;
using System.Collections.Generic;

namespace Shesha.ShaRoleAppointedPersons.Dto
{
    [AutoMapFrom(typeof(ShaRoleAppointedPerson))]
    public class ShaRoleAppointedPersonDto : EntityDto<Guid>, IShaRoleAppointedPersonDto
    {
        public Guid RoleId { get; set; }
        public Guid PersonId { get; set; }
        public List<EntityReferenceDto<string>> PermissionedEntities { get; set; } = new List<EntityReferenceDto<string>>();
    }
}