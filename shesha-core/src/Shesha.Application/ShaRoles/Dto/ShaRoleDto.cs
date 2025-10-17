using Abp.Application.Services.Dto;
using ConcurrentCollections;
using System;
using System.ComponentModel.DataAnnotations;

namespace Shesha.ShaRoles.Dto
{
    public class ShaRoleDto : EntityDto<Guid>
    {

        public ShaRoleDto()
        {
            Permissions = new ConcurrentHashSet<string>();
        }

        [MaxLength(200)]
        public string? Label { get; set; }

        public string? Description { get; set; }

        public ConcurrentHashSet<string> Permissions { get; set; } = new();
    }
}