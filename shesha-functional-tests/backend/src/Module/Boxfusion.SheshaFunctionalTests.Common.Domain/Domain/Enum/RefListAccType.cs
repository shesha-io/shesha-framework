using Shesha.Domain.Attributes;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain.Enum
{
    [ReferenceList("Boxfusion.SheshaFunctionalTests.Domain.Enum", "AccType")]
    public enum RefListAccType: long
    {
        [Display(Name = "Savings Account")]
        Savings = 1,

        [Display(Name = "32 Day Flexi Notice")]
        FlexiNotice = 2,

        [Display(Name = "Fixed Deposit Account")]
        Fixed = 3,

        [Display(Name = "Current Account")]
        Current = 4
    }
}
