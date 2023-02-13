using System;

namespace Shesha.ConfigurationItems.Models
{
    /// <summary>
    /// Create new version input
    /// </summary>
    public class CreateItemNewVersionInput
    {
        /// <summary>
        /// Id of the current version
        /// </summary>
        public Guid Id { get; set; }
    }
}
