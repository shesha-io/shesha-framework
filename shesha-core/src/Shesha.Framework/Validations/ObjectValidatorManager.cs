using Abp.Dependency;
using Abp.Domain.Uow;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
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

        public async Task<bool> ValidateProperty(object obj, string propertyName, object value, List<ValidationResult> validationResult)
        {
            validationResult ??= new List<ValidationResult>();
            return await Validate((v) => v.ValidateProperty(obj, propertyName, value, validationResult));
        }

        public async Task<bool> ValidateObject(object obj, List<ValidationResult> validationResult = null, List<string> propertiesToValidate = null)
        {
            validationResult ??= new List<ValidationResult>();
            return await Validate((v) => v.ValidateObject(obj, validationResult, propertiesToValidate));
        }

        private async Task<bool> Validate(Func<IPropertyValidator, Task<bool>> action)
        {
            var result = true;
            foreach (var validator in Validators) 
                result = await action(validator) && result;
            return result;
        }
    }
}
