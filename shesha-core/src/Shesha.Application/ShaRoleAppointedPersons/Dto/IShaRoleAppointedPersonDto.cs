using Shesha.AutoMapper.Dto;
using System;

namespace Shesha.ShaRoleAppointedPersons.Dto
{
    public interface IShaRoleAppointedPersonDto
    {
        Guid RoleId { get; }
        EntityReferenceDto<Guid?> Person { get; }
    }
}
