using System;
using System.Linq;

namespace Shesha.GraphQL
{
    /// <summary>
    /// Partial copy of Abp.IO's TypeHelper. To be removed after migration to Abp.IO 
    /// </summary>
    public static class TypeHelper
    {
        public static Type GetFirstGenericArgumentIfNullable(this Type t)
        {
            if (t.GetGenericArguments().Length != 0 && t.GetGenericTypeDefinition() == typeof(Nullable<>))
            {
                return t.GetGenericArguments().FirstOrDefault();
            }

            return t;
        }
    }
}
