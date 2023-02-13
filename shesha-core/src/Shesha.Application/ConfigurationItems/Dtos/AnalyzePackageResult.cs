using System;
using System.Collections.Generic;

namespace Shesha.ConfigurationItems.Dtos
{
    /// <summary>
    /// Results of package analyze
    /// </summary>
    public class AnalyzePackageResult
    {
        public List<PackageModuleDto> Modules { get; set; } = new List<PackageModuleDto>();
    }

    /// <summary>
    /// Package item DTO
    /// </summary>
    public class PackageItemDto
    {
        public Guid? Id { get; set; }
        public string Name { get; set; }
        public string Label { get; set; }
        public string Description { get; set; }
        public string FrontEndApplication { get; set; }
    }

    public class PackageItemTypeDto
    {
        public string Name { get; set; }
        public List<PackageItemDto> Items { get; set; } = new List<PackageItemDto>();
    }

    public class PackageModuleDto 
    {
        public string Name { get; set; }
        public List<PackageItemTypeDto> ItemTypes { get; set; } = new List<PackageItemTypeDto>();
    }
}
