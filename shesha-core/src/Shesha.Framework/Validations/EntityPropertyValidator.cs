using Abp.Dependency;
using Abp.Domain.Entities;
using Shesha.DynamicEntities.Cache;
using Shesha.DynamicEntities.Dtos;
using Shesha.Extensions;
using Shesha.Metadata;
using Shesha.Reflection;
using Shesha.Utilities;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Shesha.Validations
{
    public abstract class EntityPropertyValidator<TEntity, TId> : IPropertyValidator where TEntity : class, IEntity<TId>
    {
        public async Task<bool> ValidateObjectAsync(object obj, List<ValidationResult> validationResult, List<string>? propertiesToValidate = null)
        {
            if (obj is TEntity entity)
            {
                return await ValidateEntityAsync(entity, validationResult, propertiesToValidate);
            }
            return true;
        }
        public virtual async Task<bool> ValidateEntityAsync(TEntity entity, List<ValidationResult> validationResult, List<string>? propertiesToValidate = null)
        {
            return await Task.FromResult(true);
        }

        public async Task<bool> ValidatePropertyAsync(object obj, string propertyName, object? value, List<ValidationResult> validationResult)
        {
            if (obj is TEntity entity)
            {
                return await ValidateEntityPropertyAsync(entity, propertyName, value, validationResult);
            }
            return true;
        }
        public virtual async Task<bool> ValidateEntityPropertyAsync(TEntity entity, string propertyName, object? value, List<ValidationResult> validationResult)
        {
            return await Task.FromResult(true);
        }

    }

    public class EntityPropertyValidator : IPropertyValidator, ITransientDependency
    {
        private IEntityConfigCache _entityConfigCache;

        public EntityPropertyValidator(IEntityConfigCache entityConfigCache)
        {
            _entityConfigCache = entityConfigCache;
        }

        public async Task<bool> ValidatePropertyAsync(object obj, string propertyName, object? value, List<ValidationResult> validationResult)
        {
            if (!obj.GetType().IsEntityType() 
                && !obj.GetType().IsJsonEntityType())
                return true;

            var props = await _entityConfigCache.GetEntityPropertiesAsync(obj.GetType());

            if (props == null || !props.Any())
                return true;

            return Validate(obj, propertyName, value, validationResult, props, true);
        }

        public Task<bool> ValidateObjectAsync(object obj, List<ValidationResult> validationResult, List<string>? propertiesToValidate = null)
        {
            return Task.FromResult(true);
        }

        public bool Validate(object obj, string propertyName, object? value, List<ValidationResult> validationResult,
            List<EntityPropertyDto> props, bool useNewValue)
        {
            var parts = propertyName.Split('.').Select(x => x.ToCamelCase()).ToArray();

            var propConfig = props.FirstOrDefault(x => x.Name.ToCamelCase() == parts[0]);
            if (propConfig == null)
                return true;

            var propInfo = obj.GetType().GetProperties().First(x => x.Name.ToCamelCase() == parts[0]);
            var innerObj = propInfo.GetValue(obj, null);

            var friendlyNameList = new List<string>() { propConfig.Label };

            var i = 1;
            while (i < parts.Length && propInfo != null && propConfig != null)
            {
                propConfig = propConfig.Properties.First(x => x.Name.ToCamelCase() == parts[i]);
                propInfo = innerObj?.GetType().GetProperties().FirstOrDefault(x => x.Name.ToCamelCase() == parts[i]);
                innerObj = propInfo?.GetValue(innerObj, null);
                friendlyNameList.Add(propConfig.Label);
                i++;
            }

            var friendlyName = string.Join(".", friendlyNameList.Where(x => !string.IsNullOrWhiteSpace(x)));
            friendlyName = string.IsNullOrWhiteSpace(friendlyName) ? propertyName : friendlyName;

            if (propConfig == null)
                // ToDo: AS - may be need to create validation error
                return true;

            var prevValue = innerObj;

            if (!useNewValue) value = prevValue;

            var hasMessage = !string.IsNullOrWhiteSpace(propConfig.ValidationMessage);

            if (value == null && propConfig.Required && !propConfig.Suppress)
            {
                validationResult.Add(new ValidationResult(hasMessage
                    ? propConfig.ValidationMessage
                    : $"Property '{friendlyName}' is required."));
                return false;
            }

            if (useNewValue && prevValue == value)
                return true;

            if (useNewValue && propConfig.Suppress)
            {
                validationResult.Add(new ValidationResult($"Property '{friendlyName}' is suppressed."));
                return false;
            }

            if (useNewValue && propConfig.ReadOnly)
            {
                validationResult.Add(new ValidationResult($"Property '{friendlyName}' is readonly."));
                return false;
            }

            switch (propConfig.DataType)
            {
                case DataTypes.String:
                    var stringValueOrEmpty = value?.ToString() ?? string.Empty;
                    if (propConfig.MinLength.HasValue && (value == null || stringValueOrEmpty.Length < propConfig.MinLength))
                    {
                        validationResult.Add(new ValidationResult(hasMessage
                            ? propConfig.ValidationMessage
                            : $"Property '{friendlyName}' should have value length more then {propConfig.MinLength - 1} symbols"));
                        return false;
                    }
                    if (propConfig.MaxLength.HasValue && stringValueOrEmpty.Length > propConfig.MaxLength)
                    {
                        validationResult.Add(new ValidationResult(hasMessage
                            ? propConfig.ValidationMessage
                            : $"Property '{friendlyName}' should have value length less then {propConfig.MaxLength + 1} symbols"));
                        return false;
                    }
                    if (!string.IsNullOrWhiteSpace(propConfig.RegExp) && !(new Regex(propConfig.RegExp)).IsMatch(stringValueOrEmpty))
                    {
                        validationResult.Add(new ValidationResult(hasMessage
                            ? propConfig.ValidationMessage
                            : $"Property '{friendlyName}' should have value matched to `{propConfig.RegExp}` regular expression"));
                        return false;
                    }
                    break;
                case DataTypes.Number:
                    var stringValue = value?.ToString();
                    if (string.IsNullOrWhiteSpace(stringValue) && propInfo != null && propInfo.IsNullable())
                        return true;

                    var b = double.TryParse(stringValue, out double val);
                    if (!b)
                    {
                        validationResult.Add(new ValidationResult($"Property '{friendlyName}' should be in a number format"));
                        return false;
                    }

                    if (propConfig.Min.HasValue && val < propConfig.Min)
                    {
                        validationResult.Add(new ValidationResult(hasMessage
                            ? propConfig.ValidationMessage
                            : $"Property '{friendlyName}' should have value more or equal then {propConfig.Min}"));
                        return false;
                    }
                    if (propConfig.Max.HasValue && val > propConfig.Max)
                    {
                        validationResult.Add(new ValidationResult(hasMessage
                            ? propConfig.ValidationMessage
                            : $"Property '{friendlyName}' should have value less or equal then {propConfig.Max}"));
                        return false;
                    }
                    break;
            }

            return true;
        }
    }
}
