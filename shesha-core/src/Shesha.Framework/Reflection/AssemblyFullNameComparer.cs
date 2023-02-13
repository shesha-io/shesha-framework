using System.Collections.Generic;
using System.Reflection;

namespace Shesha.Reflection
{
    public class AssemblyFullNameComparer : EqualityComparer<Assembly>
    {
        public override bool Equals(Assembly x, Assembly y)
        {
            return x.FullName == y.FullName;
        }

        public override int GetHashCode(Assembly obj)
        {
            return obj.FullName.GetHashCode();
        }
    }
}
