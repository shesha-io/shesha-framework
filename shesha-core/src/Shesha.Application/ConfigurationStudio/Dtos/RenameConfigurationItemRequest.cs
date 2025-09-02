using System;

namespace Shesha.ConfigurationStudio.Dtos
{
    /// <summary>
    /// Input of the `Rename Configuration Item` operation
    /// </summary>
    public class RenameConfigurationItemRequest
    {
        /// <summary>
        /// Folder Id
        /// </summary>
        public Guid ItemId { get; set; }
        
        /// <summary>
        /// Name
        /// </summary>
        public string Name { get; set; }
    }
}
