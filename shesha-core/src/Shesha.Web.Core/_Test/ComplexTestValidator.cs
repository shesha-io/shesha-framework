using Abp.Dependency;
using Shesha.JsonEntities;
using Shesha.Validations;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;

namespace Shesha.Web.Core._Test
{
    /*public class ComplexTestValidator : EntityPropertyValidator<ComplexTest, Guid>, ITransientDependency
    {
        public override Task<bool> ValidateEntity(ComplexTest entity, List<ValidationResult> validationResult, List<string> propertiesToValidate = null)
        {
            if (entity.Name == "test")
            {
                validationResult.Add(new ValidationResult("'test' is not a valid name"));
                return Task.FromResult(false);
            }

            return Task.FromResult(true);
        }
    }

    public class InnerComplexTestValidator : IPropertyValidator, ITransientDependency
    {
        public Task<bool> ValidateObject(object obj, List<ValidationResult> validationResult, List<string> propertiesToValidate = null)
        {
            if (obj is InnerComplexTest entity)
                if (entity.ComplexName == "complex")
                {
                    validationResult.Add(new ValidationResult("'complex' is not a valid name"));
                    return Task.FromResult(false);
                }

            return Task.FromResult(true);
        }

        public Task<bool> ValidateProperty(object obj, string propertyName, object value, List<ValidationResult> validationResult)
        {
            return Task.FromResult(true);
        }
    }*/
}