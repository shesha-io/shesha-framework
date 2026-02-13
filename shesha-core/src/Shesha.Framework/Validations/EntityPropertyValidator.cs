﻿using Abp.Collections.Extensions;
using Abp.Dependency;
using Abp.Domain.Entities;
using Shesha.DynamicEntities;
using Shesha.DynamicEntities.Dtos;
using Shesha.Extensions;
using Shesha.Metadata;
using Shesha.Reflection;
using Shesha.Utilities;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Shesha.Validations
{
    public abstract class EntityPropertyValidator<TEntity, TId> : IPropertyValidator where TEntity : class, IEntity<TId>
    {
        public async Task<bool> ValidateObjectAsync(object obj, List<ValidationResult> validationResult, List<string>? propertiesToValidate = null, ModelConfigurationDto? modelConfig = null)
        {
            if (obj is TEntity entity)
            {
                return await ValidateEntityAsync(entity, validationResult, propertiesToValidate, modelConfig);
            }
            return true;
        }
        public virtual async Task<bool> ValidateEntityAsync(TEntity entity, List<ValidationResult> validationResult, List<string>? propertiesToValidate = null, ModelConfigurationDto? modelConfig = null)
        {
            return await Task.FromResult(true);
        }

        public async Task<bool> ValidatePropertyAsync(object obj, string propertyName, List<ValidationResult> validationResult, ModelConfigurationDto? modelConfig = null)
        {
            if (obj is TEntity entity)
            {
                return await ValidateEntityPropertyAsync(entity, propertyName, validationResult, modelConfig);
            }
            return true;
        }

        public async Task<bool> ValidatePropertyAsync(object obj, string propertyName, object? value, List<ValidationResult> validationResult, ModelConfigurationDto? modelConfig = null)
        {
            if (obj is TEntity entity)
            {
                return await ValidateEntityPropertyAsync(entity, propertyName, value, validationResult, modelConfig);
            }
            return true;
        }

        public virtual Task<bool> ValidateEntityPropertyAsync(TEntity entity, string propertyName, List<ValidationResult> validationResult, ModelConfigurationDto? modelConfig = null)
        {
            return Task.FromResult(true);
        }

        public virtual Task<bool> ValidateEntityPropertyAsync(TEntity entity, string propertyName, object? value, List<ValidationResult> validationResult, ModelConfigurationDto? modelConfig = null)
        {
            return Task.FromResult(true);
        }    
    }

    public class EntityPropertyValidator : IPropertyValidator, ITransientDependency
    {
        private IModelConfigurationManager _configurationManager;

        public EntityPropertyValidator(IModelConfigurationManager configurationManager)
        {
            _configurationManager = configurationManager;
        }

        private async Task<List<ModelPropertyDto>?> GetPropertiesAsync(object obj, ModelConfigurationDto? modelConfig = null)
        {
            var entityType = obj.GetType().StripCastleProxyType();

            var props = (modelConfig == null
                ? await _configurationManager.GetCachedModelConfigurationOrNullAsync(null, entityType.Namespace, entityType.Name, true)
                : modelConfig
                )?.Properties;
            return props;
        }

        public async Task<bool> ValidatePropertyAsync(object obj, string propertyName, List<ValidationResult> validationResult, ModelConfigurationDto? modelConfig = null)
        {
            if (!obj.GetType().IsEntityType()
                && !obj.GetType().IsJsonEntityType())
                return true;

            var props = await GetPropertiesAsync(obj, modelConfig);

            if (props == null || !props.Any())
                return true;

            return Validate(obj, propertyName, null, validationResult, props, false);
        }

        public async Task<bool> ValidatePropertyAsync(object obj, string propertyName, object? value, List<ValidationResult> validationResult, ModelConfigurationDto? modelConfig = null)
        {
            if (!obj.GetType().IsEntityType() 
                && !obj.GetType().IsJsonEntityType())
                return true;

            var props = await GetPropertiesAsync(obj, modelConfig);

            if (props == null || !props.Any())
                return true;

            return Validate(obj, propertyName, value, validationResult, props, true);
        }

        public Task<bool> ValidateObjectAsync(object obj, List<ValidationResult> validationResult, List<string>? propertiesToValidate = null, ModelConfigurationDto? modelConfig = null)
        {
            return Task.FromResult(true);
        }

        public bool Validate(object obj, string propertyName, object? value, List<ValidationResult> validationResult,
            List<ModelPropertyDto> props, bool useNewValue)
        {
            var parts = propertyName.Split('.').Select(x => x.ToCamelCase()).ToArray();

            var propConfig = props.FirstOrDefault(x => x.Name.ToCamelCase() == parts[0]);
            if (propConfig == null)
                return true;

            var propInfo = obj.GetType().GetProperties().First(x => x.Name.ToCamelCase() == parts[0]);
            var innerObj = propInfo.GetValue(obj, null);

            var friendlyNameList = new List<string?>() { propConfig.Label };
            var friendlyName = propertyName;
            var i = 1;
            while (i < parts.Length && propInfo != null && propConfig != null)
            {
                if (useNewValue && (propConfig.Suppress ?? false))
                {
                    validationResult.Add(new ValidationResult($"Property '{friendlyName}' is suppressed."));
                    return false;
                }

                propConfig = propConfig.Properties.FirstOrDefault(x => x.Name.ToCamelCase() == parts[i]);
                propInfo = innerObj?.GetType().GetProperties().FirstOrDefault(x => x.Name.ToCamelCase() == parts[i]);
                innerObj = propInfo?.GetValue(innerObj, null);
                friendlyNameList.Add(propConfig?.Label);
                friendlyName = string.Join(".", friendlyNameList.Where(x => !string.IsNullOrWhiteSpace(x)));
                friendlyName = string.IsNullOrWhiteSpace(friendlyName) ? propertyName : friendlyName;
                i++;
            }

            if (propInfo == null)
            {
                validationResult.Add(new ValidationResult($"Property '{friendlyName}' not found."));
                return false;
            }

            if (propConfig == null)
                return true;

            var prevValue = innerObj;

            if (!useNewValue) value = prevValue;

            if (propConfig.DataType == DataTypes.Array && propConfig.ItemsType != null && value is IEnumerable list)
            {
                var result = true;
                var index = 0;
                var prevList = (prevValue as IEnumerable)?.ToDynamicList();
                var itemsType = propInfo?.PropertyType?.GetGenericArguments()?.FirstOrDefault();
                if (itemsType == null)
                {
                    validationResult.Add(new ValidationResult($"List items type for property '{friendlyName}' is not configured properly ."));
                    return false;
                }

                foreach (var item in list)
                {
                    var prevItem = prevList?.Count > index ? prevList?[index] : null;
                    result = ValidatePropertyValue(propConfig.ItemsType, itemsType?.IsNullableType() ?? false, $"{friendlyName}[{index++}]", item, prevItem, validationResult, useNewValue)
                        && result;
                }

                return result;
            }

            return ValidatePropertyValue(propConfig, propInfo?.IsNullable() ?? false, friendlyName, value, prevValue, validationResult, useNewValue);
        }

        private bool ValidatePropertyValue(
            ModelPropertyDto propConfig,
            bool isNullable,
            string friendlyName,
            object? value,
            object? prevValue,
            List<ValidationResult> validationResult,
            bool useNewValue
        )
        {
            var hasMessage = !string.IsNullOrWhiteSpace(propConfig.ValidationMessage);

            if ((value?.ToString()).IsNullOrEmpty() && (propConfig.Required ?? false) && !(propConfig.Suppress ?? false))
            {
                validationResult.Add(new ValidationResult(hasMessage
                    ? propConfig.ValidationMessage
                    : $"Property '{friendlyName}' is required."));
                return false;
            }

            if (useNewValue && prevValue == value)
                return true;

            if (useNewValue && (propConfig.Suppress ?? false) && !propConfig.IsItemsType)
            {
                validationResult.Add(new ValidationResult($"Property '{friendlyName}' is suppressed."));
                return false;
            }

            if (useNewValue && (propConfig.ReadOnly ?? false))
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
                            : $"Property '{friendlyName}' should have value length more than {propConfig.MinLength - 1} symbols"));
                        return false;
                    }
                    if (propConfig.MaxLength.HasValue && stringValueOrEmpty.Length > propConfig.MaxLength)
                    {
                        validationResult.Add(new ValidationResult(hasMessage
                            ? propConfig.ValidationMessage
                            : $"Property '{friendlyName}' should have value length less than {propConfig.MaxLength + 1} symbols"));
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
                    if (string.IsNullOrWhiteSpace(stringValue) && isNullable)
                        return true;
                    if (propConfig.DataFormat == NumberFormats.Int64 && !long.TryParse(stringValue, out _))
                    {
                        validationResult.Add(new ValidationResult($"Property '{friendlyName}' = {stringValue} should be in an Integer format"));
                        return false;
                    }
                    else if(propConfig.DataFormat == NumberFormats.Decimal && !decimal.TryParse(stringValue, out decimal _))
                    {
                        validationResult.Add(new ValidationResult($"Property '{friendlyName}' = {stringValue} should be in a Decimal format"));
                        return false;
                    }
                    else if ((propConfig.DataFormat == NumberFormats.Float || propConfig.DataFormat == NumberFormats.Double) && !double.TryParse(stringValue, out double _))
                    {
                        validationResult.Add(new ValidationResult($"Property '{friendlyName}' = {stringValue} should be in a Float format"));
                        return false;
                    }

                    // Get value to validate min & max
                    double val = double.Parse(stringValue.NotNull());

                    if (propConfig.Min.HasValue && val < propConfig.Min)
                    {
                        validationResult.Add(new ValidationResult(hasMessage
                            ? propConfig.ValidationMessage
                            : $"Property '{friendlyName}' = {stringValue} should have value >= {propConfig.Min}"));
                        return false;
                    }
                    if (propConfig.Max.HasValue && val > propConfig.Max)
                    {
                        validationResult.Add(new ValidationResult(hasMessage
                            ? propConfig.ValidationMessage
                            : $"Property '{friendlyName}' = {stringValue} should have value <= {propConfig.Max}"));
                        return false;
                    }
                    break;
            }

            return true;
        }
    }
}
