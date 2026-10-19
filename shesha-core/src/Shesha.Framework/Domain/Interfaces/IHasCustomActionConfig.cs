using Shesha.Domain.Enums;
using System.Collections.Generic;

namespace Shesha.Domain.Interfaces
{
    /// <summary>
    /// Entity CRUD configuration with custom actions config
    /// </summary>
    public interface IHasCustomActionConfig
    {
        public Dictionary<CrudAction, ICrudActionConfig> CustomActionConfig { get; }
    }

}
