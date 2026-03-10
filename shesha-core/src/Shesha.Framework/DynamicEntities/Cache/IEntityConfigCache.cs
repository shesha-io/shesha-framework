using Shesha.DynamicEntities.Dtos;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities.Cache
{
    /// <summary>
    /// Entity config cache
    /// </summary>
    public interface IEntityConfigCache
    {
        /// <summary>
        /// Get entity properties
        /// </summary>
        /// <param name="entityType"></param>
        /// <returns></returns>
        Task<List<EntityPropertyDto>?> GetEntityPropertiesAsync(Type entityType);
        Task<List<EntityPropertyDto>?> GetEntityPropertiesAsync(string entityType, bool raiseException = false);

        Task<EntityConfigDto?> GetDynamicSafeEntityConfigAsync(string entityType);
        Task<List<EntityPropertyDto>?> GetDynamicSafeEntityPropertiesAsync(string entityType);

        Task<EntityConfigDto?> GetEntityConfigAsync(Type entityType);
        Task<EntityConfigDto?> GetEntityConfigAsync(string entityType, bool raiseException = false);
    }
}
