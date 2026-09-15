using Abp.Dependency;
using Abp.Domain.Repositories;
using Newtonsoft.Json;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.Permissions.Distribution.Dto;
using Shesha.Services.ConfigurationItems;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Permissions.Distribution
{
    /// <summary>
    /// API permissions manifest import. Applies each entry of the manifest onto the corresponding
    /// <see cref="PermissionedObject"/> row via <see cref="IPermissionedObjectManager.SetAsync"/>, which
    /// matches existing rows on (Object, Type) -- the Type of every entry is preserved exactly as exported.
    /// </summary>
    public class ApiPermissionsManifestImport : ConfigurationItemImportBase, IApiPermissionsManifestImport, ITransientDependency
    {
        private readonly IRepository<PermissionedObject, Guid> _permissionedObjectRepo;
        private readonly IPermissionedObjectManager _permissionedObjectManager;
        private readonly IRepository<ApiPermissionsManifest, Guid> _manifestRepo;

        public ApiPermissionsManifestImport(
            IRepository<Module, Guid> moduleRepo,
            IRepository<FrontEndApp, Guid> frontEndAppRepo,
            IRepository<PermissionedObject, Guid> permissionedObjectRepo,
            IPermissionedObjectManager permissionedObjectManager,
            IRepository<ApiPermissionsManifest, Guid> manifestRepo
        ) : base(moduleRepo, frontEndAppRepo)
        {
            _permissionedObjectRepo = permissionedObjectRepo;
            _permissionedObjectManager = permissionedObjectManager;
            _manifestRepo = manifestRepo;
        }

        public string ItemType => ApiPermissionsManifest.ItemTypeName;

        /// inheritedDoc
        public async Task<ConfigurationItemBase> ImportItemAsync(DistributedConfigurableItemBase item, IConfigurationItemsImportContext context)
        {
            if (item == null)
                throw new ArgumentNullException(nameof(item));

            if (!(item is DistributedApiPermissionsManifest manifestItem))
                throw new NotSupportedException($"{this.GetType().FullName} supports only items of type {nameof(DistributedApiPermissionsManifest)}. Actual type is {item.GetType().FullName}");

            return await ImportManifestAsync(manifestItem, context);
        }

        /// inheritedDoc
        public async Task<DistributedConfigurableItemBase> ReadFromJsonAsync(Stream jsonStream)
        {
            using (var reader = new StreamReader(jsonStream))
            {
                var json = await reader.ReadToEndAsync();
                return JsonConvert.DeserializeObject<DistributedApiPermissionsManifest>(json);
            }
        }

        protected async Task<ConfigurationItemBase> ImportManifestAsync(DistributedApiPermissionsManifest item, IConfigurationItemsImportContext context)
        {
            var module = await GetModuleAsync(item.ModuleName, context);
            var moduleId = module?.Id;

            var existingManifest = await _manifestRepo.FirstOrDefaultAsync(m =>
                m.Name == ApiPermissionsManifest.ManifestName
                && (moduleId == null ? m.Module == null : m.Module != null && m.Module.Id == moduleId));

            var manifest = existingManifest ?? new ApiPermissionsManifest
            {
                Name = ApiPermissionsManifest.ManifestName,
                Module = module,
                VersionNo = 1,
            };

            manifest.Label = item.Label;
            manifest.Description = item.Description;
            manifest.Suppress = item.Suppress;
            // use status specified in the context with fallback to imported value
            manifest.VersionStatus = context.ImportStatusAs ?? item.VersionStatus;

            if (existingManifest == null)
            {
                manifest.Normalize();
                await _manifestRepo.InsertAsync(manifest);
            }
            else
            {
                await _manifestRepo.UpdateAsync(manifest);
            }

            // Parents before children so that child rows can resolve their parent when created for the first time.
            var orderedItems = item.Items
                .OrderBy(i => string.IsNullOrEmpty(i.Parent) ? 0 : 1)
                .ToList();

            foreach (var entry in orderedItems)
            {
                var dto = new PermissionedObjectDto
                {
                    Object = entry.Object,
                    Type = entry.Type,
                    Name = entry.Name,
                    Description = entry.Description,
                    Parent = entry.Parent,
                    Module = module?.Name,
                    ModuleId = module?.Id,
                    Access = entry.Access,
                    Permissions = entry.Permissions ?? new List<string>(),
                    Hidden = entry.Hidden,
                };

                await _permissionedObjectManager.SetAsync(dto);
            }

            return manifest;
        }
    }
}
