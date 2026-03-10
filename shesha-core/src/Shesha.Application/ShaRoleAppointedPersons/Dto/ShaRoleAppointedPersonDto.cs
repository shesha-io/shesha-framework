using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using Shesha.AutoMapper.Dto;
using Shesha.Domain;
using System;

namespace Shesha.ShaRoleAppointedPersons.Dto
{
    [AutoMapFrom(typeof(ShaRoleAppointedPerson))]
    public class ShaRoleAppointedPersonDto : EntityDto<Guid>, IShaRoleAppointedPersonDto
    {
        public Guid RoleId { get; set; }
        public EntityReferenceDto<Guid?> Person { get; set; }
    }
}