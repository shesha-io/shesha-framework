using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Linq;
using Abp.MemoryDb;
using Abp.MemoryDb.Repositories;
using NSubstitute;
using Shesha.ConfigurationItems.Distribution;
using Shesha.ConfigurationItems.Distribution.Exceptions;
using Shesha.ConfigurationItems.Distribution.Models;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.JsonLogic;
using Shesha.Services;
using Shesha.Utilities;
using Shesha.Web.FormsDesigner.Domain;
using Shesha.Web.FormsDesigner.Services;
using Shesha.Web.FormsDesigner.Services.Distribution;
using Shouldly;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.ConfigurationItems
{
    public class FormConfiguration_Tests: SheshaNhTestBase
    {
        [Fact]
        public async Task ShouldExport_Test() 
        {
            var dbProvider = GetMemoryDbProvider();

            var formRepository = new MemoryRepository<FormConfiguration, Guid>(dbProvider);
            var moduleRepository = new MemoryRepository<Module, Guid>(dbProvider);

            var module = new Module { Id = Guid.NewGuid(), Name = "test-module" };
            await moduleRepository.InsertAsync(module);

            var formConfig1 = MockFormConfiguration(c => {
                c.ModelType = "-ModelType";
                c.Markup = "{ components: [], settings: {} }";
                c.Configuration.Name = "test-form";
                c.Configuration.Label = "-Label";
                c.Configuration.Description = "-Description";

                c.Configuration.Module = module;
            });
            await formRepository.InsertAsync(formConfig1);

            var export = new FormConfigurationExport(formRepository);

            var exported = await export.ExportItemAsync(formConfig1.Id);
            exported.ShouldNotBeNull();
            exported.Name.ShouldBe(formConfig1.Configuration.Name);
            exported.Label.ShouldBe(formConfig1.Configuration.Label);
            exported.Description.ShouldBe(formConfig1.Configuration.Description);
            exported.ModuleName.ShouldBe(formConfig1.Configuration.Module?.Name);
        }

        [Fact]
        public async Task When_Import_Missing_Form() 
        {
            var src = PrepareImportContext();
            var srcForm = await src.AddForm(async c => {
                c.ModelType = "test-modelType";
                c.Markup = "{ components: [], settings: {} }";
                c.Configuration.Name = "test-form";
                c.Configuration.Label = "test-label";
                c.Configuration.Description = "test-description";

                c.Configuration.VersionNo = 2;
                c.Configuration.SetIsLast(true);
                c.Configuration.VersionStatus = ConfigurationItemVersionStatus.Live;
                c.Configuration.Module = await src.GetOrCreateModule("test-module");
            });

            var export = new FormConfigurationExport(src.FormRepo);
            var exported = await export.ExportItemAsync(srcForm.Id);

            var dst = PrepareImportContext();

            var asyncExecuter = Resolve<IAsyncQueryableExecuter>();
            var uowManager = Resolve<IUnitOfWorkManager>();
            var formManager = new FormManager(dst.FormRepo, dst.ConfigurationItemRepo, dst.ModuleRepo, uowManager);
            var importer = new FormConfigurationImport(formManager, dst.FormRepo,dst.GetRepository<ConfigurationItem, Guid>(), dst.ModuleRepo, uowManager);
            var importContext = new PackageImportContext()
            {
                CreateModules = true
            };
            var imported = await importer.ImportItemAsync(exported, importContext) as FormConfiguration;
            imported.ShouldNotBeNull();

            var dstModule = srcForm.Configuration.Module != null
                ? dst.ModuleRepo.GetAll().FirstOrDefault(m => m.Name == srcForm.Configuration.Module.Name)
                : null;

            var importedFormFromRepo = dst.FormRepo.GetAll()
                .Where(f => f.Configuration.Name == srcForm.Configuration.Name && f.Configuration.Module == dstModule)
                .OrderByDescending(f => f.Configuration.VersionNo)
                .FirstOrDefault();

            imported.ShouldBe(importedFormFromRepo, "Imported form should be a form with latest version number in the repo");

            imported.ShouldNotBeNull("Form should be created in the destination DB");
            imported.Id.ShouldNotBe(srcForm.Id, "A new Id should be generated for the form during the import");
            imported.Configuration.Name.ShouldBe(srcForm.Configuration.Name);
            imported.Configuration.Label.ShouldBe(srcForm.Configuration.Label);
            imported.Configuration.Description.ShouldBe(srcForm.Configuration.Description);
            imported.Configuration.Module?.Name.ShouldBe(srcForm.Configuration.Module?.Name);

            imported.Configuration.VersionNo.ShouldBe(1);
            imported.Configuration.VersionStatus.ShouldBe(srcForm.Configuration.VersionStatus);

            imported.Markup.ShouldBe(srcForm.Markup);
            imported.ModelType.ShouldBe(srcForm.ModelType);
        }

        [Fact]
        public async Task When_Import_Existing_Form()
        {
            var src = PrepareImportContext();
            var srcForm = await src.AddForm(async c => {
                c.ModelType = "test-modelType";
                c.Markup = "src-markup";
                c.Configuration.Name = "test-form";
                c.Configuration.Label = "test-label";
                c.Configuration.Description = "test-description";

                c.Configuration.VersionNo = 2;
                c.Configuration.SetIsLast(true);
                c.Configuration.VersionStatus = ConfigurationItemVersionStatus.Live;
                c.Configuration.Module = await src.GetOrCreateModule("test-module");
            });

            var export = new FormConfigurationExport(src.FormRepo);
            var exported = await export.ExportItemAsync(srcForm.Id);

            var dst = PrepareImportContext();
            var dstForm = await dst.AddForm(async c => {
                c.ModelType = "dst-test-modelType";
                c.Markup = "dst-markup";
                c.Configuration.Name = "test-form";
                c.Configuration.Label = "dst-test-label";
                c.Configuration.Description = "dst-test-description";

                c.Configuration.VersionNo = 10;
                c.Configuration.SetIsLast(true);
                c.Configuration.VersionStatus = ConfigurationItemVersionStatus.Live;
                c.Configuration.Module = await dst.GetOrCreateModule("test-module");
            });

            var asyncExecuter = Resolve<IAsyncQueryableExecuter>();
            var uowManager = Resolve<IUnitOfWorkManager>();
            var formManager = new FormManager(dst.FormRepo, dst.ConfigurationItemRepo, dst.ModuleRepo, uowManager);
            var importer = new FormConfigurationImport(formManager, dst.FormRepo, dst.GetRepository<ConfigurationItem, Guid>(), dst.ModuleRepo, uowManager);
            var importContext = new PackageImportContext()
            {
                CreateModules = true
            };
            var imported = await importer.ImportItemAsync(exported, importContext) as FormConfiguration;
            imported.ShouldNotBeNull();

            var dstModule = srcForm.Configuration.Module != null
                ? dst.ModuleRepo.GetAll().FirstOrDefault(m => m.Name == srcForm.Configuration.Module.Name)
                : null;

            var importedFormFromRepo = dst.FormRepo.GetAll()
                .Where(f => f.Configuration.Name == srcForm.Configuration.Name && f.Configuration.Module == dstModule)
                .OrderByDescending(f => f.Configuration.VersionNo)
                .FirstOrDefault();

            imported.ShouldBe(importedFormFromRepo, "Imported form should be a form with latest version number in the repo");

            imported.ShouldNotBeNull("Form should be created in the destination DB");
            imported.Id.ShouldNotBe(srcForm.Id, "A new Id should be generated for the form during the import");
            imported.Configuration.Name.ShouldBe(srcForm.Configuration.Name);
            imported.Configuration.Label.ShouldBe(srcForm.Configuration.Label);
            imported.Configuration.Description.ShouldBe(srcForm.Configuration.Description);
            imported.Configuration.Module?.Name.ShouldBe(srcForm.Configuration.Module?.Name);

            imported.Configuration.VersionNo.ShouldBe(dstForm.Configuration.VersionNo + 1);
            imported.Configuration.VersionStatus.ShouldBe(srcForm.Configuration.VersionStatus);

            // check prevoius version
            imported.Configuration.ParentVersion.ShouldBe(dstForm.Configuration, $"{nameof(imported.Configuration.ParentVersion)} should be set to last version of the form in the destination");
            dstForm.Configuration.VersionStatus.ShouldBe(ConfigurationItemVersionStatus.Retired, $"Last version of the form in the destination should be marked as {ConfigurationItemVersionStatus.Retired}");

            imported.Markup.ShouldBe(srcForm.Markup);
            imported.ModelType.ShouldBe(srcForm.ModelType);
        }

        [Fact]
        public async Task When_Import_Existing_Form_As_Draft()
        {
            var src = PrepareImportContext();
            var srcForm = await src.AddForm(async c => {
                c.ModelType = "test-modelType";
                c.Markup = "src-markup";
                c.Configuration.Name = "test-form";
                c.Configuration.Label = "test-label";
                c.Configuration.Description = "test-description";

                c.Configuration.VersionNo = 2;
                c.Configuration.SetIsLast(true);
                c.Configuration.VersionStatus = ConfigurationItemVersionStatus.Live;
                c.Configuration.Module = await src.GetOrCreateModule("test-module");
            });

            var export = new FormConfigurationExport(src.FormRepo);
            var exported = await export.ExportItemAsync(srcForm.Id);

            var dst = PrepareImportContext();
            var dstForm = await dst.AddForm(async c => {
                c.ModelType = "dst-test-modelType";
                c.Markup = "dst-markup";
                c.Configuration.Name = "test-form";
                c.Configuration.Label = "dst-test-label";
                c.Configuration.Description = "dst-test-description";

                c.Configuration.VersionNo = 10;
                c.Configuration.SetIsLast(true);
                c.Configuration.VersionStatus = ConfigurationItemVersionStatus.Live;
                c.Configuration.Module = await dst.GetOrCreateModule("test-module");
            });

            var asyncExecuter = Resolve<IAsyncQueryableExecuter>();
            var uowManager = Resolve<IUnitOfWorkManager>();
            var formManager = new FormManager(dst.FormRepo, dst.ConfigurationItemRepo, dst.ModuleRepo, uowManager);
            var importer = new FormConfigurationImport(formManager, dst.FormRepo, dst.GetRepository<ConfigurationItem, Guid>(), dst.ModuleRepo, uowManager);
            var importContext = new PackageImportContext()
            {
                CreateModules = true,
                ImportStatusAs = ConfigurationItemVersionStatus.Draft,
            };
            var imported = await importer.ImportItemAsync(exported, importContext) as FormConfiguration;
            imported.ShouldNotBeNull();

            var dstModule = srcForm.Configuration.Module != null
                ? dst.ModuleRepo.GetAll().FirstOrDefault(m => m.Name == srcForm.Configuration.Module.Name)
                : null;

            var importedFormFromRepo = dst.FormRepo.GetAll()
                .Where(f => f.Configuration.Name == srcForm.Configuration.Name && f.Configuration.Module == dstModule)
                .OrderByDescending(f => f.Configuration.VersionNo)
                .FirstOrDefault();

            imported.ShouldBe(importedFormFromRepo, "Imported form should be a form with latest version number in the repo");

            imported.ShouldNotBeNull("Form should be created in the destination DB");
            imported.Id.ShouldNotBe(srcForm.Id, "A new Id should be generated for the form during the import");
            imported.Configuration.Name.ShouldBe(srcForm.Configuration.Name);
            imported.Configuration.Label.ShouldBe(srcForm.Configuration.Label);
            imported.Configuration.Description.ShouldBe(srcForm.Configuration.Description);
            imported.Configuration.Module?.Name.ShouldBe(srcForm.Configuration.Module?.Name);

            imported.Configuration.VersionNo.ShouldBe(dstForm.Configuration.VersionNo + 1);
            imported.Configuration.VersionStatus.ShouldBe(ConfigurationItemVersionStatus.Draft);

            // check prevoius version
            imported.Configuration.ParentVersion.ShouldBe(dstForm.Configuration, $"{nameof(imported.Configuration.ParentVersion)} should be set to last version of the form in the destination");
            dstForm.Configuration.VersionStatus.ShouldBe(ConfigurationItemVersionStatus.Live, $"Status of existing form should remain Live");

            imported.Markup.ShouldBe(srcForm.Markup);
            imported.ModelType.ShouldBe(srcForm.ModelType);
        }

        [Fact]
        public async Task When_Import_The_Same_Form_Twice()
        {
            var src = PrepareImportContext();
            var srcForm = await src.AddForm(async c => {
                c.ModelType = "test-modelType";
                c.Markup = "src-markup";
                c.Configuration.Name = "test-form";
                c.Configuration.Label = "test-label";
                c.Configuration.Description = "test-description";

                c.Configuration.VersionNo = 2;
                c.Configuration.SetIsLast(true);
                c.Configuration.VersionStatus = ConfigurationItemVersionStatus.Live;
                c.Configuration.Module = await src.GetOrCreateModule("test-module");
            });

            var export = new FormConfigurationExport(src.FormRepo);
            var exported = await export.ExportItemAsync(srcForm.Id);

            var dst = PrepareImportContext();
            var dstForm = await dst.AddForm(async c => {
                c.ModelType = "dst-test-modelType";
                c.Markup = "dst-markup";
                c.Configuration.Name = "test-form";
                c.Configuration.Label = "dst-test-label";
                c.Configuration.Description = "dst-test-description";

                c.Configuration.VersionNo = 10;
                c.Configuration.SetIsLast(true);
                c.Configuration.VersionStatus = ConfigurationItemVersionStatus.Live;
                c.Configuration.Module = await dst.GetOrCreateModule("test-module");
            });

            var formsCountBeforeImport = await dst.FormRepo.CountAsync();

            var asyncExecuter = Resolve<IAsyncQueryableExecuter>();
            var uowManager = Resolve<IUnitOfWorkManager>();
            var formManager = new FormManager(dst.FormRepo, dst.ConfigurationItemRepo, dst.ModuleRepo, uowManager);
            var importer = new FormConfigurationImport(formManager, dst.FormRepo, dst.GetRepository<ConfigurationItem, Guid>(), dst.ModuleRepo, uowManager);
            var importContext = new PackageImportContext()
            {
                CreateModules = true
            };
            var imported1 = await importer.ImportItemAsync(exported, importContext) as FormConfiguration;
            imported1.ShouldNotBeNull();

            var formsCountAfterFirstImport = await dst.FormRepo.CountAsync();
            formsCountAfterFirstImport.ShouldBe(formsCountBeforeImport + 1, "First import should create one form");

            var imported2 = await importer.ImportItemAsync(exported, importContext) as FormConfiguration;
            imported2.ShouldNotBeNull();

            var formsCountAfterSecondImport = await dst.FormRepo.CountAsync();
            formsCountAfterSecondImport.ShouldBe(formsCountBeforeImport + 1, "Second import shouldn't create new form");

            /*
            1. Store Id of the source item during the import
            2. Before the item import check existing versions of this item, if the item was imported earlier - skip import (allow to override in in the import context)
            3. if imported version is the last one - check hash and update item. Need to find a way to identify was the item changed by the user after import.
                If the user made changes manually - don't apply auto update
                Try to use ExtSysLastSyncDate here
             */

            /*
            var dstModule = srcForm.Configuration.Module != null
                ? dst.ModuleRepo.GetAll().FirstOrDefault(m => m.Name == srcForm.Configuration.Module.Name)
                : null;

            var importedFormFromRepo = dst.FormRepo.GetAll()
                .Where(f => f.Configuration.Name == srcForm.Configuration.Name && f.Configuration.Module == dstModule)
                .OrderByDescending(f => f.Configuration.VersionNo)
                .FirstOrDefault();

            imported.ShouldBe(importedFormFromRepo, "Imported form should be a form with latest version number in the repo");

            imported.ShouldNotBeNull("Form should be created in the destination DB");
            imported.Id.ShouldNotBe(srcForm.Id, "A new Id should be generated for the form during the import");
            imported.Configuration.Name.ShouldBe(srcForm.Configuration.Name);
            imported.Configuration.Label.ShouldBe(srcForm.Configuration.Label);
            imported.Configuration.Description.ShouldBe(srcForm.Configuration.Description);
            imported.Configuration.Module?.Name.ShouldBe(srcForm.Configuration.Module?.Name);

            imported.Configuration.VersionNo.ShouldBe(dstForm.Configuration.VersionNo + 1);
            imported.Configuration.VersionStatus.ShouldBe(srcForm.Configuration.VersionStatus);

            // check prevoius version
            imported.Configuration.ParentVersion.ShouldBe(dstForm.Configuration, $"{nameof(imported.Configuration.ParentVersion)} should be set to last version of the form in the destination");
            dstForm.Configuration.VersionStatus.ShouldBe(ConfigurationItemVersionStatus.Retired, $"Last version of the form in the destination should be marked as {ConfigurationItemVersionStatus.Retired}");

            imported.Markup.ShouldBe(srcForm.Markup);
            imported.ModelType.ShouldBe(srcForm.ModelType);
            */
        }

        [Fact]
        public async Task When_Export_Multiple_Items() 
        {
            var dataFolder = Path.Combine(AppContext.BaseDirectory, "test-data");
            if (!Directory.Exists(dataFolder))
                Directory.CreateDirectory(dataFolder);
            var zipFileName = Path.Combine(dataFolder, "export.zip");
            if (File.Exists(zipFileName))
                File.Delete(zipFileName);

            var formRepo = Resolve<IRepository<FormConfiguration, Guid>>();
            var itemsBaseRepo = Resolve<IRepository<ConfigurationItemBase, Guid>>();

            var exporter = new FormConfigurationExport(formRepo);
            var packageManager = Resolve<IConfigurationPackageManager>();

            /*
            var filter = @"{ and: { ""=="": [{ ""var"": ""configuration.module.name"" }, ""shesha""] } }";
            var jslConverter = Resolve<IJsonLogic2LinqConverter>();
            var query = jslConverter.ParseExpressionOf<ConfigurationItemBase>(filter);
            */

            var formsToExport = new List<string> {
                "forms", "form-create", "form-details",
                "form-templates", "form-template-create", "form-template-details",
                "modules", "module-create", "module-details"            };
            await WithUnitOfWorkAsync(async () => {
                var asyncExecuter = Resolve<IAsyncQueryableExecuter>();
                var items = await asyncExecuter.ToListAsync(itemsBaseRepo.GetAll()
                    .Where(i => i.Configuration.IsLast)
                    .Where(i => i.Configuration.Module != null && i.Configuration.Module.Name.ToLower() == "shesha" && formsToExport.Contains(i.Configuration.Name))
                    //.Where(query)
                );

                var exportContext = new PreparePackageContext(items, DistributionHelper.ToExportersDictionary(new List<IConfigurableItemExport> { exporter }));
                var exportResult = await packageManager.PreparePackageAsync(exportContext);

                using (var zipStream = new FileStream(zipFileName, FileMode.CreateNew))
                {
                    await packageManager.PackAsync(exportResult, zipStream);
                }
            });

            File.Exists(zipFileName).ShouldBeTrue("Export file should be created");
            CompressionService.IsZipFile(zipFileName).ShouldBeTrue("Exported file should be a zip archive");
            
            // todo: check file content
        }

        [Fact]
        public async Task When_Import_Multiple_Items() 
        {
            /*
             * read zip file, prepare a list of item to import
             * use import settings:
             *  1. create modules automatically
             *  2. import dependencies
             *  3. ignore dependencies
             *  Front-end application - check registration mechanism, can be used for dependencies registration
             */
            var dataFolder = Path.Combine(AppContext.BaseDirectory, "test-data");
            if (!Directory.Exists(dataFolder))
                Directory.CreateDirectory(dataFolder);
            var zipFileName = Path.Combine(dataFolder, "export.zip");

            if (!File.Exists(zipFileName))
                throw new Exception($"Export file '{zipFileName}' doesn't exist");

            var dst = PrepareImportContext();
            var asyncExecuter = Resolve<IAsyncQueryableExecuter>();
            var uowManager = Resolve<IUnitOfWorkManager>();
            var formManager = new FormManager(dst.FormRepo, dst.ConfigurationItemRepo, dst.ModuleRepo, uowManager);
            var importer = new FormConfigurationImport(formManager, dst.FormRepo, dst.GetRepository<ConfigurationItem, Guid>(), dst.ModuleRepo, uowManager);
            
            var packageManager = Resolve<IConfigurationPackageManager>();

            //var importers = DistributionHelper.GetRegisteredImportersDictionary(LocalIocManager);
            var importers = DistributionHelper.ToImportersDictionary(new List<IConfigurableItemImport> { 
                importer,
            });
            var importContext = new PackageImportContext {
                CreateModules = true,
            };
            using (var stream = new FileStream(zipFileName, FileMode.Open)) 
            {
                using (var pack = await packageManager.ReadPackageAsync(stream, new ReadPackageContext(importers))) 
                {
                    var unsupportedItemTypes = pack.Items.Where(i => i.Importer == null).Select(i => i.ItemType).Distinct().ToList();
                    if (unsupportedItemTypes.Any())
                        throw new NotSupportedException("Following item types are not supported by the import process: " + unsupportedItemTypes.Delimited(", "));

                    foreach (var item in pack.Items)
                    {
                        using (var jsonStream = item.StreamGetter())
                        {
                            var itemDto = await item.Importer.ReadFromJsonAsync(jsonStream);
                            await item.Importer.ImportItemAsync(itemDto, importContext);
                        }
                    }
                }
            }
        }

        #region private declarations

        private TestImportContext PrepareImportContext() 
        {
            return new TestImportContext(GetMemoryDbProvider());
        }

        private IMemoryDatabaseProvider GetMemoryDbProvider() 
        {
            var database = new MemoryDatabase();
            var databaseProvider = Substitute.For<IMemoryDatabaseProvider>();
            databaseProvider.Database.Returns(database);

            return databaseProvider;
        }

        private static FormConfiguration MockFormConfiguration(Action<FormConfiguration> initAction) 
        { 
            var id = Guid.NewGuid();
            var formConfig = new FormConfiguration
            {
                Id = id,
                Markup = "markpup1",
                Configuration = new ConfigurationItem
                {
                    Id = id,
                }
            };

            initAction?.Invoke(formConfig);

            return formConfig;
        }

        private class TestImportContext
        {
            public IMemoryDatabaseProvider DbProvider { get; set; }
            public IRepository<FormConfiguration, Guid> FormRepo { get; set; }
            public IRepository<ConfigurationItem, Guid> ConfigurationItemRepo { get; set; }
            public IRepository<Module, Guid> ModuleRepo { get; set; }
            public async Task<FormConfiguration> AddForm(Action<FormConfiguration> initAction) 
            {
                var form = MockFormConfiguration(initAction);
                await FormRepo.InsertAsync(form);
                return form;
            }

            public async Task<Module> GetOrCreateModule(string moduleName) 
            {
                var module = await ModuleRepo.FirstOrDefaultAsync(m => m.Name == moduleName);
                if (module == null) 
                {
                    module = new Module { Id = Guid.NewGuid(), Name = moduleName };
                    await ModuleRepo.InsertAsync(module);
                }
                return module;
            }

            public IRepository<T, TId> GetRepository<T, TId>() where T: class, IEntity<TId>
            {
                return new MemoryRepository<T, TId>(DbProvider);
            }

            public TestImportContext(IMemoryDatabaseProvider dbProvider)
            {
                DbProvider = dbProvider;

                FormRepo = GetRepository<FormConfiguration, Guid>();
                ConfigurationItemRepo = GetRepository<ConfigurationItem, Guid>();
                ModuleRepo = GetRepository<Module, Guid>();
            }
        }

        #endregion
    }
}
