using Shesha.Domain.Enums;
using System;

namespace Shesha.Metadata.Dtos
{
    /// <summary>
    /// Generic model DTO. Is used by the forms designer
    /// </summary>
    public class ModelDto
    {
        public string ClassName { get; set; }
        public string Alias { get; set; }
        public string Description { get; set; }
        public Type Type { get; set; }
        public  bool Suppress { get; set; }
    }
}
