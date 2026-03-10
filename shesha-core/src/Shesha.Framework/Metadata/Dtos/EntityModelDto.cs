using System;

namespace Shesha.Metadata.Dtos
{
    public class EntityModelDto: ModelDto
    {
        public string? Accessor { get; set; }
        public string? ModuleAccessor { get; set; }
        public bool ModuleIsEnabled { get; set; }
        public string? Md5 { get; set; }
        public DateTime? ModificationTime { get; set; }

        public MetadataDto Metadata { get; set; }
    }
}
