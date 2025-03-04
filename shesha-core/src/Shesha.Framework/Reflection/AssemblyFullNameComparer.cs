using Shesha.Extensions;
using System.Collections.Generic;
using System.Reflection;

namespace Shesha.Reflection
{
    public class AssemblyFullNameComparer : EqualityComparer<Assembly>
    {
        public override bool Equals(Assembly? x, Assembly? y)
        {
            return x != null && y != null && x.FullName == y.FullName || x == null && y == null;
        }

        public override int GetHashCode(Assembly obj)
        {
            return obj.GetRequiredFullName().GetHashCode();
        }
    }
}
