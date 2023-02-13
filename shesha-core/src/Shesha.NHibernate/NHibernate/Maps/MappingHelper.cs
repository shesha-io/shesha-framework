using NHibernate.Mapping.ByCode;
using Shesha.Domain;
using System.Reflection;

namespace Shesha.NHibernate.Maps
{
    public static class NhMappingHelper
    {
        /// <summary>
        /// Returns true if the property is persisted to the DB
        /// </summary>
        /// <param name="prop"></param>
        /// <returns></returns>
        public static bool IsPersistentProperty(MemberInfo prop)
        {
            if (!MappingHelper.IsPersistentProperty(prop))
                return false;

            if (!MappingHelper.IsRootEntity(prop.DeclaringType) && prop.DeclaringType.BaseType != null && !prop.DeclaringType.BaseType.IsAbstract)
            {
                var upperLevelProperty = prop.DeclaringType.BaseType.GetProperty(prop.Name);
                if (upperLevelProperty != null)
                {
                    if (MappingHelper.GetColumnName(prop) == MappingHelper.GetColumnName(upperLevelProperty))
                        return false;
                }
            }

            var inspector = new SimpleModelInspector() as IModelInspector;
            return inspector.IsPersistentProperty(prop);
        }
    }
}
