using Abp.Application.Services.Dto;
using AutoMapper;
using Shesha.Domain;
using System;

namespace Shesha.Permissions.Dtos
{
    [AutoMap(typeof(ShaRolePermission))]
    public class ShaRolePermissionDto : EntityDto<Guid>
    {
        public virtual string Permission { get; set; }
        public virtual bool IsGranted { get; set; }
    }
}