using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Uow;
using Abp.Extensions;
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
        private readonly IUnitOfWorkManager _unitOfWorkManager;

        public StoredFileDelayedUpdateManager(
            IStoredFileService fileService,
            IUnitOfWorkManager unitOfWorkManager)
        {
            _fileService = fileService;
            _unitOfWorkManager = unitOfWorkManager;
        }

        public override async Task UpdateItemAsync<TPrimaryKey>(IEntity<TPrimaryKey> entity, object id, StoredFileDelayedUpdateData data, List<ValidationResult> validationResult)
        {
            try
            {
                var file = await _fileService.GetOrNullAsync(Guid.Parse(id.ToString()));

                if (data?.PropertyName?.IsNullOrEmpty() ?? true)
                {
                    object owner = entity;
                    if (!data?.OwnerName?.IsNullOrEmpty() ?? false)
                    {
                        var prop = ReflectionHelper.GetProperty(owner, data.OwnerName);
                        owner = prop.GetValue(owner);
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
                    var property = ReflectionHelper.GetProperty(entity, data.PropertyName, out var owner);
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
