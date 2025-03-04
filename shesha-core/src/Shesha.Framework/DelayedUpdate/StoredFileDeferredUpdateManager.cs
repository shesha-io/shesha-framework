using Abp.Dependency;
using Abp.Domain.Entities;
using Shesha.EntityReferences;
using Shesha.Reflection;
using Shesha.Services;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;

namespace Shesha.DelayedUpdate
{
    public class StoredFileDelayedUpdateManager : BaseDelayedUpdateManager<StoredFileDelayedUpdateData>, ITransientDependency
    {

        public const string ItemType = "storedFiles";

        private readonly IStoredFileService _fileService;

        public StoredFileDelayedUpdateManager(IStoredFileService fileService)
        {
            _fileService = fileService;
        }

        public override async Task UpdateItemAsync<TPrimaryKey>(IEntity<TPrimaryKey> entity, object id, StoredFileDelayedUpdateData? data, List<ValidationResult> validationResult)
        {
            try
            {
                var stringId = id?.ToString();
                ArgumentException.ThrowIfNullOrWhiteSpace(stringId, nameof(id));

                var file = await _fileService.GetOrNullAsync(Guid.Parse(stringId));

                if (string.IsNullOrWhiteSpace(data?.PropertyName))
                {
                    object? owner = entity;
                    if (!string.IsNullOrWhiteSpace(data?.OwnerName))
                    {
                        var propAccessor = ReflectionHelper.GetPropertyValueAccessor(owner, data.OwnerName);
                        owner = propAccessor.Value;
                        if (owner == null)
                        {
                            validationResult.Add(new ValidationResult($"Entity '{data.OwnerName}' not found for {entity.GetType().FullName}"));
                            return;
                        }
                    }
                    file.Owner = new GenericEntityReference(owner);
                }
                else
                {
                    var property = ReflectionHelper.GetPropertyOrNull(entity, data.PropertyName, out var owner);
                    if (property == null)
                    {
                        validationResult.Add(new ValidationResult($"Property '{data.PropertyName}' not found for {entity.GetType().FullName}"));
                        return;
                    }
                    property.SetValue(owner, file);
                }

                file.Temporary = false;
            }
            catch (Exception e)
            {
                validationResult.Add(new ValidationResult(e.Message));
            }
        }

        public override bool IsApplicable(string type)
        {
            return type == ItemType;
        }
    }
}