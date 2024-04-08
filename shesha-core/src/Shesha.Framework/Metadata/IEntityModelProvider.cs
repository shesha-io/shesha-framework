using Shesha.Metadata.Dtos;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.Metadata
{
    /// <summary>
    /// Entity models provider
    /// </summary>
    public interface IEntityModelProvider
    {
        /// <summary>
        /// Get available entity models
        /// </summary>
        /// <returns></returns>
        Task<List<EntityModelDto>> GetModelsAsync();
    }
}
