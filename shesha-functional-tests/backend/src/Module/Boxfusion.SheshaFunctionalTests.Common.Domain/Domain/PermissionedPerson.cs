using Shesha.Authorization;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain
{
    public class PermissionedPerson : Person
    {
        [SheshaAuthorize(RefListPermissionedAccess.AnyAuthenticated)]
        public override RefListGender? Gender { get => base.Gender; set => base.Gender = value; }

        [SheshaAuthorize(RefListPermissionedAccess.RequiresPermissions, ["CRUDPermission"])]
        public override Address Address { get => base.Address; set => base.Address = value; }
        
        [SheshaAuthorize(RefListPermissionedAccess.RequiresPermissions, ["CRUDPermission"])]
        public override string EmailAddress1 { get => base.EmailAddress1; set => base.EmailAddress1 = value; }
    }
}
