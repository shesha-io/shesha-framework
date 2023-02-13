using Shesha.Metadata.Dtos;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.Metadata
{
    /// <summary>
    /// Models provider
    /// </summary>
    public interface IModelProvider
    {
        /// <summary>
        /// Get available models
        /// </summary>
        /// <returns></returns>
        Task<List<ModelDto>> GetModelsAsync();

        /// <summary>
        /// Get model type by name or alias
        /// </summary>
        /// <returns></returns>
        Task<Type> GetModelTypeAsync(string nameOrAlias);

        /// <summary>
        /// Clear models cache
        /// </summary>
        /// <returns></returns>
        Task ClearCache();
    }
}
