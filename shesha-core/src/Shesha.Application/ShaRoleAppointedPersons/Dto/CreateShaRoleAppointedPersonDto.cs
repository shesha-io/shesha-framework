using System;
using System.Collections.Generic;
using Shesha.AutoMapper.Dto;

namespace Shesha.ShaRoleAppointedPersons.Dto
{
    public class CreateShaRoleAppointedPersonDto: IShaRoleAppointedPersonDto
    {
        public Guid RoleId { get; set; }
        public EntityReferenceDto<Guid?> Person { get; set; }
        public List<EntityReferenceDto<Guid>> Regions { get; set; } = new List<EntityReferenceDto<Guid>>();
    }
}
