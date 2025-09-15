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
        public async Task<AnalyzePackageResponse> AnalyzePackageAsync([FromForm] AnalyzePackageInput input)
        {
            if (input.File == null)
                throw new UserFriendlyException("Please upload a package");

            using (var zipStream = input.File.OpenReadStream())
            {
                var context = new ReadPackageContext
                {
                    SkipUnsupportedItems = true
                };
                return await PackageManager.AnalyzePackageAsync(zipStream, context);
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
                    ShouldImportItem = item => input.ItemsToImport.Contains(item.Id),
                };
                await PackageManager.ImportAsync(package, importContext);
            }

            await UnitOfWorkManager.Current.SaveChangesAsync();

            // todo: return statistic
            return new PackageImportResult();
        }
    }
}