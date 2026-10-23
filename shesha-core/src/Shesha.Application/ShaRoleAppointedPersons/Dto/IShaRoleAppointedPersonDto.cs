using System;
using System.Collections.Generic;
using Shesha.AutoMapper.Dto;

namespace Shesha.ShaRoleAppointedPersons.Dto
{
    public interface IShaRoleAppointedPersonDto
    {
        Guid RoleId { get; set; }
        Guid PersonId { get; set; }
        List<EntityReferenceDto<string>> PermissionedEntities { get; set; }
    }
}
