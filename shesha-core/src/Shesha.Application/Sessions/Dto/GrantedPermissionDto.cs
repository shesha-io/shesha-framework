using Shesha.AutoMapper.Dto;
using System.Collections.Generic;

namespace Shesha.Sessions.Dto
{
    public class GrantedPermissionDto
    {
        public string Permission {  get; set; }

        public List<EntityReferenceDto<string>> PermissionedEntity { get; set; } = new List<EntityReferenceDto<string>>();
    }
}
