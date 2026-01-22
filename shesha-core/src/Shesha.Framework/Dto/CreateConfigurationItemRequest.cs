using Shesha.Dto.Interfaces;
using System;

namespace Shesha.Dto
{
    /// <summary>
    /// Create Configuration Item request
    /// </summary>
    public class CreateConfigurationItemRequest : ICreateConfigurationItemRequest
    {
        public Guid ModuleId { get; set; }

        public Guid? FolderId { get; set; }

        public string ItemType { get; set; }

        public string Name { get; set; }

        public Guid? PrevItemId { get; set; }

        /// <summary>
        /// User-friendly label
        /// </summary>
        public string? Label { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string? Description { get; set; }
    }
}