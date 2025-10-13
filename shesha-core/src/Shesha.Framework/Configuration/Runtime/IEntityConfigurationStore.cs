using System;
using System.Threading.Tasks;

namespace Shesha.Configuration.Runtime
{
    /// <summary>
    /// Stores information about entities
    /// </summary>
    public interface IEntityConfigurationStore
    {
        Task InitializeDynamicAsync();

        /// <summary>
        /// Returns <see cref="EntityConfiguration"/> by entity type
        /// </summary>
        EntityConfiguration Get(Type entityType);

        /// <summary>
        /// Returns <see cref="EntityConfiguration"/> by class name or type short alias
        /// </summary>
        EntityConfiguration Get(string nameOrAlias);

        /// <summary>
        /// Returns <see cref="EntityConfiguration"/> by class name or type short alias
        /// </summary>
        EntityConfiguration? GetOrNull(string nameOrAlias);

        /// <summary>
        /// Register default application service for entity type
        /// </summary>
        /// <param name="entityType"></param>
        /// <param name="applicationServiceType"></param>
        void SetDefaultAppService(Type entityType, Type applicationServiceType);

        Task ReInitializeAsync();
    }
}
