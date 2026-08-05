using Shesha.Dto.Interfaces;
using System;

namespace Shesha.Dto
{
    /// <summary>
    /// Create Configuration Item request
    /// </summary>
    public class CreateConfigurationItemRequest : ICreateConfigurationItemRequest
    {
        /// <summary>
        /// Module id
        /// </summary>
        public Guid ModuleId { get; set; }

        /// <summary>
        /// Folder id
        /// </summary>
        public Guid? FolderId { get; set; }
        
        /// <summary>
        /// Front-end application id
        /// </summary>
        public Guid? FrontEndAppId { get; set; }

        public string ItemType { get; set; }
        public string Discriminator { get; set; }

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