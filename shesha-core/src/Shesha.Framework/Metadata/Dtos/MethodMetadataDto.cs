using System.Collections.Generic;

namespace Shesha.Metadata.Dtos
{
    /// <summary>
    /// Method metadata
    /// </summary>
    public class MethodMetadataDto
    {
        public string Name { get; set; }
        public string? Description { get; set; }
        public List<VariableDef> Arguments { get; set; }
        public DataTypeInfo? ReturnType { get; set; }
        public bool IsAsync { get; set; }
    }
}
