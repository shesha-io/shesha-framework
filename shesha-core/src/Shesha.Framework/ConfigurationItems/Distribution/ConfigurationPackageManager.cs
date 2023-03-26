using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Timing;
using Shesha.ConfigurationItems.Distribution.Exceptions;
using Shesha.ConfigurationItems.Distribution.Models;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.Exceptions;
using Shesha.Services;
using Shesha.Utilities;
using System;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.ConfigurationItems.Distribution
{
    /// <summary>
    /// Configuration pack manager
    /// </summary>
    public class ConfigurationPackageManager : IConfigurationPackageManager, ITransientDependency
    {
        public const string NoModuleFolder = "[no-module]";

        private readonly IStoredFileService _storedFileService;
        private readonly IRepository<ConfigurationPackageImportResult, Guid> _importResultRepository;

        public ConfigurationPackageManager(IStoredFileService storedFileService, IRepository<ConfigurationPackageImportResult, Guid> importResultRepository)
        {
            _storedFileService = storedFileService;
            _importResultRepository = importResultRepository;
        }

        /// inheritedDoc
        public async Task PackAsync(ConfigurationItemsExportResult exportResult, Stream stream)
        {
            using (var zip = new ZipArchive(stream, ZipArchiveMode.Create, leaveOpen: true))
            {
                foreach (var item in exportResult.Items)
                {
                    var entry = zip.CreateEntry(item.RelativePath);

                    using (var entryStream = entry.Open())
                    {
                        await item.Exporter.WriteToJsonAsync(item.ItemData, entryStream);
                    }
                }
            }
            stream.Position = 0;
        }

        /// inheritedDoc
        public async Task<ConfigurationItemsExportResult> PreparePackageAsync(PreparePackageContext context)
        {
            var result = new ConfigurationItemsExportResult();
            foreach (var item in context.Items)
            {
                await ProcessItemExportAsync(item, result, context);
            }
            return result;
        }

        /// inheritedDoc
        public Task<ConfigurationItemsPackage> ReadPackageAsync(Stream stream, ReadPackageContext context)
        {
            var zip = new ZipArchive(stream, ZipArchiveMode.Read);
            var pack = new ConfigurationItemsPackage(zip);

            foreach (var entry in zip.Entries)
            {
                var parts = entry.FullName.Split(Path.DirectorySeparatorChar);

                if (parts.Length == 3 || parts.Length == 4) 
                {
                    var containsAppKey = parts.Length == 4;

                    var item = new ConfigurationItemsPackageItem
                    {
                        ModuleName = parts[0],
                        ItemType = parts[1],
                        StreamGetter = () => entry.Open(),
                    };

                    item.FileName = containsAppKey ? parts[3] : parts[2];
                    item.ApplicationKey = containsAppKey ? parts[2] : null;

                    if (!context.Importers.TryGetValue(item.ItemType, out var importer))
                        if (!context.SkipUnsupportedItems)
                            throw new ImporterNotFoundException(item.ItemType);

                    item.Importer = importer;

                    pack.Items.Add(item);
                }
            }

            return Task.FromResult(pack);
        }

        private async Task ProcessItemExportAsync(ConfigurationItemBase item, ConfigurationItemsExportResult exportResult, PreparePackageContext context)
        {
            var path = GetItemRelativePath(item);
            if (exportResult.Items.Any(i => i.RelativePath == path))
                return;

            if (!context.Exporters.TryGetValue(item.ItemType, out var exporter))
                throw new ExporterNotFoundException(item.ItemType);

            var dto = await exporter.ExportItemAsync(item);

            var exportItem = new ConfigurationItemsExportItem
            {
                RelativePath = GetItemRelativePath(item),
                ItemData = dto,
                Exporter = exporter,
            };
            exportResult.Items.Add(exportItem);

            // recursively export dependencies if requested
            if (context.ExportDependencies)
            {
                var dependencies = await item.GetDependenciesAsync();
                foreach (var dependency in dependencies)
                {
                    await ProcessItemExportAsync(dependency, exportResult, context);
                }
            }
        }

        private string GetItemRelativePath(ConfigurationItemBase item)
        {
            var moduleFolder = item.Module != null
                ? item.Module.Name
                : NoModuleFolder;

            var folder = item.Application != null
                ? Path.Combine(moduleFolder, item.ItemType, item.Application.AppKey)
                : Path.Combine(moduleFolder, item.ItemType);

            return Path.Combine(folder, $"{item.Name.RemovePathIllegalCharacters()}.json");
        }

        public async Task ImportAsync(ConfigurationItemsPackage package, PackageImportContext context)
        {
            async Task updateResultAsync(Action<ImportResult> updateAction)
            {
                if (context.ImportResult == null)
                    return;

                updateAction.Invoke(context.ImportResult);
                await _importResultRepository.UpdateAsync(context.ImportResult);
            }

            try
            {
                var unsupportedItemTypes = package.Items.Where(i => i.Importer == null).Select(i => i.ItemType).Distinct().ToList();
                if (unsupportedItemTypes.Any())
                    throw new NotSupportedException("Following item types are not supported by the import process: " + unsupportedItemTypes.Delimited(", "));

                context.Logger.Info($"Importing package ({package.Items.Count()} items total)");

                var rowNo = 1;
                var totalItems = package.Items.Count();
                var startTime = Clock.Now;

                foreach (var item in package.Items)
                {
                    context.CancellationToken.ThrowIfCancellationRequested();

                    try
                    {
                        using (var jsonStream = item.StreamGetter())
                        {
                            var itemDto = await item.Importer.ReadFromJsonAsync(jsonStream);

                            var shouldImport = context.ShouldImportItem == null || context.ShouldImportItem.Invoke(itemDto);

                            if (shouldImport)
                            {
                                await item.Importer.ImportItemAsync(itemDto, context);
                            }
                            else
                                context.Logger.Info($"Item skipped by condition");

                        }
                    }
                    catch (Exception e)
                    {
                        context.Logger.Error($"Item import failed", e);
                        throw;
                    }

                    var span = (Clock.Now - startTime);
                    var speed = Math.Round(rowNo / (span.TotalSeconds > 0 ? span.TotalSeconds : 1), 2);
                    //importResult.AvgSpeed = Convert.ToDecimal(speed);
                    var estimated = new TimeSpan(span.Ticks / rowNo * totalItems);
                    context.Logger.Info($"processed {rowNo} from {totalItems} ({(double)rowNo / totalItems * 100:0.#}%), estimated time = {estimated.Minutes:D2}:{estimated.Seconds:D2}:{estimated.Milliseconds:D3}, speed = {speed} row/sec");
                    rowNo++;

                    await updateResultAsync(res => {
                        res.AvgSpeed = Convert.ToDecimal(speed);
                    });
                }

                context.Logger.Info($"Package imported successfully");

                await updateResultAsync(res => {
                    res.IsSuccess = true;
                    res.FinishedOn = Clock.Now;
                });
            }
            catch (Exception e) 
            {
                await updateResultAsync(res => {
                    res.IsSuccess = false;
                    res.ErrorMessage = e.FullMessage();
                });

                throw;
            }
        }

        /// inheritedDoc
        public async Task<ConfigurationPackageImportResult> CreateImportResultAsync(Stream packageStream, string fileName)
        {
            var importedFile = await _storedFileService.SaveFileAsync(packageStream, fileName);
            var md5 = FileHelper.GetMD5(packageStream);

            var result = new ConfigurationPackageImportResult
            {
                StartedOn = Clock.Now,
                ImportedFile = importedFile,
                ImportedFileMD5 = md5,                
            };
            await _importResultRepository.InsertAsync(result);
            return result;
        }
    }
}
