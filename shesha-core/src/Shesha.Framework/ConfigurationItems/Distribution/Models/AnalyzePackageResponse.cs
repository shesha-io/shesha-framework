using System;
using System.Collections.Generic;

namespace Shesha.ConfigurationItems.Distribution.Models
{
    /// <summary>
    /// Results of package analyze
    /// </summary>
    public class AnalyzePackageResponse
    {
        public List<PackageItemDto> Items { get; set; } = new ();

        /// <summary>
        /// Package item DTO
        /// </summary>
        public class PackageItemDto
        {
            public Guid Id { get; set; }
            public required string Name { get; set; }
            public string? Label { get; set; }
            public string? Description { get; set; }

            public PackageItemStatus Status { get; set; }
            public string? StatusDescription { get; set; }

            public string Type { get; set; }
            public DateTime? DateUpdated { get; set; }

            public string BaseModule { get; set; }
            public string? OverrideModule { get; set; }
        }

        public enum PackageItemStatus 
        {
            Unchanged = 1,
            New = 2,
            Updated = 3,
            Error = 4
        }
    }    
}
