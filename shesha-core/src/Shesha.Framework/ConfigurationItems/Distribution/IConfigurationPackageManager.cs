using Microsoft.AspNetCore.Http;
using Shesha.ConfigurationItems.Distribution.Models;
using Shesha.Domain;
using System.IO;
using System.Threading.Tasks;

namespace Shesha.ConfigurationItems.Distribution
{
    /// <summary>
    /// Configuration pack manager
    /// </summary>
    public interface IConfigurationPackageManager
    {
        /// <summary>
        /// Read exported package
        /// </summary>
        /// <param name="stream"></param>
        /// <param name="context"></param>
        /// <returns></returns>
        Task<ConfigurationItemsPackage> ReadPackageAsync(Stream stream, ReadPackageContext context);

        /// <summary>
        /// Analyze package
        /// </summary>
        /// <param name="stream">Stream that contains package content</param>
        /// <param name="context">Package reading context</param>
        /// <returns></returns>
        Task<AnalyzePackageResponse> AnalyzePackageAsync(Stream stream, ReadPackageContext context);

        /// <summary>
        /// Import package
        /// </summary>
        /// <returns></returns>
        Task ImportAsync(ConfigurationItemsPackage package, PackageImportContext context);

        /// <summary>
        /// Prepare package for export
        /// </summary>
        /// <param name="context"></param>
        /// <returns></returns>
        Task<ConfigurationItemsExportResult> PreparePackageAsync(PreparePackageContext context);

        /// <summary>
        /// Pack export result into zip archive
        /// </summary>
        /// <param name="exportResult">Export results</param>
        /// <param name="stream">Stream to write zip archive to</param>
        Task PackAsync(ConfigurationItemsExportResult exportResult, Stream stream);

        /// <summary>
        /// Create import result
        /// </summary>
        /// <returns></returns>
        Task<ConfigurationPackageImportResult> CreateImportResultAsync(Stream packageStream, string fileName);

        /// <summary>
        /// Merge packages
        /// </summary>
        /// <param name="packages">Packages to merge</param>
        /// <param name="stream">Output stream</param>
        /// <returns></returns>
        Task MergePackagesAsync(IFormFile[] packages, Stream stream);
    }
}
