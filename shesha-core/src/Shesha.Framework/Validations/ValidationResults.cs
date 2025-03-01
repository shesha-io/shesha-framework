using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Validations
{
    /// <summary>
    /// List of <see cref="ValidationResult"/>. Is used for simplification of coding
    /// </summary>
    public class ValidationResults: List<ValidationResult>
    {
        public void Add(string errorMessage)
        {
            Add(new ValidationResult(errorMessage));
        }

        public void Add(string errorMessage, IEnumerable<string> memberNames)
        {
            Add(new ValidationResult(errorMessage, memberNames));
        }
    }
}
