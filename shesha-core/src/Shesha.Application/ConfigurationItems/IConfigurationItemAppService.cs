using Abp.Application.Services;
using Microsoft.AspNetCore.Mvc;
using Shesha.ConfigurationItems.Dtos;
using System.Threading.Tasks;

namespace Shesha.ConfigurationItems
{
    /// <summary>
    /// Configuration item application service. Performs base operations on the configuration items
    /// </summary>
    public interface IConfigurationItemAppService: IApplicationService
    {
        /// <summary>
        /// Import configuration items
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        Task<FileStreamResult> ExportPackageAsync(PackageExportInput input);

        /// <summary>
        /// Export configuration items
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        Task<PackageImportResult> ImportPackageAsync(PackageImportInput input);

        /// <summary>
        /// Analyze zip package an get summary
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        Task<AnalyzePackageResult> AnalyzePackageAsync([FromForm] AnalyzePackageInput input);

        /// <summary>
        /// Clean client side cache
        /// </summary>
        /// <returns></returns>
        Task ClearClientSideCache();
    }
}
