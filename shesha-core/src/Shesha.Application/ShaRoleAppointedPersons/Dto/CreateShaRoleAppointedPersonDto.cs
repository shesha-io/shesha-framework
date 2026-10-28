using Shesha.AutoMapper.Dto;
using System;
using System.Collections.Generic;

namespace Shesha.ShaRoleAppointedPersons.Dto
{
    public class CreateShaRoleAppointedPersonDto : IShaRoleAppointedPersonDto
    {
        public Guid RoleId { get; set; }
        public EntityReferenceDto<Guid?> Person { get; set; }
        public List<EntityReferenceDto<Guid>> Regions { get; set; } = new List<EntityReferenceDto<Guid>>();
    }
}
