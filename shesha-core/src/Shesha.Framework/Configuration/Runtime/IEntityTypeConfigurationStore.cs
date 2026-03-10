using Shesha.Domain;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.Configuration.Runtime
{
    /// <summary>
    /// Stores information about entities
    /// </summary>
    public interface IEntityTypeConfigurationStore
    {
        Task InitializeHardcodedAsync(bool resetMapping = true, List<EntityConfig>? entityConfigs = null);

        Task InitializeDynamicAsync(List<EntityConfig>? entityConfigs = null);

        /// <summary>
        /// Returns <see cref="EntityTypeConfiguration"/> by entity type
        /// </summary>
        EntityTypeConfiguration Get(Type entityType);

        /// <summary>
        /// Returns <see cref="EntityTypeConfiguration"/> by class name or type short alias
        /// </summary>
        EntityTypeConfiguration Get(string nameOrAlias);

        /// <summary>
        /// Returns <see cref="EntityTypeConfiguration"/> by module and name
        /// </summary>
        EntityTypeConfiguration Get(string? module, string name);

        /// <summary>
        /// Returns <see cref="EntityTypeConfiguration"/> by class name or type short alias
        /// </summary>
        EntityTypeConfiguration? GetOrNull(string nameOrAlias);

        /// <summary>
        /// Returns <see cref="EntityTypeConfiguration"/> by module and name
        /// </summary>
        EntityTypeConfiguration? GetOrNull(string? module, string name);

        /// <summary>
        /// Register default application service for entity type
        /// </summary>
        /// <param name="entityType"></param>
        /// <param name="applicationServiceType"></param>
        void SetDefaultAppService(Type entityType, Type applicationServiceType);

        Task ReInitializeAsync();
    }
}
