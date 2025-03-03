using Abp.Auditing;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.EntityHistory;
using System.Collections.Generic;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain
{
    // Allow to set any permission access (Disable, Inherited, AnyAuthenticated, RequiresPermissions, AllowAnonymous)
    //[CrudAccess(CrudActions.Update, Shesha.Domain.Enums.RefListPermissionedAccess.Disable)]
    //[CrudAccess(CrudActions.Delete, Shesha.Domain.Enums.RefListPermissionedAccess.Disable)]
    
    // Disable specific action
    //[CrudAccess(CrudActions.Update, false)]
    //[CrudAccess(CrudActions.Delete, false)]
    
    // Disable specific actions
    //[CrudDisableActions(CrudActions.Update | CrudActions.Delete)]
    public class Bus : Organisation
    { 
        [Audited]
        [ManyToMany(true)]
        public virtual IList<Person> People { get; set; } = new List<Person>();
        /// <summary>
        /// 
        /// </summary>
        [AuditedAsManyToMany]
        [ManyToMany(true)]
        public virtual IList<Person> Workers { get; set; } = new List<Person>();

    }
}
