using Shesha.DynamicEntities.Dtos;
using System;

namespace Shesha.DynamicEntities
{
    /// <summary>
    /// Dynamic application service helper
    /// </summary>
    public static class DynamicAppServiceHelper
    {
        /// <summary>
        /// Make dynamic application service type by entity type
        /// </summary>
        /// <param name="entityType"></param>
        /// <returns></returns>
        public static Type? MakeApplicationServiceType(Type entityType)
        {
            var idType = entityType.GetProperty("Id")?.PropertyType;
            if (idType == null)
                return null;

            var dtoType = typeof(DynamicDto<,>).MakeGenericType(entityType, idType);
            var createDtoType = typeof(CreateDynamicDto<,>).MakeGenericType(entityType, idType);
            var updateDtoType = typeof(UpdateDynamicDto<,>).MakeGenericType(entityType, idType);

            var appServiceType = typeof(DynamicCrudAppService<,,,,>).MakeGenericType(entityType, dtoType, createDtoType, updateDtoType, idType);

            return appServiceType;
        }
    }
}
