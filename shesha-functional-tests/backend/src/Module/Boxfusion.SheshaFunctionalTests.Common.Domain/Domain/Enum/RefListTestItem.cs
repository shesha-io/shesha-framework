using DocumentFormat.OpenXml.Wordprocessing;
using Shesha.Domain.Attributes;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain.Enum
{
    [ReferenceList("Boxfusion.SheshaFunctionalTests.Domain.Enum", "TestItem")]
    public enum RefListTestItem: long
    {
        [Display(Name = "01 - Red"), Description("Red item")]
        Red = 1,

        [Display(Name = "02 - Ruby"), Description("Ruby item")]
        Ruby = 2,

        [Display(Name = "03 - Blue"), Description("Baby blue item")]
        Blue = 3,
    }
}
