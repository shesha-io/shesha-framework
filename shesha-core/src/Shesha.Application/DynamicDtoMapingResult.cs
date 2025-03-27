using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace Shesha
{
    public class DynamicDtoMapingResult
    {
        public bool HasValidationError => ValidationResults.Any();

        public List<ValidationResult> ValidationResults { get; set; } = new List<ValidationResult>();
    }
}
