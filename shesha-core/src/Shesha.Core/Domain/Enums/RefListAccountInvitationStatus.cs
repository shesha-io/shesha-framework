using Shesha.Domain.Attributes;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Domain.Enums
{
    /// <summary>
    /// Status of an account invitation
    /// </summary>
    [ReferenceList("Shesha.Core", "AccountInvitationStatus")]
    public enum RefListAccountInvitationStatus: long
    {

        [Description("Invited")]
        [Display(Name = "Invited")]
        Invited = 1,

        [Description("Registered")]
        [Display(Name = "Registered")] 
        Registered = 2,

        [Description("Expired")]
        [Display(Name = "Expired")]
        Expired = 3,

        [Description("Cancelled")]
        [Display(Name = "Cancelled")]
        Cancelled = 4
    }
}

