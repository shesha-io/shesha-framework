using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Runtime.Session;
using NHibernate.Linq;
using Shesha.ConfigurationItems;
using Shesha.ConfigurationItems.Models;
using Shesha.Domain;
using Shesha.Permissions;
using Shesha.Validations;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Web.FormsDesigner.Services
{
    /// <summary>
    /// Form manager
    /// </summary>
    public class FormManager : ConfigurationItemManager<FormConfiguration, FormConfigurationRevision>, IFormManager, ITransientDependency
    {
        private readonly IPermissionedObjectManager _permissionedObjectManager;
        
        public FormManager(
            IPermissionedObjectManager permissionedObjectManager,
            IModuleManager moduleManager,
            IRepository<FormConfigurationRevision, Guid> revisionRepo
        ) : base()
        {
            _permissionedObjectManager = permissionedObjectManager;
        }

        public IAbpSession AbpSession { get; set; } = NullAbpSession.Instance;

        public static string GetFormPermissionedObjectName(string? module, string name)
        {
            return $"{module}.{name}";
        }

        public Task<List<FormConfiguration>> GetAllAsync()
        {
            return Repository.GetAllListAsync();
        }

        public override async Task<FormConfiguration> CreateItemAsync(CreateItemInput input)
        {
            var validationResults = new ValidationResults();
            var alreadyExist = await Repository.GetAll().Where(f => f.Module == input.Module && f.Name == input.Name).AnyAsync();
            if (alreadyExist)
                validationResults.Add($"Form with name `{input.Name}` already exists in module `{input.Module.Name}`");
            validationResults.ThrowValidationExceptionIfAny(L);

            var template = input.TemplateId.HasValue
                ? await RevisionRepository.GetAsync(input.TemplateId.Value)
                : null;

            var form = new FormConfiguration
            {
                Name = input.Name,
                Module = input.Module,
                Folder = input.Folder,
            };
            form.Origin = form;

            await Repository.InsertAsync(form);

            var revision = form.MakeNewRevision();
            revision.Description = input.Description;
            revision.Label = input.Label;
            revision.Markup = input.Markup ?? string.Empty;
            revision.IsTemplate = false;
            revision.ModelType = input.ModelType;
            revision.GenerationLogicExtensionJson = input.GenerationLogicExtensionJson;
            revision.Template = template;
            form.Normalize();

            await RevisionRepository.InsertAsync(revision);

            return form;
        }

        protected override Task CopyRevisionPropertiesAsync(FormConfigurationRevision source, FormConfigurationRevision destination)
        {
            destination.Markup = source.Markup;
            destination.IsTemplate = source.IsTemplate;

            return Task.CompletedTask;
        }

        protected override async Task AfterItemDuplicatedAsync(FormConfiguration item, FormConfiguration duplicate)
        {
            await _permissionedObjectManager.CopyAsync(
                GetFormPermissionedObjectName(item.Module?.Name, item.Name),
                GetFormPermissionedObjectName(duplicate.Module?.Name, duplicate.Name),
                ShaPermissionedObjectsTypes.Form
            );
        }
    }
}