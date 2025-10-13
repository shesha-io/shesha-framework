using Shesha.Dto.Interfaces;
using System;
using System.Collections.Generic;

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

        
    }
}