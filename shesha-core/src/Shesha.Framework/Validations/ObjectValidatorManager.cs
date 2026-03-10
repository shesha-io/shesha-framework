using Abp.Dependency;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;

namespace Shesha.Validations
{
    public class ObjectValidatorManager : IObjectValidatorManager, ITransientDependency
    {

        private readonly IIocManager _iocManager;
        private IPropertyValidator[] _validators;
        private IPropertyValidator[] Validators => _validators = _validators ?? _iocManager.ResolveAll<IPropertyValidator>();

        public ObjectValidatorManager(IIocManager iocManager)
        {
            _iocManager = iocManager;
        }

        public async Task<bool> ValidatePropertyAsync(object obj, string propertyName, List<ValidationResult> validationResult)
        {
            validationResult ??= new List<ValidationResult>();
            return await ValidateAsync((v) => v.ValidatePropertyAsync(obj, propertyName, validationResult));
        }

        public async Task<bool> ValidatePropertyAsync(object obj, string propertyName, object? value, List<ValidationResult> validationResult)
        {
            validationResult ??= new List<ValidationResult>();
            return await ValidateAsync((v) => v.ValidatePropertyAsync(obj, propertyName, value, validationResult));
        }

        public async Task<bool> ValidateObjectAsync(object obj, List<ValidationResult>? validationResult = null, List<string>? propertiesToValidate = null)
        {
            validationResult ??= new List<ValidationResult>();
            return await ValidateAsync((v) => v.ValidateObjectAsync(obj, validationResult, propertiesToValidate));
        }

        private async Task<bool> ValidateAsync(Func<IPropertyValidator, Task<bool>> action)
        {
            var result = true;
            foreach (var validator in Validators) 
                result = await action(validator) && result;
            return result;
        }
    }
}
