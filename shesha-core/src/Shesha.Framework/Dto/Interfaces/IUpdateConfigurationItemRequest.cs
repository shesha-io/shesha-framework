using System;

namespace Shesha.Dto.Interfaces
{
    /// <summary>
    /// Update Configuration Item request
    /// </summary>
    public interface IUpdateConfigurationItemRequest
    {
        /// <summary>
        /// Configuration Item Id
        /// </summary>
        Guid Id { get; }
    }
}
