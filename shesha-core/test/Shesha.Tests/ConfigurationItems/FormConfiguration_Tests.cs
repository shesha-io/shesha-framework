using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Linq;
using Abp.MemoryDb;
using Abp.MemoryDb.Repositories;
using NSubstitute;
using Shesha.ConfigurationItems.Distribution;
using Shesha.ConfigurationItems.Distribution.Models;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.Permissions;
using Shesha.Services;
using Shesha.Utilities;
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
        public async Task ShouldExport_TestAsync() 
        {
            var dbProvider = GetMemoryDbProvider();

            var formRepository = new MemoryRepository<FormConfiguration, Guid>(dbProvider);
            var moduleRepository = new MemoryRepository<Module, Guid>(dbProvider);

            var module = new Module { Id = Guid.NewGuid(), Name = "test-module" };
            await moduleRepository.InsertAsync(module);

            var formConfig1 = await MockFormConfigurationAsync(c => {
                c.ModelType = "-ModelType";
                c.Markup = "{ components: [], settings: {} }";
                c.Name = "test-form";
                c.Label = "-Label";
                c.Description = "-Description";

                c.Module = module;
                return Task.CompletedTask;
            });
            await formRepository.InsertAsync(formConfig1);

            var permissionedObjectManager = Resolve<IPermissionedObjectManager>();
            var export = new FormConfigurationExport(formRepository, permissionedObjectManager);

            var exported = await export.ExportItemAsync(formConfig1.Id);
            exported.ShouldNotBeNull();
            exported.Name.ShouldBe(formConfig1.Name);
            exported.Label.ShouldBe(formConfig1.Label);
            exported.Description.ShouldBe(formConfig1.Description);
            exported.ModuleName.ShouldBe(formConfig1.Module?.Name);
        }

        [Fact]
        public async Task When_Import_Missing_FormAsync() 
        {
            var src = PrepareImportContext();
            var srcForm = await src.AddFormAsync(async c =>
            {
                c.ModelType = "test-modelType";
                c.Markup = "{ components: [], settings: {} }";
                c.Name = "test-form";
                c.Label = "test-label";
                c.Description = "test-description";

                c.VersionNo = 2;
                c.SetIsLast(true);
                c.VersionStatus = ConfigurationItemVersionStatus.Live;
                c.Module = await src.GetOrCreateModuleAsync("test-module");
            }).ConfigureAwait(true);

            var permissionedObjectManager = Resolve<IPermissionedObjectManager>();
            var export = new FormConfigurationExport(src.FormRepo, permissionedObjectManager);
            var exported = await export.ExportItemAsync(srcForm.Id);

            var dst = PrepareImportContext();

            var asyncExecuter = Resolve<IAsyncQueryableExecuter>();
            var uowManager = Resolve<IUnitOfWorkManager>();
            var formManager = new FormManager(dst.FormRepo, dst.ModuleRepo, uowManager, permissionedObjectManager);
            var importer = new FormConfigurationImport(dst.ModuleRepo, dst.FrontEndAppRepo, formManager, dst.FormRepo, uowManager, permissionedObjectManager);
            var importContext = new PackageImportContext()
            {
                CreateModules = true
            };
            var imported = await importer.ImportItemAsync(exported, importContext) as FormConfiguration;
            imported.ShouldNotBeNull();

            var dstModule = srcForm.Module != null
                ? dst.ModuleRepo.GetAll().FirstOrDefault(m => m.Name == srcForm.Module.Name)
                : null;

            var importedFormFromRepo = dst.FormRepo.GetAll()
                .Where(f => f.Name == srcForm.Name && f.Module == dstModule)
                .OrderByDescending(f => f.VersionNo)
                .FirstOrDefault();

            imported.ShouldBe(importedFormFromRepo, "Imported form should be a form with latest version number in the repo");

            imported.ShouldNotBeNull("Form should be created in the destination DB");
            imported.Id.ShouldNotBe(srcForm.Id, "A new Id should be generated for the form during the import");
            imported.Name.ShouldBe(srcForm.Name);
            imported.Label.ShouldBe(srcForm.Label);
            imported.Description.ShouldBe(srcForm.Description);
            imported.Module?.Name.ShouldBe(srcForm.Module?.Name);

            imported.VersionNo.ShouldBe(1);
            imported.VersionStatus.ShouldBe(srcForm.VersionStatus);

            imported.Markup.ShouldBe(srcForm.Markup);
            imported.ModelType.ShouldBe(srcForm.ModelType);
        }

        [Fact]
        public async Task When_Import_Existing_FormAsync()
        {
            var src = PrepareImportContext();
            var srcForm = await src.AddFormAsync(async c => {
                c.ModelType = "test-modelType";
                c.Markup = "src-markup";
                c.Name = "test-form";
                c.Label = "test-label";
                c.Description = "test-description";

                c.VersionNo = 2;
                c.SetIsLast(true);
                c.VersionStatus = ConfigurationItemVersionStatus.Live;
                c.Module = await src.GetOrCreateModuleAsync("test-module");
            });

            var permissionedObjectManager = Resolve<IPermissionedObjectManager>();
            var export = new FormConfigurationExport(src.FormRepo, permissionedObjectManager);
            var exported = await export.ExportItemAsync(srcForm.Id);

            var dst = PrepareImportContext();
            var dstForm = await dst.AddFormAsync(async c => {
                c.ModelType = "dst-test-modelType";
                c.Markup = "dst-markup";
                c.Name = "test-form";
                c.Label = "dst-test-label";
                c.Description = "dst-test-description";

                c.VersionNo = 10;
                c.SetIsLast(true);
                c.VersionStatus = ConfigurationItemVersionStatus.Live;
                c.Module = await dst.GetOrCreateModuleAsync("test-module");
            });

            var asyncExecuter = Resolve<IAsyncQueryableExecuter>();
            var uowManager = Resolve<IUnitOfWorkManager>();
            var formManager = new FormManager(dst.FormRepo, dst.ModuleRepo, uowManager, permissionedObjectManager);
            var importer = new FormConfigurationImport(dst.ModuleRepo, dst.FrontEndAppRepo, formManager, dst.FormRepo, uowManager, permissionedObjectManager);
            var importContext = new PackageImportContext()
            {
                CreateModules = true
            };
            var imported = await importer.ImportItemAsync(exported, importContext) as FormConfiguration;
            imported.ShouldNotBeNull();

            var dstModule = srcForm.Module != null
                ? dst.ModuleRepo.GetAll().FirstOrDefault(m => m.Name == srcForm.Module.Name)
                : null;

            var importedFormFromRepo = dst.FormRepo.GetAll()
                .Where(f => f.Name == srcForm.Name && f.Module == dstModule)
                .OrderByDescending(f => f.VersionNo)
                .FirstOrDefault();

            imported.ShouldBe(importedFormFromRepo, "Imported form should be a form with latest version number in the repo");

            imported.ShouldNotBeNull("Form should be created in the destination DB");
            imported.Id.ShouldNotBe(srcForm.Id, "A new Id should be generated for the form during the import");
            imported.Name.ShouldBe(srcForm.Name);
            imported.Label.ShouldBe(srcForm.Label);
            imported.Description.ShouldBe(srcForm.Description);
            imported.Module?.Name.ShouldBe(srcForm.Module?.Name);

            imported.VersionNo.ShouldBe(dstForm.VersionNo + 1);
            imported.VersionStatus.ShouldBe(srcForm.VersionStatus);

            // check prevoius version
            imported.ParentVersion.ShouldBe(dstForm, $"{nameof(imported.ParentVersion)} should be set to last version of the form in the destination");
            dstForm.VersionStatus.ShouldBe(ConfigurationItemVersionStatus.Retired, $"Last version of the form in the destination should be marked as {ConfigurationItemVersionStatus.Retired}");

            imported.Markup.ShouldBe(srcForm.Markup);
            imported.ModelType.ShouldBe(srcForm.ModelType);
        }

        [Fact]
        public async Task When_Import_Existing_Form_As_DraftAsync()
        {
            var src = PrepareImportContext();
            var srcForm = await src.AddFormAsync(async c => {
                c.ModelType = "test-modelType";
                c.Markup = "src-markup";
                c.Name = "test-form";
                c.Label = "test-label";
                c.Description = "test-description";

                c.VersionNo = 2;
                c.SetIsLast(true);
                c.VersionStatus = ConfigurationItemVersionStatus.Live;
                c.Module = await src.GetOrCreateModuleAsync("test-module");
            });

            var permissionedObjectManager = Resolve<IPermissionedObjectManager>();
            var export = new FormConfigurationExport(src.FormRepo, permissionedObjectManager);
            var exported = await export.ExportItemAsync(srcForm.Id);

            var dst = PrepareImportContext();
            var dstForm = await dst.AddFormAsync(async c => {
                c.ModelType = "dst-test-modelType";
                c.Markup = "dst-markup";
                c.Name = "test-form";
                c.Label = "dst-test-label";
                c.Description = "dst-test-description";

                c.VersionNo = 10;
                c.SetIsLast(true);
                c.VersionStatus = ConfigurationItemVersionStatus.Live;
                c.Module = await dst.GetOrCreateModuleAsync("test-module");
            });

            var asyncExecuter = Resolve<IAsyncQueryableExecuter>();
            var uowManager = Resolve<IUnitOfWorkManager>();
            var formManager = new FormManager(dst.FormRepo, dst.ModuleRepo, uowManager, permissionedObjectManager);
            var importer = new FormConfigurationImport(dst.ModuleRepo, dst.FrontEndAppRepo, formManager, dst.FormRepo, uowManager, permissionedObjectManager);
            var importContext = new PackageImportContext()
            {
                CreateModules = true,
                ImportStatusAs = ConfigurationItemVersionStatus.Draft,
            };
            var imported = await importer.ImportItemAsync(exported, importContext) as FormConfiguration;
            imported.ShouldNotBeNull();

            var dstModule = srcForm.Module != null
                ? dst.ModuleRepo.GetAll().FirstOrDefault(m => m.Name == srcForm.Module.Name)
                : null;

            var importedFormFromRepo = dst.FormRepo.GetAll()
                .Where(f => f.Name == srcForm.Name && f.Module == dstModule)
                .OrderByDescending(f => f.VersionNo)
                .FirstOrDefault();

            imported.ShouldBe(importedFormFromRepo, "Imported form should be a form with latest version number in the repo");

            imported.ShouldNotBeNull("Form should be created in the destination DB");
            imported.Id.ShouldNotBe(srcForm.Id, "A new Id should be generated for the form during the import");
            imported.Name.ShouldBe(srcForm.Name);
            imported.Label.ShouldBe(srcForm.Label);
            imported.Description.ShouldBe(srcForm.Description);
            imported.Module?.Name.ShouldBe(srcForm.Module?.Name);

            imported.VersionNo.ShouldBe(dstForm.VersionNo + 1);
            imported.VersionStatus.ShouldBe(ConfigurationItemVersionStatus.Draft);

            // check prevoius version
            imported.ParentVersion.ShouldBe(dstForm, $"{nameof(imported.ParentVersion)} should be set to last version of the form in the destination");
            dstForm.VersionStatus.ShouldBe(ConfigurationItemVersionStatus.Live, $"Status of existing form should remain Live");

            imported.Markup.ShouldBe(srcForm.Markup);
            imported.ModelType.ShouldBe(srcForm.ModelType);
        }

        [Fact]
        public async Task When_Import_The_Same_Form_TwiceAsync()
        {
             var src = PrepareImportContext();
            var srcForm = await src.AddFormAsync(async c => {
                c.ModelType = "test-modelType";
                c.Markup = "src-markup";
                c.Name = "test-form";
                c.Label = "test-label";
                c.Description = "test-description";

                c.VersionNo = 2;
                c.SetIsLast(true);
                c.VersionStatus = ConfigurationItemVersionStatus.Live;
                c.Module = await src.GetOrCreateModuleAsync("test-module");
            });

            var permissionedObjectManager = Resolve<IPermissionedObjectManager>();
            var export = new FormConfigurationExport(src.FormRepo, permissionedObjectManager);
            var exported = await export.ExportItemAsync(srcForm.Id);

            var dst = PrepareImportContext();
            var dstForm = await dst.AddFormAsync(async c => {
                c.ModelType = "dst-test-modelType";
                c.Markup = "dst-markup";
                c.Name = "test-form";
                c.Label = "dst-test-label";
                c.Description = "dst-test-description";

                c.VersionNo = 10;
                c.SetIsLast(true);
                c.VersionStatus = ConfigurationItemVersionStatus.Live;
                c.Module = await dst.GetOrCreateModuleAsync("test-module");
            });

            var formsCountBeforeImport = await dst.FormRepo.CountAsync();

            var asyncExecuter = Resolve<IAsyncQueryableExecuter>();
            var uowManager = Resolve<IUnitOfWorkManager>();

            using (var uow = uowManager.Begin()) 
            {
                var formManager = new FormManager(dst.FormRepo, dst.ModuleRepo, uowManager, permissionedObjectManager);
                var importer = new FormConfigurationImport(dst.ModuleRepo, dst.FrontEndAppRepo, formManager, dst.FormRepo, uowManager, permissionedObjectManager);
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

                await uow.CompleteAsync();
            }

            /*
            1. Store Id of the source item during the import
            2. Before the item import check existing versions of this item, if the item was imported earlier - skip import (allow to override in in the import context)
            3. if imported version is the last one - check hash and update item. Need to find a way to identify was the item changed by the user after import.
                If the user made changes manually - don't apply auto update
                Try to use ExtSysLastSyncDate here
             */

            /*
            var dstModule = srcForm.Module != null
                ? dst.ModuleRepo.GetAll().FirstOrDefault(m => m.Name == srcForm.Module.Name)
                : null;

            var importedFormFromRepo = dst.FormRepo.GetAll()
                .Where(f => f.Name == srcForm.Name && f.Module == dstModule)
                .OrderByDescending(f => f.VersionNo)
                .FirstOrDefault();

            imported.ShouldBe(importedFormFromRepo, "Imported form should be a form with latest version number in the repo");

            imported.ShouldNotBeNull("Form should be created in the destination DB");
            imported.Id.ShouldNotBe(srcForm.Id, "A new Id should be generated for the form during the import");
            imported.Name.ShouldBe(srcForm.Name);
            imported.Label.ShouldBe(srcForm.Label);
            imported.Description.ShouldBe(srcForm.Description);
            imported.Module?.Name.ShouldBe(srcForm.Module?.Name);

            imported.VersionNo.ShouldBe(dstForm.VersionNo + 1);
            imported.VersionStatus.ShouldBe(srcForm.VersionStatus);

            // check prevoius version
            imported.ParentVersion.ShouldBe(dstForm.Configuration, $"{nameof(imported.ParentVersion)} should be set to last version of the form in the destination");
            dstForm.VersionStatus.ShouldBe(ConfigurationItemVersionStatus.Retired, $"Last version of the form in the destination should be marked as {ConfigurationItemVersionStatus.Retired}");

            imported.Markup.ShouldBe(srcForm.Markup);
            imported.ModelType.ShouldBe(srcForm.ModelType);
            */
        }

        [Fact]
        public async Task When_Export_Multiple_ItemsAsync() 
        {
            var dataFolder = Path.Combine(AppContext.BaseDirectory, "test-data");
            if (!Directory.Exists(dataFolder))
                Directory.CreateDirectory(dataFolder);
            var zipFileName = Path.Combine(dataFolder, "export.zip");
            if (File.Exists(zipFileName))
                File.Delete(zipFileName);

            var formRepo = Resolve<IRepository<FormConfiguration, Guid>>();
            var itemsBaseRepo = Resolve<IRepository<ConfigurationItemBase, Guid>>();

            var permissionedObjectManager = Resolve<IPermissionedObjectManager>();
            var exporter = new FormConfigurationExport(formRepo, permissionedObjectManager);
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
                    .Where(i => i.IsLast)
                    .Where(i => i.Module != null && i.Module.Name.ToLower() == "shesha" && formsToExport.Contains(i.Name))
                    //.Where(query)
                );

                var exportContext = new PreparePackageContext(items, LocalIocManager);
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
        public async Task When_Import_Multiple_ItemsAsync() 
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
            var permissionedObjectManager = Resolve<IPermissionedObjectManager>();
            var formManager = new FormManager(dst.FormRepo, dst.ModuleRepo, uowManager, permissionedObjectManager);
            var importer = new FormConfigurationImport(dst.ModuleRepo, dst.FrontEndAppRepo, formManager, dst.FormRepo, uowManager, permissionedObjectManager);
            
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
                using (var pack = await packageManager.ReadPackageAsync(stream, new ReadPackageContext(LocalIocManager))) 
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

        private static async Task<FormConfiguration> MockFormConfigurationAsync(Func<FormConfiguration, Task> initAction) 
        { 
            var id = Guid.NewGuid();
            var formConfig = new FormConfiguration
            {
                Id = id,
                Markup = "markpup1",
            };

            if (initAction != null)
                await initAction?.Invoke(formConfig);

            return formConfig;
        }

        private class TestImportContext
        {
            public IMemoryDatabaseProvider DbProvider { get; set; }
            public IRepository<FormConfiguration, Guid> FormRepo { get; set; }
            public IRepository<ConfigurationItem, Guid> ConfigurationItemRepo { get; set; }
            public IRepository<Module, Guid> ModuleRepo { get; set; }
            public IRepository<FrontEndApp, Guid> FrontEndAppRepo { get; set; }
            public async Task<FormConfiguration> AddFormAsync(Func<FormConfiguration, Task> initAction) 
            {
                var form = await MockFormConfigurationAsync(initAction);
                await FormRepo.InsertAsync(form);
                return form;
            }

            public async Task<Module> GetOrCreateModuleAsync(string moduleName) 
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
                FrontEndAppRepo = GetRepository<FrontEndApp, Guid>();
            }
        }

        #endregion
    }
}
