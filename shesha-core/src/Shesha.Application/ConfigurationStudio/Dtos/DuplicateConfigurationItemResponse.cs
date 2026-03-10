using System;

namespace Shesha.ConfigurationStudio.Dtos
{
    /// <summary>
    /// Response of the `Duplicate Configuration Item` operation
    /// </summary>
    public class DuplicateConfigurationItemResponse
    {
        /// <summary>
        /// Created Configuration Item Id
        /// </summary>
        public required Guid ItemId { get; init; }
    }
}
