using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Abp.Application.Services.Dto;
using ConcurrentCollections;
using Shesha.Permissions.Dtos;

namespace Shesha.ShaRoles.Dto
{
    public class ShaRoleDto : EntityDto<Guid>
    {

        public ShaRoleDto()
        {
            Permissions = new ConcurrentHashSet<string>();
        }

        [Required]
        [StringLength(500)]
        public string Name { get; set; }

        [StringLength(200)]
        public string NameSpace { get; set; }

        [StringLength(2000)]
        public string Description { get; set; }

        public ConcurrentHashSet<string> Permissions { get; set; }

        public bool IsRegionSpecific { get; set; }

        public bool CanAssignToMultiple { get; set; }
        public bool CanAssignToPerson { get; set; }
        public bool CanAssignToRole { get; set; }
        public bool CanAssignToOrganisationRoleLevel { get; set; }
        public bool CanAssignToUnit { get; set; }
    }
}