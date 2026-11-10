using System;
using System.Collections.Generic;
using Shesha.AutoMapper.Dto;

namespace Shesha.ShaRoleAppointedPersons.Dto
{
    public class CreateShaRoleAppointedPersonDto: IShaRoleAppointedPersonDto
    {
        public Guid RoleId { get; set; }
        public Guid PersonId { get; set; }
        public List<EntityReferenceDto<string>> PermissionedEntities { get; set; } = new List<EntityReferenceDto<string>>();
    }
}
