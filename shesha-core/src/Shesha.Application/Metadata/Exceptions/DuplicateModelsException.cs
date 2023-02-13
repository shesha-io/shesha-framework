using Shesha.Metadata.Dtos;
using System;
using System.Collections.Generic;

namespace Shesha.Metadata.Exceptions
{
    /// <summary>
    /// Duplicate models exception
    /// </summary>
    public class DuplicateModelsException: Exception
    {
        public List<ModelDto> Duplicates { get; set; } = new List<ModelDto>();

        public DuplicateModelsException(List<ModelDto> duplicates) : base($"Found multiple models with the same {nameof(ModelDto.ClassName)} or {nameof(ModelDto.Alias)}")
        {
            Duplicates = duplicates;
        }
    }
}
