using Shesha.Domain.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Domain.Enums
{
    [ReferenceList("Shesha.Framework", "SecurityQuestionStatus")]
    public enum RefListSecurityQuestionStatus
    {
        NotApplicable = 1,
        Set = 2,
        NotSet = 3,
    }
}
