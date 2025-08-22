using Abp.Reflection;
using System.Collections.Generic;
using System.Reflection;

namespace Shesha.DynamicEntities.TypeFinder
{
    public interface IShaTypeFinder: ITypeFinder
    {
        List<Assembly> GetDynamicEntityAssemblies();
    }
}
