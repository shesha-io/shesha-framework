using Shesha.AutoMapper.Dto;
using System;
using System.ComponentModel.DataAnnotations;

namespace Shesha.ShaRoles.Dto
{
    public class CreateShaRoleDto
    {
        [Required]
        [StringLength(500)]
        public string Name { get; set; }

        [StringLength(200)]
        public string? NameSpace { get; set; }

        [StringLength(2000)]
        public string? Description { get; set; }

        public Guid? Module { get; set; }
        public Guid? RoleAppointmentType { get; set; }

        public bool? CanAssignToMultiple { get; set; }
        public bool? CanAssignToPerson { get; set; }
        public bool? CanAssignToRole { get; set; }
        public bool? CanAssignToOrganisationRoleLevel { get; set; }
        public bool? CanAssignToUnit { get; set; }
    }
}
