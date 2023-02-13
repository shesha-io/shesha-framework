using Shesha.Domain.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Domain.Enums
{
    /// <summary>
    /// Indicate the type of the entity metadata 
    /// </summary>
    [ReferenceList("Shesha.Framework", "EntityConfigType")]
    public enum EntityConfigTypes
    {
        Class = 1,
        Interface = 2
    }
}
