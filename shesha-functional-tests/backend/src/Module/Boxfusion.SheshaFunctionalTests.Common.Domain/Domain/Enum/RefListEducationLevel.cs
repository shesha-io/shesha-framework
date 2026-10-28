using Shesha.Domain.Attributes;
using System.ComponentModel;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain.Enum
{
    /// <summary>
    /// 
    /// </summary>
    [ReferenceList("SheshaFunctionalTests", "EducationLevel")]
    public enum RefListEducationLevel : long
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
        /// Tertiarty
        /// </summary>
        [Description("Tertiarty")]
        Tertiarty = 3
    }
}
