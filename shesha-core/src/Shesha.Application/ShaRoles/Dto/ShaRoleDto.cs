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

        [Required]
        [MaxLength(500)]
        public string Name { get; set; }

        [MaxLength(200)]
        public string? NameSpace { get; set; }

        [MaxLength(2000)]
        public string? Description { get; set; }

        public Guid? Module { get; set; }

        public ConcurrentHashSet<string> Permissions { get; set; } = new();

        public bool? IsRegionSpecific { get; set; }

        public bool? CanAssignToMultiple { get; set; }
        public bool? CanAssignToPerson { get; set; }
        public bool? CanAssignToRole { get; set; }
        public bool? CanAssignToOrganisationRoleLevel { get; set; }
        public bool? CanAssignToUnit { get; set; }
    }
}