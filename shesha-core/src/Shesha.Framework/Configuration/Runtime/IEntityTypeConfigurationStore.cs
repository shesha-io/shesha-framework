using System;
using System.Threading.Tasks;

namespace Shesha.Configuration.Runtime
{
    /// <summary>
    /// Stores information about entities
    /// </summary>
    public interface IEntityTypeConfigurationStore
    {
        Task InitializeDynamicAsync();

        /// <summary>
        /// Returns <see cref="EntityTypeConfiguration"/> by entity type
        /// </summary>
        EntityTypeConfiguration Get(Type entityType);

        /// <summary>
        /// Returns <see cref="EntityTypeConfiguration"/> by class name or type short alias
        /// </summary>
        EntityTypeConfiguration Get(string nameOrAlias);

        /// <summary>
        /// Returns <see cref="EntityTypeConfiguration"/> by class name or type short alias
        /// </summary>
        EntityTypeConfiguration? GetOrNull(string nameOrAlias);

        /// <summary>
        /// Register default application service for entity type
        /// </summary>
        /// <param name="entityType"></param>
        /// <param name="applicationServiceType"></param>
        void SetDefaultAppService(Type entityType, Type applicationServiceType);

        Task ReInitializeAsync();
    }
}
