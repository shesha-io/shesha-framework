using System;

namespace Shesha.Metadata.Dtos
{
    public class EntityModelDto: ModelDto
    {
        public string Accessor { get; set; }
        public string ModuleAccessor { get; set; }
        public string MD5 { get; set; }
        public DateTime ModificationTime { get; set; }
    }
}
