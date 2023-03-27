using Shesha.Domain.Attributes;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
