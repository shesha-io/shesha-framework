using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.Permissions;
using Shesha.Services.ConfigurationItems;
using Shesha.Web.FormsDesigner.Exceptions;
using System;
using System.Threading.Tasks;

namespace Shesha.Web.FormsDesigner.Services.Distribution
{
    /// <summary>
    /// Form configuration import
    /// </summary>
    public class FormConfigurationImport: ConfigurationItemImportBase<FormConfiguration, DistributedFormConfiguration>, IFormConfigurationImport, ITransientDependency
    {
        private readonly IRepository<FormConfiguration, Guid> _formConfigRepo;
        private readonly IFormManager _formManger;
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly IPermissionedObjectManager _permissionedObjectManager;

        /// <summary>
        /// Default constructor
        /// </summary>
        public FormConfigurationImport(IRepository<Module, Guid> moduleRepo,
            IRepository<FrontEndApp, Guid> frontEndAppRepo, 
            IFormManager formManger, 
            IRepository<FormConfiguration, Guid> formConfigRepo, 
            IUnitOfWorkManager unitOfWorkManager,
            IPermissionedObjectManager permissionedObjectManager
        ) : base(moduleRepo, frontEndAppRepo)
        {
            _formManger = formManger;
            _formConfigRepo = formConfigRepo;
            _unitOfWorkManager = unitOfWorkManager;
            _permissionedObjectManager = permissionedObjectManager;
        }

        /// <summary>
        /// Iten type
        /// </summary>
        public string ItemType => FormConfiguration.ItemTypeName;

        /// inheritedDoc
        public async Task<ConfigurationItemBase> ImportItemAsync(DistributedConfigurableItemBase item, IConfigurationItemsImportContext context) 
        {
            if (item == null)
                throw new ArgumentNullException(nameof(item));

            if (!(item is DistributedFormConfiguration formItem))
                throw new NotSupportedException($"{this.GetType().FullName} supports only items of type {nameof(DistributedFormConfiguration)}. Actual type is {item.GetType().FullName}");

            var form = await ImportFormAsync(formItem, context);
            await _unitOfWorkManager.Current.SaveChangesAsync();

            return form;
        }

        private bool FormsAreEqual(FormConfiguration? form, DistributedFormConfiguration item) 
        {
            return form != null &&
                (form.Module == null ? string.IsNullOrWhiteSpace(item.ModuleName) : form.Module.Name == item.ModuleName) &&
                form.Markup == item.Markup &&
                form.Name == item.Name &&
                form.Label == item.Label &&
                form.Description == item.Description &&
                form.ModelType == item.ModelType &&
                form.Suppress == item.Suppress &&
                form.IsTemplate == item.IsTemplate;
        }

        /// inheritedDoc
        protected async Task<ConfigurationItemBase> ImportFormAsync(DistributedFormConfiguration item, IConfigurationItemsImportContext context)
        {
            // check if form exists
            var existingForm = await _formConfigRepo.FirstOrDefaultAsync(f => f.Name == item.Name && (f.Module == null && item.ModuleName == null || f.Module != null && f.Module.Name == item.ModuleName) && f.IsLast);

            if (FormsAreEqual(existingForm, item))
                return existingForm;

            // use status specified in the context with fallback to imported value
            var statusToImport = context.ImportStatusAs ?? item.VersionStatus;
            if (existingForm != null) 
            {
                switch (existingForm.VersionStatus) 
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
                    var liveForm = existingForm.VersionStatus == ConfigurationItemVersionStatus.Live
                        ? existingForm
                        : await _formConfigRepo.FirstOrDefaultAsync(f => f.Name == item.Name && (f.Module == null && item.ModuleName == null || f.Module != null && f.Module.Name == item.ModuleName) && f.VersionStatus == ConfigurationItemVersionStatus.Live);
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
                newFormVersion.VersionStatus = statusToImport;
                newFormVersion.CreatedByImport = context.ImportResult;
                newFormVersion.Normalize();

                // todo: save external Id
                // how to handle origin?

                await _formConfigRepo.UpdateAsync(newFormVersion);

                await SetPermissionsAsync(item, newFormVersion);

                return newFormVersion;
            } else 
            {
                var newForm = new FormConfiguration();
                MapToForm(item, newForm);

                // fill audit?
                newForm.VersionNo = 1;
                newForm.Module = await GetModuleAsync(item.ModuleName, context);

                // important: set status according to the context
                newForm.VersionStatus = statusToImport;
                newForm.CreatedByImport = context.ImportResult;

                newForm.Normalize();

                await _formConfigRepo.InsertAsync(newForm);

                await SetPermissionsAsync(item, newForm);

                return newForm;
            }
        }

        private async Task SetPermissionsAsync(DistributedFormConfiguration item, FormConfiguration form)
        {
            // add only if permissions is available and access is not Inherited
            if (item.Access != null && item.Access > Shesha.Domain.Enums.RefListPermissionedAccess.Inherited)
            {
                var permisson = new PermissionedObjectDto
                {
                    Object = FormManager.GetFormPermissionedObjectName(form.Module?.Name, form.Name),
                    Name = $"{form.Module?.Name}.{form.Name}",
                    Module = form.Module?.Name,
                    ModuleId = form.Module?.Id,
                    Type = ShaPermissionedObjectsTypes.Form,
                    Access = item.Access,
                    Permissions = item.Permissions,
                };

                await _permissionedObjectManager.SetAsync(permisson);
            }
        }

        private void MapToForm(DistributedFormConfiguration item, FormConfiguration form) 
        {
            form.Name = item.Name;
            form.Label = item.Label;
            form.Description = item.Description;
            form.VersionStatus = item.VersionStatus;
            form.Suppress = item.Suppress;

            form.Markup = item.Markup;
            form.ModelType = item.ModelType;
            form.IsTemplate = item.IsTemplate;
        }
    }
}
