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
    [ReferenceList("SheshaFunctionalTests", "Religion")]
    public enum RefListReligion : long
    {

        /// <summary>
        /// 
        /// </summary>
        Christianity = 1,
        /// <summary>
        /// 
        /// </summary>
        Islam = 2,
        /// <summary>
        /// 
        /// </summary>
        Hinduism = 3,
        /// <summary>
        /// 
        /// </summary>
        Judaism = 4,
        /// <summary>
        /// 
        /// </summary>
        Other = 5,

        /// <summary>
        /// Not Applicable
        /// </summary>
        [Display(Name = "Not Applicable")]
        [Description("Not Applicable")]
        NA = 6,
    }
}
