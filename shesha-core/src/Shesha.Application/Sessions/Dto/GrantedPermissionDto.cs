using Shesha.AutoMapper.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Sessions.Dto
{
    public class GrantedPermissionDto
    {
        public string Permission {  get; set; }

        public List<EntityReferenceDto<string>> PermissionedEntity { get; set; } = new List<EntityReferenceDto<string>>();
    }
}
