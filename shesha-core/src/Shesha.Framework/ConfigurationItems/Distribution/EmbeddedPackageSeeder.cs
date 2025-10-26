using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Shesha.ConfigurationItems.Distribution.Models;
using Shesha.Domain;
using Shesha.Extensions;
using Shesha.Startup;
using Shesha.Utilities;
using System;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Shesha.ConfigurationItems.Distribution
{
    /// <summary>
    /// Configuration packages seeder. Is used for automatical unpacking and importing (seeding) of `.spaconfig` packages
    /// </summary>
    public class EmbeddedPackageSeeder : IEmbeddedPackageSeeder, ITransientDependency
    {
        private readonly IRepository<ConfigurationPackageImportResult, Guid> _importResultRepository;
        private readonly IConfigurationPackageManager _packageManager;
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly IApplicationStartupSession _startupSession;
        private IRepository<ApplicationStartupAssembly, Guid> _startupAssemblyRepository;

        public EmbeddedPackageSeeder(IRepository<ConfigurationPackageImportResult, Guid> importResultRepository, 
            IConfigurationPackageManager packageManager, 
            IUnitOfWorkManager unitOfWorkManager, 
            IApplicationStartupSession startupSession,
            IRepository<ApplicationStartupAssembly, Guid> startupAssemblyRepository
        )
        {
            _importResultRepository = importResultRepository;
            _packageManager = packageManager;
            _unitOfWorkManager = unitOfWorkManager;
            _startupSession = startupSession;
            _startupAssemblyRepository = startupAssemblyRepository;
        }

        public async Task<bool> SeedEmbeddedPackagesAsync(EmbeddedPackageSeedingContext context)
        {
            context.Logger.Warn($"Seed packages for assembly '{context.Assembly.FullName}'");

            var resources = context.Assembly.GetManifestResourceNames();
            var embeddedPackages = resources.Select(r => TryGetPackageInfo(context.Assembly, r)).WhereNotNull().OrderBy(p => p.Date).ToList();

            if (!embeddedPackages.Any()) 
            {
                context.Logger.Warn($"Embedded packages not found");
                return false;
            }

            context.Logger.Warn($"Found {embeddedPackages.Count} embedded packages total");

            var importedPackages = await _importResultRepository.GetAll()
                .Where(r => r.IsSuccess && r.ImportedFile != null && r.ImportedFileMD5 != null)
                .Select(r => new { MD5 = r.ImportedFileMD5, FileName = r.ImportedFile.FileName })
                .ToListAsync();

            var readPackageContext = new ReadPackageContext() { SkipUnsupportedItems = true };

            var imported = false;

            foreach (var embeddedPackage in embeddedPackages)
            {
                context.CancellationToken.ThrowIfCancellationRequested();

                context.Logger.Info($"Check package '{embeddedPackage.ResourceName}'");

                using (var stream = embeddedPackage.Assembly.GetEmbeddedResourceStream(embeddedPackage.ResourceName)) 
                {
                    var md5 = FileHelper.GetMD5(stream);

                    if (importedPackages.Any(r => r.FileName == embeddedPackage.ResourceName && r.MD5 == md5)) 
                    {
                        context.Logger.Info($"Package '{embeddedPackage.ResourceName}' was successfully imported earlier - skipped");
                        continue;
                    }

                    context.Logger.Warn($"Importing package '{embeddedPackage.ResourceName}'");

                    using (var uow = _unitOfWorkManager.Begin(System.Transactions.TransactionScopeOption.RequiresNew)) 
                    {
                        var importResult = await _packageManager.CreateImportResultAsync(stream, embeddedPackage.ResourceName);
                        importResult.ApplicationStartupAssembly = await GetCurrentStartupAssemblyAsync(context);
                        await _importResultRepository.UpdateAsync(importResult);

                        using (var package = await _packageManager.ReadPackageAsync(stream, readPackageContext))
                        {
                            var packageImportContext = new PackageImportContext()
                            {
                                CancellationToken = context.CancellationToken,
                                CreateFrontEndApplications = true,
                                CreateModules = false,
                                Logger = context.Logger,
                                ImportResult = importResult,
                                IsMigrationImport = true,
                            };
                            try
                            {
                                await _packageManager.ImportAsync(package, packageImportContext);
                                await _unitOfWorkManager.Current.SaveChangesAsync();
                                imported = true;
                            }
                            catch (Exception e)
                            {
                                context.Logger.Error($"Package '{embeddedPackage.ResourceName}' import failed", e);
                                throw;
                            }
                        }
                        await uow.CompleteAsync();
                    }
                    context.Logger.Warn($"Package '{embeddedPackage.ResourceName}' imported successfully");
                }
            }

            return imported;
        }

        private async Task<ApplicationStartupAssembly?> GetCurrentStartupAssemblyAsync(EmbeddedPackageSeedingContext context) 
        {
            if (_startupSession.CurrentStartup == null)
                return null;

            var fileName = Path.GetFileName(context.Assembly.Location);
            var filePath = Path.GetDirectoryName(context.Assembly.Location);

            return await _startupAssemblyRepository.GetAll().Where(e => e.ApplicationStartup.Id == _startupSession.CurrentStartup.Id && e.FileName == fileName && e.FilePath == filePath)
                .FirstOrDefaultAsync();
        }

        protected EmbeddedPackageInfo? TryGetPackageInfo(Assembly assembly, string resourceName)
        {
            var packageRegex = new Regex(@"[.]*package(?'year'\d{4})(?'month'\d{2})(?'day'\d{2})_(?'hour'\d{2})(?'minute'\d{2})\.shaconfig");
            var match = packageRegex.Match(resourceName);

            if (!match.Success)
                return null;

            var version = $"{match.Groups["year"]}{match.Groups["month"]}{match.Groups["day"]}{match.Groups["hour"]}{match.Groups["minute"]}";

            if (!DateTime.TryParseExact(version, "yyyyMMddHHmm", CultureInfo.InvariantCulture, DateTimeStyles.None, out var date))
                return null;

            return new EmbeddedPackageInfo(assembly, resourceName, date, version);
        }
    }
}
