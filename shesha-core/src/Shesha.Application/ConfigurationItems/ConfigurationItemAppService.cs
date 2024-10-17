using Abp.Application.Services.Dto;
using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Runtime.Validation;
using Microsoft.AspNetCore.Mvc;
using Shesha.Application.Services.Dto;
using Shesha.ConfigurationItems.Cache;
using Shesha.ConfigurationItems.Distribution;
using Shesha.ConfigurationItems.Distribution.Models;
using Shesha.ConfigurationItems.Dtos;
using Shesha.ConfigurationItems.Exceptions;
using Shesha.ConfigurationItems.Models;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.Dto.Interfaces;
using Shesha.Extensions;
using Shesha.Mvc;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using PackageImportResult = Shesha.ConfigurationItems.Dtos.PackageImportResult;

namespace Shesha.ConfigurationItems
{
    /// inheritedDoc
    public class ConfigurationItemAppService: SheshaCrudServiceBase<ConfigurationItem, EntityDto<Guid>, Guid, FilteredPagedAndSortedResultRequestDto, EntityDto<Guid>, EntityDto<Guid>>, IConfigurationItemAppService, ITransientDependency
        
    {
        private readonly IRepository<ConfigurationItemBase, Guid> _itemsRepository;
        private readonly IConfigurationPackageManager _packageManager;
        private readonly IConfigurationItemClientSideCache _clientSideCache;

        public ConfigurationItemAppService(IRepository<ConfigurationItem, Guid> repository, IRepository<ConfigurationItemBase, Guid> itemsRepository, IConfigurationPackageManager packageManager, IConfigurationItemClientSideCache clientSideCache) : base(repository)
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

            var exportСontext = new PreparePackageContext(items) { 
                ExportDependencies = input.ExportDependencies,
                VersionSelectionMode = input.VersionSelectionMode,
            };

            var pack = await _packageManager.PreparePackageAsync(exportСontext);

            var zipStream = new MemoryStream();
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
            using (var zipStream = input.File.OpenReadStream())
            {
                var context = new ReadPackageContext { 
                    SkipUnsupportedItems = true
                };
                var package = await _packageManager.ReadPackageAsync(zipStream, context);

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
                var package = await _packageManager.ReadPackageAsync(zipStream, context);

                var importContext = new PackageImportContext {
                    CreateModules = true,
                    CreateFrontEndApplications = true,
                    ImportStatusAs = ConfigurationItemVersionStatus.Live,
                    ShouldImportItem = item => item.Id.HasValue && input.ItemsToImport.Contains(item.Id.Value),
                };
                await _packageManager.ImportAsync(package, importContext);
            }

            UnitOfWorkManager.Current.SaveChanges();

            // todo: return statistic
            return new PackageImportResult();
        }

        /// inheritedDoc
        public async Task ClearClientSideCache() 
        {
            await _clientSideCache.ClearAsync();
        }

        /// <summary>
        /// Update form status
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        [HttpPut]
        public async Task UpdateStatus(UpdateItemStatusInput input)
        {
            // todo: check rights

            var validationResults = new List<ValidationResult>();
            if (string.IsNullOrWhiteSpace(input.Filter))
                validationResults.Add(new ValidationResult("Filter is mandatory", new string[] { nameof(input.Filter) }));
            if (validationResults.Any())
                throw new AbpValidationException("Please correct the errors and try again", validationResults);

            var items = await _itemsRepository.GetAllFiltered(input.Filter).ToListAsync();

            foreach (var item in items)
            {
                var manager = GetSingleManager(item);

                await manager.UpdateStatusAsync(item, input.Status);
            }

            await UnitOfWorkManager.Current.SaveChangesAsync();
        }

        private IConfigurationItemManager GetSingleManager(ConfigurationItemBase item)
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
                throw new EntityNotFoundException(typeof(ConfigurationItemBase), input.ItemId);

            var manager = GetSingleManager(item);

            var itemCopy = await manager.CopyAsync(item, input);

            await CurrentUnitOfWork.SaveChangesAsync();

            return await manager.MapToDtoAsync(itemCopy);
        }

        /// <summary>
        /// Cancel version
        /// </summary>
        /// <exception cref="AbpValidationException"></exception>
        [HttpPost]
        public async Task<IConfigurationItemDto> CancelVersion(CancelItemVersionInput input)
        {
            CheckCreatePermission();

            var item = await GetItemAsync(input.Id);

            var validationResults = new List<ValidationResult>();

            if (item.VersionStatus != ConfigurationItemVersionStatus.Ready)
                validationResults.Add(new ValidationResult($"This operation is allowed only for items with '{ConfigurationItemVersionStatus.Ready}' status"));

            if (!item.IsLast)
                validationResults.Add(new ValidationResult($"This operation is allowed only for last version of form"));

            if (validationResults.Any())
                throw new AbpValidationException("Failed to cancel version", validationResults);

            var manager = GetSingleManager(item);

            await manager.CancelVersoinAsync(item);

            await CurrentUnitOfWork.SaveChangesAsync();

            return await manager.MapToDtoAsync(item);
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
        /// Create new version of form configuration
        /// </summary>
        /// <exception cref="AbpValidationException"></exception>
        [HttpPost]
        public async Task<IConfigurationItemDto> CreateNewVersion(CreateItemNewVersionInput input)
        {
            //CheckCreatePermission();

            var item = await GetItemAsync(input.Id);

            var validationResults = new List<ValidationResult>();

            if (item.VersionStatus != ConfigurationItemVersionStatus.Live &&
                item.VersionStatus != ConfigurationItemVersionStatus.Cancelled)
                validationResults.Add(new ValidationResult($"Creation of new version allowed only for items with '{ConfigurationItemVersionStatus.Live}' or '{ConfigurationItemVersionStatus.Cancelled}' status"));

            if (!item.IsLast)
                validationResults.Add(new ValidationResult($"Creation of new version allowed only for last version of item"));

            if (validationResults.Any())
                throw new AbpValidationException("Failed to create new version", validationResults);

            var manager = GetSingleManager(item);

            var newVersion = await manager.CreateNewVersionAsync(item);
            await CurrentUnitOfWork.SaveChangesAsync();

            return await manager.MapToDtoAsync(newVersion);
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

        private async Task<ConfigurationItemBase> GetItemAsync(Guid id)
        {
            var item = await _itemsRepository.FirstOrDefaultAsync(ci => ci.Id == id);
            if (item == null)
                throw new EntityNotFoundException(typeof(ConfigurationItemBase), id);
            return item;
        }
    }
}
