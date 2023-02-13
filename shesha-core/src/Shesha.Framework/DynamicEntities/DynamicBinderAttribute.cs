using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities
{
    [AttributeUsage(AttributeTargets.Parameter, AllowMultiple = false)]
    public class DynamicBinderAttribute: Attribute, IDynamicMappingSettings
    {
        public bool UseDtoForEntityReferences { get; set; } = false;
        public bool UseDynamicDtoProxy { get; set; } = false;
    }
}
