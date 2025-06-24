using Abp.Runtime.Validation;
using Microsoft.AspNetCore.Mvc;
using Shesha.ConfigurationItems.Distribution.Models;
using Shesha.Extensions;
using Shesha.Mvc;
using System.IO;
using System.Threading.Tasks;
using System;
using Shesha.ConfigurationItems.Distribution;
using Abp.UI;
using System.Linq;
using Shesha.ConfigurationStudio.Dtos;

namespace Shesha.ConfigurationStudio
{
    /// <summary>
    /// Configuration Studio application service
    /// </summary>
    public partial class ConfigurationStudioAppService : SheshaAppServiceBase
    {
        public IConfigurationPackageManager PackageManager { get; set; }

        [HttpPost]
        public async Task<FileStreamResult> ExportPackageAsync(PackageExportInput input)
        {
            if (string.IsNullOrWhiteSpace(input.Filter))
                throw new AbpValidationException($"{nameof(input.Filter)} must be specified");

            var items = await ItemRepo.GetAllFiltered(input.Filter).ToListAsync();

            var exportContext = new PreparePackageContext(items)
            {
                ExportDependencies = input.ExportDependencies,
                VersionSelectionMode = input.VersionSelectionMode,
            };

            var pack = await PackageManager.PreparePackageAsync(exportContext);

#pragma warning disable IDISP001 // Dispose created
            var zipStream = new MemoryStream();
#pragma warning restore IDISP001 // Dispose created

            await PackageManager.PackAsync(pack, zipStream);

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
                var context = new ReadPackageContext
                {
                    SkipUnsupportedItems = true
                };
                using var package = await PackageManager.ReadPackageAsync(zipStream, context);

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

                        var itemDto = new PackageItemDto
                        {
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
                using var package = await PackageManager.ReadPackageAsync(zipStream, context);

                var importContext = new PackageImportContext
                {
                    CreateModules = true,
                    CreateFrontEndApplications = true,
                    ShouldImportItem = item => item.Id.HasValue && input.ItemsToImport.Contains(item.Id.Value),
                };
                await PackageManager.ImportAsync(package, importContext);
            }

            await UnitOfWorkManager.Current.SaveChangesAsync();

            // todo: return statistic
            return new PackageImportResult();
        }
    }
}