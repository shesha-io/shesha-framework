using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities.Cache
{
    /// <summary>
    /// Dynamic DTO cache item
    /// </summary>
    public class DynamicDtoProxyCacheItem
    {
        public Type DtoType { get; set; }
        public Dictionary<string, Type> NestedClasses = new Dictionary<string, Type>();
    }
}
