using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Uow;
using Abp.Extensions;
using Newtonsoft.Json.Linq;
using NHibernate.Mapping;
using Shesha.DelayedUpdate;
using Shesha.EntityReferences;
using Shesha.Reflection;
using Shesha.Services;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Domain.Interfaces
{
    public class StoredFileDelayedUpdateManager : BaseDelayedUpdateManager<StoredFileDelayedUpdateData>, ITransientDependency
    {
     
        public const string ItemType = "storedFiles";

        private readonly IStoredFileService _fileService;
        private readonly IUnitOfWorkManager _unitOfWorkManager;

        public StoredFileDelayedUpdateManager(IStoredFileService fileService, IUnitOfWorkManager unitOfWorkManager)
        {
            _fileService = fileService;
            _unitOfWorkManager = unitOfWorkManager;
        }

        public override async Task ExecuteAsync<TPrimaryKey>(IEntity<TPrimaryKey> entity, List<DelayedUpdateItem> items, List<ValidationResult> validationResult)
        {
            await Task.Run(() =>
            {
                try
                {
                    foreach (var item in items)
                    {
                        var file = _fileService.GetOrNull(Guid.Parse(item.Id.ToString()));
                        StoredFileDelayedUpdateData data = GetData(item.Data);
                        if (data.PropertyName.IsNullOrEmpty())
                            file.Owner = new GenericEntityReference(entity);
                        else
                        {
                            var property = ReflectionHelper.GetProperty(entity, data.PropertyName);
                            if (property == null)
                            {
                                validationResult.Add(new ValidationResult($"Property '{data.PropertyName}' not found for {entity.GetType().FullName}"));
                                return;
                            }
                            property.SetValue(entity, file);
                        }

                        file.Temporary = false;
                    }
                } 
                catch(Exception e)
                {
                    validationResult.Add(new ValidationResult(e.Message));
                }
            });
        }

        public override bool IsApplicable(string type)
        {
            return type == StoredFileDelayedUpdateManager.ItemType;
        }
    }
}
