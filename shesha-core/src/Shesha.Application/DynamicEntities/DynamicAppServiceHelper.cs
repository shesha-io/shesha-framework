using Shesha.DynamicEntities.Dtos;
using System;

namespace Shesha.DynamicEntities
{
    /// <summary>
    /// Dynamic application service helper
    /// </summary>
    public static class DynamicAppServiceHelper
    {
        public static Type MakeApplicationServiceType(Type entityType)
        {
            var idType = entityType.GetProperty("Id")?.PropertyType;
            if (idType == null)
                return null;

            var dtoType = typeof(DynamicDto<,>).MakeGenericType(entityType, idType);

            var appServiceType = typeof(DynamicCrudAppService<,,>).MakeGenericType(entityType, dtoType, idType);

            return appServiceType;
        }
    }
}
