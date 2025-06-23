using System;

namespace Shesha.ConfigurationStudio.Dtos
{
    /// <summary>
    /// Input of the `Delete Configuration Item` operation
    /// </summary>
    public class DeleteConfigurationItemRequest
    {
        /// <summary>
        /// Folder Id
        /// </summary>
        public Guid ItemId { get; set; }
    }
}
