using System;

namespace Shesha.ConfigurationItems.Distribution
{
    /// <summary>
    /// Base model of the configurable item
    /// </summary>
    public class DistributedConfigurableItemBase
    {
        /// <summary>
        /// Identifier
        /// </summary>
        public Guid? Id { get; set; }

        /// <summary>
        /// The Guid for the Config Item.
        /// Different versions for the same Config Item will share this Id which the very first version of the item will be responsible for generating.
        /// </summary>
        public Guid? OriginId { get; set; }

        /// <summary>
        /// Item name
        /// </summary>
        public required string Name { get; set; }

        /// <summary>
        /// Label of the con
        /// </summary>
        public string? Label { get; set; }

        /// <summary>
        /// Item name
        /// </summary>
        public required string ItemType { get; set; }

        /// <summary>
        /// Item description
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// Module name
        /// </summary>
        public string? ModuleName { get; set; }

        /// <summary>
        /// Front-end application name
        /// </summary>
        public string? FrontEndApplication { get; set; }

        /// <summary>
        /// If true, it means that the item will not be visible to Config or End-users/Admins.
        /// </summary>
        public bool Suppress { get; set; }
    }
}
