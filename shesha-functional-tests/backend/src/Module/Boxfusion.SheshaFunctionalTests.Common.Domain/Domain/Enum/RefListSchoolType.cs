using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using Intent.RoslynWeaver.Attributes;
using Shesha.Domain.Attributes;

[assembly: DefaultIntentManaged(Mode.Fully)]
[assembly: IntentTemplate("Boxfusion.Modules.Domain.Enum", Version = "1.0")]

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain.Enum
{
    /// <summary>
    /// 
    /// </summary>
    [ReferenceList("SheshaFunctionalTests", "SchoolType")]
    public enum RefListSchoolType : long
    {
        /// <summary>
        /// Primary
        /// </summary>
        [Description("Primary")]
        Primary = 1,

        /// <summary>
        /// Secondary
        /// </summary>
        [Description("Secondary")]
        Secondary = 2,

        /// <summary>
        /// High School
        /// </summary>
        [Display(Name = "High School")]
        [Description("High School")]
        HighSchool = 3,

        /// <summary>
        /// Teritary
        /// </summary>
        [Description("Teritary")]
        Teritary = 4
    }
}