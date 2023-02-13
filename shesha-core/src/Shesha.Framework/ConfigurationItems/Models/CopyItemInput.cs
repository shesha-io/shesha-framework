using System;

namespace Shesha.ConfigurationItems.Models
{
    /// <summary>
    /// Copy for input
    /// </summary>
    public class CopyItemInput
    {
        /// <summary>
        /// Item id
        /// </summary>
        public Guid ItemId { get; set; }

        /// <summary>
        /// Module Id
        /// </summary>
        public Guid ModuleId { get; set; }

        /// <summary>
        /// Name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Label
        /// </summary>
        public string Label { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string Description { get; set; }
    }
}
