using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Extensions;
using Abp.Linq.Extensions;
using Newtonsoft.Json;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.Extensions;
using Shesha.Permissions.Distribution.Dto;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Permissions.Distribution
{
    /// <summary>
    /// API permissions manifest export. Reads the module's <see cref="PermissionedObject"/> rows of type
    /// <see cref="ShaPermissionedObjectsTypes.WebApi"/> / <see cref="ShaPermissionedObjectsTypes.WebApiAction"/> live --
    /// the manifest entity itself carries no payload of its own.
    /// </summary>
    public class ApiPermissionsManifestExport : IApiPermissionsManifestExport, ITransientDependency
    {
        private readonly IRepository<PermissionedObject, Guid> _permissionedObjectRepo;
        private readonly IRepository<ApiPermissionsManifest, Guid> _manifestRepo;

        public ApiPermissionsManifestExport(
            IRepository<PermissionedObject, Guid> permissionedObjectRepo,
            IRepository<ApiPermissionsManifest, Guid> manifestRepo
        )
        {
            _permissionedObjectRepo = permissionedObjectRepo;
            _manifestRepo = manifestRepo;
        }

        public string ItemType => ApiPermissionsManifest.ItemTypeName;

        /// inheritedDoc
        public async Task<DistributedConfigurableItemBase> ExportItemAsync(Guid id)
        {
            var manifest = await _manifestRepo.GetAsync(id);
            return await ExportItemAsync(manifest);
        }

        /// inheritedDoc
        public async Task<DistributedConfigurableItemBase> ExportItemAsync(ConfigurationItemBase item)
        {
            if (!(item is ApiPermissionsManifest manifest))
                throw new ArgumentException($"Wrong type of argument {item}. Expected {nameof(ApiPermissionsManifest)}, actual: {item.GetType().FullName}");

            var moduleId = manifest.Module?.Id;

            var permissionedObjects = await _permissionedObjectRepo.GetAll()
                .WhereIf(moduleId.HasValue, x => x.Module.Id == moduleId)
                .WhereIf(!moduleId.HasValue, x => x.Module == null)
                .Where(x => x.Type == ShaPermissionedObjectsTypes.WebApi || x.Type == ShaPermissionedObjectsTypes.WebApiAction)
                .ToListAsync();

            var result = new DistributedApiPermissionsManifest
            {
                Id = manifest.Id,
                Name = manifest.Name,
                ModuleName = manifest.Module?.Name,
                ItemType = manifest.ItemType,

                Label = manifest.Label,
                Description = manifest.Description,
                OriginId = manifest.Origin?.Id,
                BaseItem = manifest.BaseItem?.Id,
                VersionNo = manifest.VersionNo,
                VersionStatus = manifest.VersionStatus,
                ParentVersionId = manifest.ParentVersion?.Id,
                Suppress = manifest.Suppress,

                Items = permissionedObjects.Select(o => new DistributedPermissionedObject
                {
                    Object = o.Object,
                    Type = o.Type,
                    Name = o.Name,
                    Description = o.Description,
                    Parent = o.Parent,
                    Access = o.Access,
                    Permissions = string.IsNullOrWhiteSpace(o.Permissions)
                        ? new List<string>()
                        : o.Permissions.Split(',').Select(p => p.Trim()).Where(p => !string.IsNullOrEmpty(p)).ToList(),
                    Hidden = o.Hidden,
                }).ToList(),
            };

            return result;
        }

        /// inheritedDoc
        public async Task WriteToJsonAsync(DistributedConfigurableItemBase item, Stream jsonStream)
        {
            var json = JsonConvert.SerializeObject(item, Formatting.Indented);
            using (var writer = new StreamWriter(jsonStream))
            {
                await writer.WriteAsync(json);
            }
        }
    }
}
