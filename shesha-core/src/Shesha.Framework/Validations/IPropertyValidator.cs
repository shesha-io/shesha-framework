using Shesha.DynamicEntities.Dtos;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;

namespace Shesha.Validations
{
    public interface IPropertyValidator
    {
        Task<bool> ValidatePropertyAsync(object obj, string propertyName, List<ValidationResult> validationResult, ModelConfigurationDto? modelConfig = null);

        Task<bool> ValidatePropertyAsync(object obj, string propertyName, object? value, List<ValidationResult> validationResult, ModelConfigurationDto? modelConfig = null);

        Task<bool> ValidateObjectAsync(object obj, List<ValidationResult> validationResult, List<string>? propertiesToValidate = null, ModelConfigurationDto? modelConfig = null);
    }
}
