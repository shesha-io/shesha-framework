using System;
using System.Collections.Generic;
using Shesha.AutoMapper.Dto;

namespace Shesha.ShaRoleAppointedPersons.Dto
{
    public interface IShaRoleAppointedPersonDto
    {
        Guid RoleId { get; }
        EntityReferenceDto<Guid?> Person { get; }
        List<EntityReferenceDto<Guid>> Regions { get; }
    }
}
