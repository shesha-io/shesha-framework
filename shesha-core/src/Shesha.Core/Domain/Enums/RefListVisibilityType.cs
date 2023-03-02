using Shesha.Domain.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Domain.Enums
{
    [ReferenceList("Shesha.Core", "VisibilityType")]
    public enum RefListVisibilityType
    {
        Private = 1,
        Public = 2,
        Owner = 3
    }
}
