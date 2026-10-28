using Shesha.Domain.Attributes;
using System.ComponentModel.DataAnnotations;

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
