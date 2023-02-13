using System;

namespace Shesha.ConfigurationItems.Models
{
    /// <summary>
    /// Move item to module input
    /// </summary>
    public class MoveItemToModuleInput
    {
        /// <summary>
        /// Item id
        /// </summary>
        public Guid ItemId { get; set; }

        /// <summary>
        /// Module Id
        /// </summary>
        public Guid ModuleId { get; set; }
    }
}
