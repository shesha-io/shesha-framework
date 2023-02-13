using Abp.Dependency;
using Shesha.Domain;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Validations
{
    public interface IObjectValidatorManager
    {
        Task<bool> ValidateProperty(object obj, string propertyName, object value, List<ValidationResult> validationResult);

        Task<bool> ValidateObject(object obj, List<ValidationResult> validationResult, List<string> propertiesToValidate = null);
    }
}
