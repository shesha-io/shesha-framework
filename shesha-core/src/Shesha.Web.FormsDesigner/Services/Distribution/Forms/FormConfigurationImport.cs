using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Permissions;
using Shesha.Services.ConfigurationItems;
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
        private readonly IRepository<FormConfigurationRevision, Guid> _formConfigRevisionRepo;
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
            IRepository<FormConfigurationRevision, Guid> formConfigRevisionRepo,
            IUnitOfWorkManager unitOfWorkManager,
            IPermissionedObjectManager permissionedObjectManager
        ) : base(moduleRepo, frontEndAppRepo)
        {
            _formManger = formManger;
            _formConfigRepo = formConfigRepo;
            _formConfigRevisionRepo = formConfigRevisionRepo;
            _unitOfWorkManager = unitOfWorkManager;
            _permissionedObjectManager = permissionedObjectManager;
        }

        /// <summary>
        /// Iten type
        /// </summary>
        public string ItemType => FormConfiguration.ItemTypeName;

        /// inheritedDoc
        public async Task<ConfigurationItem> ImportItemAsync(DistributedConfigurableItemBase item, IConfigurationItemsImportContext context) 
        {
            if (item == null)
                throw new ArgumentNullException(nameof(item));

            if (!(item is DistributedFormConfiguration formItem))
                throw new NotSupportedException($"{this.GetType().FullName} supports only items of type {nameof(DistributedFormConfiguration)}. Actual type is {item.GetType().FullName}");

            var form = await ImportFormAsync(formItem, context);
            await _unitOfWorkManager.Current.SaveChangesAsync();

            return form;
        }

        private bool FormsAreEqual(FormConfiguration form, DistributedFormConfiguration item) 
        {
            var revision = form.LatestRevision;

            return form != null &&
                revision != null && 
                (form.Module == null ? string.IsNullOrWhiteSpace(item.ModuleName) : form.Module.Name == item.ModuleName) &&
                form.Name == item.Name &&
                form.Suppress == item.Suppress &&

                revision.Markup == item.Markup &&
                revision.Label == item.Label &&
                revision.Description == item.Description &&
                revision.ModelType == item.ModelType &&
                revision.IsTemplate == item.IsTemplate;
        }

        /// inheritedDoc
        protected async Task<ConfigurationItem> ImportFormAsync(DistributedFormConfiguration item, IConfigurationItemsImportContext context)
        {
            // check if form exists
            var form = await _formConfigRepo.FirstOrDefaultAsync(f => f.Name == item.Name && (f.Module == null && item.ModuleName == null || f.Module != null && f.Module.Name == item.ModuleName));

            if (form != null && FormsAreEqual(form, item))
                return form;

            if (form == null) 
            {
                form = new FormConfiguration 
                { 
                    Module = await GetModuleAsync(item.ModuleName, context),
                    Name = item.Name,
                };
                await _formConfigRepo.InsertAsync(form);
            }
            var revision = form.MakeNewRevision();
            MapToForm(item, form, revision);
            revision.CreatedByImport = context.ImportResult;
            form.Normalize();

            await _formConfigRevisionRepo.InsertAsync(revision);
            
            form.LatestImportedRevisionId = revision.Id;
            await _formConfigRepo.UpdateAsync(form);

            await SetPermissionsAsync(item, form);

            return form;
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

        private void MapToForm(DistributedFormConfiguration item, FormConfiguration form, FormConfigurationRevision revision) 
        {
            form.Name = item.Name;
            
            form.Suppress = item.Suppress;

            revision.Label = item.Label;
            revision.Description = item.Description;
            revision.Markup = item.Markup;
            revision.ModelType = item.ModelType;
            revision.IsTemplate = item.IsTemplate;
        }
    }
}
