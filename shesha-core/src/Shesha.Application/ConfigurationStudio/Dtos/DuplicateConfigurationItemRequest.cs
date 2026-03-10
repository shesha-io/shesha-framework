using System;

namespace Shesha.ConfigurationStudio.Dtos
{
    /// <summary>
    /// Request of the `Duplicate Configuration Item` operation
    /// </summary>
    public class DuplicateConfigurationItemRequest
    {
        /// <summary>
        /// Id of the configuration item to duplicate
        /// </summary>
        public Guid ItemId { get; set; }
    }
}
