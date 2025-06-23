using Abp.Application.Services.Dto;
using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Runtime.Validation;
using Abp.UI;
using Microsoft.AspNetCore.Mvc;
using Shesha.Application.Services.Dto;
using Shesha.ConfigurationItems.Cache;
using Shesha.ConfigurationItems.Distribution;
using Shesha.ConfigurationItems.Distribution.Models;
using Shesha.ConfigurationItems.Dtos;
using Shesha.ConfigurationItems.Exceptions;
using Shesha.ConfigurationItems.Models;
using Shesha.Domain;
using Shesha.Dto.Interfaces;
using Shesha.Extensions;
using Shesha.Mvc;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using PackageImportResult = Shesha.ConfigurationItems.Dtos.PackageImportResult;

namespace Shesha.ConfigurationItems
{
    /// inheritedDoc
    public class ConfigurationItemAppService: SheshaCrudServiceBase<ConfigurationItem, EntityDto<Guid>, Guid, FilteredPagedAndSortedResultRequestDto, EntityDto<Guid>, EntityDto<Guid>>, IConfigurationItemAppService, ITransientDependency
        
    {
        private readonly IRepository<ConfigurationItem, Guid> _itemsRepository;
        private readonly IConfigurationPackageManager _packageManager;
        private readonly IConfigurationItemClientSideCache _clientSideCache;

        public ConfigurationItemAppService(IRepository<ConfigurationItem, Guid> repository, IRepository<ConfigurationItem, Guid> itemsRepository, IConfigurationPackageManager packageManager, IConfigurationItemClientSideCache clientSideCache) : base(repository)
        {
            _itemsRepository = itemsRepository;
            _packageManager = packageManager;
            _clientSideCache = clientSideCache;
        }

        /// inheritedDoc
        [HttpPost]
        public async Task<FileStreamResult> ExportPackageAsync(PackageExportInput input)
        {
            if (string.IsNullOrWhiteSpace(input.Filter))
                throw new AbpValidationException($"{nameof(input.Filter)} must be specified");

            var items = await _itemsRepository.GetAllFiltered(input.Filter).ToListAsync();

            var exportContext = new PreparePackageContext(items) { 
                ExportDependencies = input.ExportDependencies,
                VersionSelectionMode = input.VersionSelectionMode,
            };

            var pack = await _packageManager.PreparePackageAsync(exportContext);

#pragma warning disable IDISP001 // Dispose created
            var zipStream = new MemoryStream();
#pragma warning restore IDISP001 // Dispose created

            await _packageManager.PackAsync(pack, zipStream);

            var fileName = $"package{DateTime.Now:yyyyMMdd_HHmm}.shaconfig";
            return new ShaFileStreamResult(zipStream, fileName.GetContentType()) 
            { 
                FileDownloadName = fileName,
            };
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<AnalyzePackageResult> AnalyzePackageAsync([FromForm] AnalyzePackageInput input)
        {
            if (input.File == null)
                throw new UserFriendlyException("Please upload a package");

            using (var zipStream = input.File.OpenReadStream())
            {
                var context = new ReadPackageContext { 
                    SkipUnsupportedItems = true
                };
                using var package = await _packageManager.ReadPackageAsync(zipStream, context);

                var result = new AnalyzePackageResult();

                foreach (var item in package.Items) 
                {
                    if (item.Importer == null)
                        continue;

                    var module = result.Modules.FirstOrDefault(m => m.Name == item.ModuleName);
                    if (module == null) 
                    {
                        module = new PackageModuleDto { Name = item.ModuleName };
                        result.Modules.Add(module);
                    }

                    var itemType = module.ItemTypes.FirstOrDefault(it => it.Name == item.ItemType);
                    if (itemType == null)
                    {
                        itemType = new PackageItemTypeDto { Name = item.ItemType };
                        module.ItemTypes.Add(itemType);
                    }

                    using (var jsonStream = item.StreamGetter())
                    {
                        var srcItemDto = await item.Importer.ReadFromJsonAsync(jsonStream);

                        var itemDto = new PackageItemDto {
                            Id = srcItemDto.Id,
                            Name = srcItemDto.Name,
                            Label = srcItemDto.Label,
                            Description = srcItemDto.Description,
                            FrontEndApplication = srcItemDto.FrontEndApplication,
                        };
                        itemType.Items.Add(itemDto);
                    }
                }

                result.Modules = result.Modules.OrderBy(m => m.Name).ToList();
                foreach (var module in result.Modules) 
                {
                    module.ItemTypes = module.ItemTypes.OrderBy(it => it.Name).ToList();
                    foreach (var itemType in module.ItemTypes) 
                    {
                        itemType.Items = itemType.Items.OrderBy(item => item.FrontEndApplication != null ? 0 : 1).ThenBy(item => item.FrontEndApplication).ThenBy(item => item.Name).ToList();
                    }
                }

                return result;
            }
        }
            

        /// inheritedDoc
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<PackageImportResult> ImportPackageAsync([FromForm] PackageImportInput input)
        {
            using (var zipStream = input.File.OpenReadStream()) 
            {
                var context = new ReadPackageContext();
                using var package = await _packageManager.ReadPackageAsync(zipStream, context);

                var importContext = new PackageImportContext {
                    CreateModules = true,
                    CreateFrontEndApplications = true,
                    ShouldImportItem = item => item.Id.HasValue && input.ItemsToImport.Contains(item.Id.Value),
                };
                await _packageManager.ImportAsync(package, importContext);
            }

            await UnitOfWorkManager.Current.SaveChangesAsync();

            // todo: return statistic
            return new PackageImportResult();
        }

        /// inheritedDoc
        public Task ClearClientSideCacheAsync() 
        {
            return _clientSideCache.ClearAsync();
        }

        private IConfigurationItemManager GetSingleManager(ConfigurationItem item)
        {
            return IocManager.GetItemManager(item) ?? throw new ConfigurationItemManagerNotFoundException(item.GetType().Name);
        }

        /// <summary>
        /// Copy configuration item
        /// </summary>
        [HttpPost]
        public async Task<IConfigurationItemDto> CopyAsync(CopyItemInput input)
        {
            //CheckPermission(CopyPermissionName);
            var item = await GetItemAsync(input.ItemId);
            if (item == null)
                throw new EntityNotFoundException(typeof(ConfigurationItem), input.ItemId);

            var manager = GetSingleManager(item);

            var itemCopy = await manager.CopyAsync(item, input);

            await CurrentUnitOfWork.SaveChangesAsync();

            return await manager.MapToDtoAsync(itemCopy);
        }

        /// <summary>
        /// Move form to another module
        /// </summary>
        [HttpPost]
        public async Task<IConfigurationItemDto> MoveToModuleAsync(MoveItemToModuleInput input)
        {
            //CheckPermission(MovePermissionName);

            var item = await GetItemAsync(input.ItemId);

            var manager = GetSingleManager(item);

            await manager.MoveToModuleAsync(item, input);
            
            return await manager.MapToDtoAsync(item);
        }

        /// <summary>
        /// Delete form
        /// </summary>
        public override async Task DeleteAsync(EntityDto<Guid> input)
        {
            CheckDeletePermission();

            var item = await GetItemAsync(input.Id);

            var manager = GetSingleManager(item);

            await manager.DeleteAllVersionsAsync(item);
        }

        private async Task<ConfigurationItem> GetItemAsync(Guid id)
        {
            var item = await _itemsRepository.FirstOrDefaultAsync(ci => ci.Id == id);
            if (item == null)
                throw new EntityNotFoundException(typeof(ConfigurationItem), id);
            return item;
        }
    }
}
