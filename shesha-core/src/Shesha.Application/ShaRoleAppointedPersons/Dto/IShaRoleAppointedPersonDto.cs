using Shesha.AutoMapper.Dto;
using System;
using System.Collections.Generic;

namespace Shesha.ShaRoleAppointedPersons.Dto
{
    public interface IShaRoleAppointedPersonDto
    {
        Guid RoleId { get; set; }
        Guid PersonId { get; set; }
        List<EntityReferenceDto<string>> PermissionedEntities { get; set; }
    }
}
