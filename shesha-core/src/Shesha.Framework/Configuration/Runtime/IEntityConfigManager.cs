using Shesha.Domain;
using Shesha.DynamicEntities.Dtos;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Configuration.Runtime
{
    /// <summary>
    /// Entity config manager
    /// </summary>
    public interface IEntityConfigManager
    {
        Task<List<EntityConfigDto>> GetMainDataListAsync(IQueryable<EntityConfig> query = null, bool? implemented = null);
    }
}
