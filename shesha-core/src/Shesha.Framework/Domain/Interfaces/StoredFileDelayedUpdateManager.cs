using Abp.Dependency;
using Abp.Domain.Entities;
using NHibernate.Mapping;
using Shesha.EntityReferences;
using Shesha.Services;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Domain.Interfaces
{
    public class StoredFileDelayedUpdateManager : IDelayedUpdateManager, ITransientDependency
    {
     
        public const string ItemType = "storedFiles";

        private readonly IStoredFileService _fileService;

        public StoredFileDelayedUpdateManager(IStoredFileService fileService)
        {
            _fileService = fileService;
        }

        public async Task ExecuteAsync<TPrimaryKey>(IEntity<TPrimaryKey> entity, List<DelayedUpdateItem> items, List<ValidationResult> validationResult)
        {
            await Task.Run(() =>
            {
                try
                {
                    foreach (var item in items)
                    {
                        var file = _fileService.GetOrNull(Guid.Parse(item.Id.ToString()));
                        file.Owner = new GenericEntityReference(entity);
                        file.Temporary = false;
                    }
                } 
                catch(Exception e)
                {
                    validationResult.Add(new ValidationResult(e.Message));
                }
            });
        }

        public bool IsApplicable(string type)
        {
            return type == StoredFileDelayedUpdateManager.ItemType;
        }
    }
}
