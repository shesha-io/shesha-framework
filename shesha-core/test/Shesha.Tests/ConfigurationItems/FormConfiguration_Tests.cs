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
using Shesha.Extensions;
using Shesha.Permissions;
using Shesha.Reflection;
using Shesha.Services;
using Shesha.Tests.Fixtures;
using Shesha.Utilities;
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
    [Collection(SqlServerCollection.Name)]
    public class FormConfigurationTests : SheshaNhTestBase
    {
        public FormConfigurationTests(SqlServerFixture fixture) : base(fixture)
        {
        }

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
            var srcModule = await src.GetOrCreateModuleAsync("test-import-missing-form-module");
            var srcForm = await src.AddFormAsync(c =>
            {
                c.ModelType = "test-modelType";
                c.Markup = "{ components: [], settings: {} }";
                c.Name = "test-import-missing-form";
                c.Label = "test-label";
                c.Description = "test-description";

                c.VersionNo = 2;
                c.SetIsLast(true);
                c.VersionStatus = ConfigurationItemVersionStatus.Live;
                c.Module = srcModule;
                return Task.CompletedTask;
            }).ConfigureAwait(true);

            var permissionedObjectManager = Resolve<IPermissionedObjectManager>();
            var export = new FormConfigurationExport(src.FormRepo, permissionedObjectManager);
            var exported = await export.ExportItemAsync(srcForm.Id);

            await WithUnitOfWorkAsync(async() => {
                var dstFormRepo = Resolve<IRepository<FormConfiguration, Guid>>();

                var formExistsBeforeImport = await dstFormRepo.GetAll()
                    .Where(f => f.Name == srcForm.Name && f.Module != null && f.Module.Name == srcModule.Name)
                    .OrderByDescending(f => f.VersionNo)
                    .AnyAsync();
                formExistsBeforeImport.ShouldBeFalse("Form must not exist before import");

                var dstModuleRepo = Resolve<IRepository<Module, Guid>>();
                var importer = Resolve<FormConfigurationImport>();

                var importContext = new PackageImportContext()
                {
                    CreateModules = true
                };
                var imported = await importer.ImportItemAsync(exported, importContext) as FormConfiguration;
                imported.ShouldNotBeNull();

                var dstModule = srcForm.Module != null
                    ? await dstModuleRepo.GetAll().FirstOrDefaultAsync(m => m.Name == srcForm.Module.Name)
                    : null;

                var importedFormFromRepo = await dstFormRepo.GetAll()
                    .Where(f => f.Name == srcForm.Name && f.Module == dstModule)
                    .OrderByDescending(f => f.VersionNo)
                    .FirstOrDefaultAsync();

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
            });            
        }

        [Fact]
        public async Task When_Import_Existing_FormAsync()
        {
            var src = PrepareImportContext();
            var srcModule = await src.GetOrCreateModuleAsync("test-import-existing-form-module");
            var srcForm = await src.AddFormAsync(c => {
                c.ModelType = "test-modelType";
                c.Markup = "src-markup";
                c.Name = "test-import-existing-form";
                c.Label = "test-label";
                c.Description = "test-description";

                c.VersionNo = 2;
                c.SetIsLast(true);
                c.VersionStatus = ConfigurationItemVersionStatus.Live;
                c.Module = srcModule;
                return Task.CompletedTask;
            });

            var permissionedObjectManager = Resolve<IPermissionedObjectManager>();
            var export = new FormConfigurationExport(src.FormRepo, permissionedObjectManager);
            var exported = await export.ExportItemAsync(srcForm.Id);

            
            var dstFormRepo = Resolve<IRepository<FormConfiguration, Guid>>();
            var dstModuleRepo = Resolve<IRepository<Module, Guid>>();
            Guid dstFormId = Guid.Empty;
            await WithUnitOfWorkAsync(async() => {
                var dstModule = await GetOrCreateModuleAsync(dstModuleRepo, srcModule.Name);

                var dstForm = await dstFormRepo.InsertAsync(new FormConfiguration
                {
                    ModelType = "dst-test-modelType",
                    Markup = "dst-markup",
                    Name = srcForm.Name,
                    Label = "dst-test-label",
                    Description = "dst-test-description",

                    VersionNo = 10,
                    VersionStatus = ConfigurationItemVersionStatus.Live,
                    Module = dstModule,
                });
                dstFormId = dstForm.Id;
            });
            dstFormId.ShouldNotBe(Guid.Empty, "Failed to create test form");

            await WithUnitOfWorkAsync(async() => {
                var importer = Resolve<FormConfigurationImport>();
                var importContext = new PackageImportContext()
                {
                    CreateModules = true
                };

                var imported = await importer.ImportItemAsync(exported, importContext) as FormConfiguration;
                imported.ShouldNotBeNull();

                var dstModule = srcForm.Module != null
                    ? dstModuleRepo.GetAll().FirstOrDefault(m => m.Name == srcForm.Module.Name)
                    : null;

                var importedFormFromRepo = await dstFormRepo.GetAll()
                    .Where(f => f.Name == srcForm.Name && f.Module == dstModule)
                    .OrderByDescending(f => f.VersionNo)
                    .FirstOrDefaultAsync();

                var dstForm = await dstFormRepo.GetAsync(dstFormId);

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
            });            
        }

        [Fact]
        public async Task When_Import_Existing_Form_As_DraftAsync()
        {
            var src = PrepareImportContext();
            var srcModule = await src.GetOrCreateModuleAsync("test-import-existing-form-as-draft-module");
            var srcForm = await src.AddFormAsync(c => {
                c.ModelType = "test-modelType";
                c.Markup = "src-markup";
                c.Name = "test-import-existing-form-as-draft";
                c.Label = "test-label";
                c.Description = "test-description";

                c.VersionNo = 2;
                c.SetIsLast(true);
                c.VersionStatus = ConfigurationItemVersionStatus.Live;
                c.Module = srcModule;
                return Task.CompletedTask;
            });

            var permissionedObjectManager = Resolve<IPermissionedObjectManager>();
            var export = new FormConfigurationExport(src.FormRepo, permissionedObjectManager);
            var exported = await export.ExportItemAsync(srcForm.Id);

            var dstFormRepo = Resolve<IRepository<FormConfiguration, Guid>>();
            var dstModuleRepo = Resolve<IRepository<Module, Guid>>();
            Guid dstFormId = Guid.Empty;
            await WithUnitOfWorkAsync(async () => {
                var dstModule = await GetOrCreateModuleAsync(dstModuleRepo, srcModule.Name);

                var dstForm = await dstFormRepo.InsertAsync(new FormConfiguration {
                    ModelType = "dst-test-modelType",
                    Markup = "dst-markup",
                    Name = srcForm.Name,
                    Label = "dst-test-label",
                    Description = "dst-test-description",
                    VersionNo = 10,
                    VersionStatus = ConfigurationItemVersionStatus.Live,
                    Module = dstModule,
                });
                dstFormId = dstForm.Id;
            });
            dstFormId.ShouldNotBe(Guid.Empty, "Failed to create test form");
            
            await WithUnitOfWorkAsync(async() => {
                var importer = Resolve<FormConfigurationImport>();

                var importContext = new PackageImportContext()
                {
                    CreateModules = true,
                    ImportStatusAs = ConfigurationItemVersionStatus.Draft,
                };
                var imported = await importer.ImportItemAsync(exported, importContext) as FormConfiguration;
                imported.ShouldNotBeNull();

                var dstModule = srcForm.Module != null
                    ? await dstModuleRepo.GetAll().FirstOrDefaultAsync(m => m.Name == srcForm.Module.Name)
                    : null;

                var importedFormFromRepo = await dstFormRepo.GetAll()
                    .Where(f => f.Name == srcForm.Name && f.Module == dstModule)
                    .OrderByDescending(f => f.VersionNo)
                    .FirstOrDefaultAsync();

                var dstForm = await dstFormRepo.GetAsync(dstFormId);

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
            });
        }

        [Fact]
        public async Task When_Import_The_Same_Form_TwiceAsync()
        {
            var src = PrepareImportContext();
            var srcModule = await src.GetOrCreateModuleAsync("test-import-same-form-twice-module");
            var srcForm = await src.AddFormAsync(c => {
                c.ModelType = "test-modelType";
                c.Markup = "src-markup";
                c.Name = "test-import-same-form-twice";
                c.Label = "test-label";
                c.Description = "test-description";

                c.VersionNo = 2;
                c.SetIsLast(true);
                c.VersionStatus = ConfigurationItemVersionStatus.Live;
                c.Module = srcModule;
                return Task.CompletedTask;
            });

            var permissionedObjectManager = Resolve<IPermissionedObjectManager>();
            var export = new FormConfigurationExport(src.FormRepo, permissionedObjectManager);
            var exported = await export.ExportItemAsync(srcForm.Id);

            var dstFormRepo = Resolve<IRepository<FormConfiguration, Guid>>();
            var dstModuleRepo = Resolve<IRepository<Module, Guid>>();
            Guid dstFormId = Guid.Empty;
            await WithUnitOfWorkAsync(async () => {
                var dstModule = await GetOrCreateModuleAsync(dstModuleRepo, srcModule.Name);

                var dstForm = await dstFormRepo.InsertAsync(new FormConfiguration {
                    ModelType = "dst-test-modelType",
                    Markup = "dst-markup",
                    Name = srcForm.Name,
                    Label = "dst-test-label",
                    Description = "dst-test-description",

                    VersionNo = 10,
                    VersionStatus = ConfigurationItemVersionStatus.Live,
                    Module = dstModule,
                });
            });
            

            var uowManager = Resolve<IUnitOfWorkManager>();
            using (var uow = uowManager.Begin()) 
            {
                var formsCountBeforeImport = await dstFormRepo.CountAsync();

                var importer = Resolve<FormConfigurationImport>();
                var importContext = new PackageImportContext()
                {
                    CreateModules = true
                };
                var imported1 = await importer.ImportItemAsync(exported, importContext) as FormConfiguration;
                imported1.ShouldNotBeNull();

                var formsCountAfterFirstImport = await dstFormRepo.CountAsync();
                formsCountAfterFirstImport.ShouldBe(formsCountBeforeImport + 1, "First import should create one form");

                var imported2 = await importer.ImportItemAsync(exported, importContext) as FormConfiguration;
                imported2.ShouldNotBeNull();

                var formsCountAfterSecondImport = await dstFormRepo.CountAsync();
                formsCountAfterSecondImport.ShouldBe(formsCountBeforeImport + 1, "Second import shouldn't create new form");

                await uow.CompleteAsync();
            }
        }

        [Fact]
        public async Task When_Export_Multiple_ItemsAsync() 
        {
            var dataFolder = Path.Combine(AppContext.BaseDirectory, "test-data");
            if (!Directory.Exists(dataFolder))
                Directory.CreateDirectory(dataFolder);
            var zipFileName = Path.Combine(dataFolder, "package-export.zip");
            if (File.Exists(zipFileName))
                File.Delete(zipFileName);

            var formRepo = Resolve<IRepository<FormConfiguration, Guid>>();
            var itemsBaseRepo = Resolve<IRepository<ConfigurationItemBase, Guid>>();

            var permissionedObjectManager = Resolve<IPermissionedObjectManager>();
            var exporter = new FormConfigurationExport(formRepo, permissionedObjectManager);
            var packageManager = Resolve<IConfigurationPackageManager>();

            var formsToExport = new List<string> {
                "forms", "form-create", "form-details",
                "form-templates", "form-template-create", "form-template-details",
                "modules", "module-create", "module-details"            };
            await WithUnitOfWorkAsync(async () => {
                var asyncExecuter = Resolve<IAsyncQueryableExecuter>();
                var items = await asyncExecuter.ToListAsync(itemsBaseRepo.GetAll()
                    .Where(i => i.IsLast)
                    .Where(i => i.Module != null && i.Module.Name.ToLower() == "shesha" && formsToExport.Contains(i.Name))
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
            var zipFileName = Path.Combine(dataFolder, "package-import.zip");

            if (!File.Exists(zipFileName))
                throw new Exception($"Export file '{zipFileName}' doesn't exist");

            await WithUnitOfWorkAsync(async() => {
                var importer = Resolve<FormConfigurationImport>();

                var packageManager = Resolve<IConfigurationPackageManager>();

                var importers = DistributionHelper.ToImportersDictionary(new List<IConfigurableItemImport> {
                    importer,
                });
                var importContext = new PackageImportContext
                {
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
                                var itemDto = await item.Importer.NotNull().ReadFromJsonAsync(jsonStream);
                                await item.Importer.ImportItemAsync(itemDto, importContext);
                            }
                        }
                    }
                }
            });

            await WithUnitOfWorkAsync(async() => {
                var moduleName = "imported-module";

                var moduleRepo = Resolve<IRepository<Module, Guid>>();
                var module = await moduleRepo.GetAll().FirstOrDefaultAsync(e => e.Name == moduleName);
                module.ShouldNotBeNull($"Module '{moduleName}' should be imported from the package");

                var formRepo = Resolve<IRepository<FormConfiguration, Guid>>();
                var form1Name = "imported-form-1";
                var form1 = await formRepo.FirstOrDefaultAsync(e => e.Module == module && e.Name == form1Name);
                form1.ShouldNotBeNull($"form '{form1Name}' should be imported from package");
                
                var form2Name = "imported-form-2";
                var form2 = await formRepo.FirstOrDefaultAsync(e => e.Module == module && e.Name == form2Name);
                form2.ShouldNotBeNull($"form '{form2Name}' should be imported from package");
            });
        }

        #region private declarations

        private async Task<Module> GetOrCreateModuleAsync(IRepository<Module, Guid> repo, string moduleName) 
        {
            var module = await repo.GetAll().FirstOrDefaultAsync(e => e.Name == moduleName);
            if (module == null) 
            {
                module = await repo.InsertAsync(new Module { Name = moduleName });
            }
            return module;
        }

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
                await initAction.Invoke(formConfig);

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
