using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Newtonsoft.Json;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.Web.FormsDesigner.Domain;
using System;
using System.IO;
using System.Threading.Tasks;

namespace Shesha.Web.FormsDesigner.Services.Distribution
{
    /// <summary>
    /// Form configuration import
    /// </summary>
    public class FormConfigurationImport: IFormConfigurationImport, ITransientDependency
    {
        private readonly IRepository<FormConfiguration, Guid> _formConfigRepo;
        private readonly IRepository<ConfigurationItem, Guid> _configItemRepository;
        private readonly IRepository<Module, Guid> _moduleRepo;
        private readonly IFormManager _formManger;
        private readonly IUnitOfWorkManager _unitOfWorkManager;

        public FormConfigurationImport(IFormManager formManger, IRepository<FormConfiguration, Guid> formConfigRepo, IRepository<ConfigurationItem, Guid> configItemRepository, IRepository<Module, Guid> moduleRepo, IUnitOfWorkManager unitOfWorkManager)
        {
            _formManger = formManger;
            _formConfigRepo = formConfigRepo;
            _configItemRepository = configItemRepository;
            _moduleRepo = moduleRepo;
            _unitOfWorkManager = unitOfWorkManager;
        }

        public string ItemType => FormConfiguration.ItemTypeName;

        /// inheritedDoc
        public async Task<ConfigurationItemBase> ImportItemAsync(DistributedConfigurableItemBase item, IConfigurationItemsImportContext context) 
        {
            if (item == null)
                throw new ArgumentNullException(nameof(item));

            if (!(item is DistributedFormConfiguration formItem))
                throw new NotSupportedException($"{this.GetType().FullName} supports only items of type {nameof(DistributedFormConfiguration)}. Actual type is {item.GetType().FullName}");

            return await ImportFormAsync(formItem, context);
        }

        /// inheritedDoc
        public async Task<DistributedConfigurableItemBase> ReadFromJsonAsync(Stream jsonStream) 
        {
            using (var reader = new StreamReader(jsonStream))
            {
                var json = await reader.ReadToEndAsync();
                return JsonConvert.DeserializeObject<DistributedFormConfiguration>(json);
            }
        }

        /// inheritedDoc
        protected async Task<ConfigurationItemBase> ImportFormAsync(DistributedFormConfiguration item, IConfigurationItemsImportContext context)
        {
            // check if form exists
            var existingForm = await _formConfigRepo.FirstOrDefaultAsync(f => f.Configuration.Name == item.Name && (f.Configuration.Module == null && item.ModuleName == null || f.Configuration.Module.Name == item.ModuleName) && f.Configuration.IsLast);

            // use status specified in the context with fallback to imported value
            var statusToImport = context.ImportStatusAs ?? item.VersionStatus;
            if (existingForm != null) 
            {
                switch (existingForm.Configuration.VersionStatus) 
                {
                    case ConfigurationItemVersionStatus.Draft:
                    case ConfigurationItemVersionStatus.Ready: 
                    {
                        // cancel existing version
                        await _formManger.CancelVersoinAsync(existingForm);
                        break;
                    }
                }
                // mark existing live form as retired if we import new form as live
                if (statusToImport == ConfigurationItemVersionStatus.Live) 
                {
                    var liveForm = existingForm.Configuration.VersionStatus == ConfigurationItemVersionStatus.Live
                        ? existingForm
                        : await _formConfigRepo.FirstOrDefaultAsync(f => f.Configuration.Name == item.Name && (f.Configuration.Module == null && item.ModuleName == null || f.Configuration.Module.Name == item.ModuleName) && f.Configuration.VersionStatus == ConfigurationItemVersionStatus.Live);
                    if (liveForm != null)
                    {
                        await _formManger.UpdateStatusAsync(liveForm, ConfigurationItemVersionStatus.Retired);
                        await _unitOfWorkManager.Current.SaveChangesAsync(); // save changes to guarantee sequence of update
                    }
                }

                // create new version
                var newFormVersion = await _formManger.CreateNewVersionAsync(existingForm);
                MapToForm(item, newFormVersion);

                // important: set status according to the context
                newFormVersion.Configuration.VersionStatus = statusToImport;
                newFormVersion.Configuration.CreatedByImport = context.ImportResult;
                newFormVersion.Normalize();

                // todo: save external Id
                // how to handle origin?

                await _configItemRepository.UpdateAsync(newFormVersion.Configuration);
                await _formConfigRepo.UpdateAsync(newFormVersion);

                return newFormVersion;
            } else 
            {
                var newForm = new FormConfiguration();
                MapToForm(item, newForm);

                // fill audit?
                newForm.Configuration.VersionNo = 1;
                newForm.Configuration.Module = await GetModuleAsync(item.ModuleName, context);

                // important: set status according to the context
                newForm.Configuration.VersionStatus = statusToImport;
                newForm.Configuration.CreatedByImport = context.ImportResult;

                newForm.Normalize();

                await _configItemRepository.InsertAsync(newForm.Configuration);
                await _formConfigRepo.InsertAsync(newForm);
                

                return newForm;
            }
        }

        private async Task<Module> GetModuleAsync(string name, IConfigurationItemsImportContext context) 
        {
            if (string.IsNullOrWhiteSpace(name))
                return null;

            var module = await _moduleRepo.FirstOrDefaultAsync(m => m.Name == name);
            if (module == null) 
            {
                if (context.CreateModules) 
                {
                    module = new Module { Name = name, IsEnabled = true };
                    await _moduleRepo.InsertAsync(module);
                } else
                    throw new NotSupportedException($"Module `{name}` is missing in the destination");
            }

            return module;
        }

        private void MapToForm(DistributedFormConfiguration item, FormConfiguration form) 
        {
            form.Configuration.Name = item.Name;
            form.Configuration.Label = item.Label;
            form.Configuration.ItemType = item.ItemType;
            form.Configuration.Description = item.Description;
            form.Configuration.VersionStatus = item.VersionStatus;
            form.Configuration.Suppress = item.Suppress;

            form.Markup = item.Markup;
            form.ModelType = item.ModelType;
            
            // todo: decide how to handle other properties
            /*
            form.Configuration.Origin
            form.Configuration.Module
            form.Configuration.BaseItem
            form.Configuration.VersionNo
            form.Configuration.ParentVersion
            form.Configuration.CreatedByImport
            form.Configuration.TenantId
            */
        }
    }
}
