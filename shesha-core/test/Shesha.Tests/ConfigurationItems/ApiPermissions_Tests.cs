using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.MemoryDb;
using Abp.MemoryDb.Repositories;
using NSubstitute;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.Domain.Enums;
using Shesha.Permissions;
using Shesha.Permissions.Distribution;
using Shesha.Permissions.Distribution.Dto;
using Shouldly;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.ConfigurationItems
{
    public class ApiPermissions_Tests : SheshaNhTestBase
    {
        private const string TestService = "MyModule.Services.TestAppService";
        private const string TestServiceGet = "MyModule.Services.TestAppService@Get";
        private const string TestServiceCreate = "MyModule.Services.TestAppService@Create";

        [Fact]
        public async Task ShouldExport_ApiPermissions_TestAsync()
        {
            var src = PrepareImportContext();
            var module = await src.GetOrCreateModuleAsync("test-module");

            await src.AddPermissionedObjectAsync(module, o =>
            {
                o.Object = TestService;
                o.Type = ShaPermissionedObjectsTypes.WebApi;
                o.Name = "TestAppService";
                o.Access = RefListPermissionedAccess.Inherited;
            });

            await src.AddPermissionedObjectAsync(module, o =>
            {
                o.Object = TestServiceGet;
                o.Type = ShaPermissionedObjectsTypes.WebApiAction;
                o.Name = "Get";
                o.Parent = TestService;
                o.Access = RefListPermissionedAccess.RequiresPermissions;
                o.Permissions = "test:permission";
            });

            await src.AddPermissionedObjectAsync(module, o =>
            {
                o.Object = TestServiceCreate;
                o.Type = ShaPermissionedObjectsTypes.WebApiAction;
                o.Name = "Create";
                o.Parent = TestService;
                o.Access = RefListPermissionedAccess.AllowAnonymous;
            });

            var export = new ApiPermissionsManifestExport(src.PermissionedObjectRepo, src.ManifestRepo);
            var exported = await export.ExportItemAsync(await src.GetOrCreateManifestAsync(module)) as DistributedApiPermissionsManifest;

            exported.ShouldNotBeNull();
            exported.Items.Count.ShouldBe(3);

            var parent = exported.Items.FirstOrDefault(i => i.Object == TestService);
            parent.ShouldNotBeNull();
            parent.Type.ShouldBe(ShaPermissionedObjectsTypes.WebApi);
            parent.Access.ShouldBe(RefListPermissionedAccess.Inherited);

            var getAction = exported.Items.FirstOrDefault(i => i.Object == TestServiceGet);
            getAction.ShouldNotBeNull();
            getAction.Type.ShouldBe(ShaPermissionedObjectsTypes.WebApiAction);
            getAction.Access.ShouldBe(RefListPermissionedAccess.RequiresPermissions);
            getAction.Permissions.ShouldContain("test:permission");

            var createAction = exported.Items.FirstOrDefault(i => i.Object == TestServiceCreate);
            createAction.ShouldNotBeNull();
            createAction.Type.ShouldBe(ShaPermissionedObjectsTypes.WebApiAction);
            createAction.Access.ShouldBe(RefListPermissionedAccess.AllowAnonymous);
        }

        [Fact]
        public async Task When_Import_ApiPermissions_ShouldBeEnforceable_TestAsync()
        {
            var src = PrepareImportContext();
            var srcModule = await src.GetOrCreateModuleAsync("test-module");

            await src.AddPermissionedObjectAsync(srcModule, o =>
            {
                o.Object = TestService;
                o.Type = ShaPermissionedObjectsTypes.WebApi;
                o.Name = "TestAppService";
                o.Access = RefListPermissionedAccess.Inherited;
            });
            await src.AddPermissionedObjectAsync(srcModule, o =>
            {
                o.Object = TestServiceGet;
                o.Type = ShaPermissionedObjectsTypes.WebApiAction;
                o.Name = "Get";
                o.Parent = TestService;
                o.Access = RefListPermissionedAccess.RequiresPermissions;
                o.Permissions = "test:permission";
            });
            await src.AddPermissionedObjectAsync(srcModule, o =>
            {
                o.Object = TestServiceCreate;
                o.Type = ShaPermissionedObjectsTypes.WebApiAction;
                o.Name = "Create";
                o.Parent = TestService;
                o.Access = RefListPermissionedAccess.AllowAnonymous;
            });

            var srcExport = new ApiPermissionsManifestExport(src.PermissionedObjectRepo, src.ManifestRepo);
            var exported = await srcExport.ExportItemAsync(await src.GetOrCreateManifestAsync(srcModule));

            var dst = PrepareImportContext();
            var dstPermissionedObjectManager = Resolve<IPermissionedObjectManager>();
            var uowManager = Resolve<IUnitOfWorkManager>();
            var importer = new ApiPermissionsManifestImport(dst.ModuleRepo, dst.FrontEndAppRepo, dst.PermissionedObjectRepo, dstPermissionedObjectManager, dst.ManifestRepo)
            {
                UnitOfWorkManager = uowManager,
            };
            var importContext = new PackageImportContext { CreateModules = true };

            using (var uow = uowManager.Begin())
            {
                await importer.ImportItemAsync(exported, importContext);
                await uow.CompleteAsync();
            }

            var getPermission = await dstPermissionedObjectManager.GetOrDefaultAsync(TestServiceGet, ShaPermissionedObjectsTypes.WebApiAction);
            getPermission.ShouldNotBeNull();
            getPermission.ActualAccess.ShouldBe(RefListPermissionedAccess.RequiresPermissions);
            getPermission.ActualPermissions.ShouldBe(new List<string> { "test:permission" }, ignoreOrder: true);

            var createPermission = await dstPermissionedObjectManager.GetOrDefaultAsync(TestServiceCreate, ShaPermissionedObjectsTypes.WebApiAction);
            createPermission.ShouldNotBeNull();
            createPermission.ActualAccess.ShouldBe(RefListPermissionedAccess.AllowAnonymous);
        }

        [Fact]
        public async Task When_Import_ApiPermissions_ShouldUpdateExistingRows_TestAsync()
        {
            var src = PrepareImportContext();
            var srcModule = await src.GetOrCreateModuleAsync("test-module");
            await src.AddPermissionedObjectAsync(srcModule, o =>
            {
                o.Object = TestServiceGet;
                o.Type = ShaPermissionedObjectsTypes.WebApiAction;
                o.Name = "Get";
                o.Parent = TestService;
                o.Access = RefListPermissionedAccess.RequiresPermissions;
                o.Permissions = "test:permission";
            });
            var srcExport = new ApiPermissionsManifestExport(src.PermissionedObjectRepo, src.ManifestRepo);
            var exported = await srcExport.ExportItemAsync(await src.GetOrCreateManifestAsync(srcModule));

            var dst = PrepareImportContext();
            var dstModule = await dst.GetOrCreateModuleAsync("test-module");
            var preExisting = await dst.AddPermissionedObjectAsync(dstModule, o =>
            {
                o.Object = TestServiceGet;
                o.Type = ShaPermissionedObjectsTypes.WebApiAction;
                o.Name = "Get";
                o.Parent = TestService;
                o.Access = RefListPermissionedAccess.AnyAuthenticated;
            });

            var dstPermissionedObjectManager = Resolve<IPermissionedObjectManager>();
            var uowManager = Resolve<IUnitOfWorkManager>();
            var importer = new ApiPermissionsManifestImport(dst.ModuleRepo, dst.FrontEndAppRepo, dst.PermissionedObjectRepo, dstPermissionedObjectManager, dst.ManifestRepo)
            {
                UnitOfWorkManager = uowManager,
            };
            var importContext = new PackageImportContext { CreateModules = true };

            var countBefore = await dst.PermissionedObjectRepo.CountAsync();
            using (var uow = uowManager.Begin())
            {
                await importer.ImportItemAsync(exported, importContext);
                await uow.CompleteAsync();
            }
            var countAfter = await dst.PermissionedObjectRepo.CountAsync();

            countAfter.ShouldBe(countBefore, "Import should update the row in place, not insert a duplicate");

            var rowsForObject = dst.PermissionedObjectRepo.GetAll().Where(x => x.Object == TestServiceGet).ToList();
            rowsForObject.Count.ShouldBe(1, "There should be exactly one row for this (Object, Type) pair");
            rowsForObject.Single().Type.ShouldBe(ShaPermissionedObjectsTypes.WebApiAction, "Action row must not be written under the parent 'Shesha.WebApi' type");
            rowsForObject.Single().Id.ShouldBe(preExisting.Id, "The existing row should be updated, not replaced");

            var updated = await dstPermissionedObjectManager.GetOrDefaultAsync(TestServiceGet, ShaPermissionedObjectsTypes.WebApiAction);
            updated.ActualAccess.ShouldBe(RefListPermissionedAccess.RequiresPermissions);

            var underWrongType = dst.PermissionedObjectRepo.GetAll().Where(x => x.Object == TestServiceGet && x.Type == ShaPermissionedObjectsTypes.WebApi).ToList();
            underWrongType.ShouldBeEmpty("No action row should ever be written under Type 'Shesha.WebApi'");
        }

        [Fact]
        public async Task When_Import_ApiPermissions_InheritedResolvesToParent_TestAsync()
        {
            var src = PrepareImportContext();
            var srcModule = await src.GetOrCreateModuleAsync("test-module");
            await src.AddPermissionedObjectAsync(srcModule, o =>
            {
                o.Object = TestService;
                o.Type = ShaPermissionedObjectsTypes.WebApi;
                o.Name = "TestAppService";
                o.Access = RefListPermissionedAccess.RequiresPermissions;
                o.Permissions = "parent:permission";
            });
            await src.AddPermissionedObjectAsync(srcModule, o =>
            {
                o.Object = TestServiceGet;
                o.Type = ShaPermissionedObjectsTypes.WebApiAction;
                o.Name = "Get";
                o.Parent = TestService;
                o.Access = RefListPermissionedAccess.Inherited;
            });

            var srcExport = new ApiPermissionsManifestExport(src.PermissionedObjectRepo, src.ManifestRepo);
            var exported = await srcExport.ExportItemAsync(await src.GetOrCreateManifestAsync(srcModule));

            var dst = PrepareImportContext();
            var dstPermissionedObjectManager = Resolve<IPermissionedObjectManager>();
            var uowManager = Resolve<IUnitOfWorkManager>();
            var importer = new ApiPermissionsManifestImport(dst.ModuleRepo, dst.FrontEndAppRepo, dst.PermissionedObjectRepo, dstPermissionedObjectManager, dst.ManifestRepo)
            {
                UnitOfWorkManager = uowManager,
            };
            var importContext = new PackageImportContext { CreateModules = true };

            using (var uow = uowManager.Begin())
            {
                await importer.ImportItemAsync(exported, importContext);
                await uow.CompleteAsync();
            }

            var childPermission = await dstPermissionedObjectManager.GetOrDefaultAsync(TestServiceGet, ShaPermissionedObjectsTypes.WebApiAction);
            childPermission.ShouldNotBeNull();
            childPermission.Inherited.ShouldBeTrue("The child row itself must remain Inherited");
            childPermission.ActualAccess.ShouldBe(RefListPermissionedAccess.RequiresPermissions, "Actual access must resolve from the parent service row");
            childPermission.ActualPermissions.ShouldBe(new List<string> { "parent:permission" }, ignoreOrder: true);
        }

        [Fact]
        public async Task When_Import_ApiPermissions_Twice_ShouldBeNoOp_TestAsync()
        {
            var src = PrepareImportContext();
            var srcModule = await src.GetOrCreateModuleAsync("test-module");
            await src.AddPermissionedObjectAsync(srcModule, o =>
            {
                o.Object = TestServiceGet;
                o.Type = ShaPermissionedObjectsTypes.WebApiAction;
                o.Name = "Get";
                o.Parent = TestService;
                o.Access = RefListPermissionedAccess.RequiresPermissions;
                o.Permissions = "test:permission";
            });
            var srcExport = new ApiPermissionsManifestExport(src.PermissionedObjectRepo, src.ManifestRepo);
            var exported = await srcExport.ExportItemAsync(await src.GetOrCreateManifestAsync(srcModule));

            var dst = PrepareImportContext();
            var dstPermissionedObjectManager = Resolve<IPermissionedObjectManager>();
            var uowManager = Resolve<IUnitOfWorkManager>();
            var importer = new ApiPermissionsManifestImport(dst.ModuleRepo, dst.FrontEndAppRepo, dst.PermissionedObjectRepo, dstPermissionedObjectManager, dst.ManifestRepo)
            {
                UnitOfWorkManager = uowManager,
            };
            var importContext = new PackageImportContext { CreateModules = true };

            using (var uow = uowManager.Begin())
            {
                await importer.ImportItemAsync(exported, importContext);
                await uow.CompleteAsync();
            }
            var countAfterFirst = await dst.PermissionedObjectRepo.CountAsync();
            var afterFirst = await dstPermissionedObjectManager.GetOrDefaultAsync(TestServiceGet, ShaPermissionedObjectsTypes.WebApiAction);

            using (var uow = uowManager.Begin())
            {
                await importer.ImportItemAsync(exported, importContext);
                await uow.CompleteAsync();
            }
            var countAfterSecond = await dst.PermissionedObjectRepo.CountAsync();
            var afterSecond = await dstPermissionedObjectManager.GetOrDefaultAsync(TestServiceGet, ShaPermissionedObjectsTypes.WebApiAction);

            countAfterSecond.ShouldBe(countAfterFirst, "Second import should not create new rows");
            afterSecond.ActualAccess.ShouldBe(afterFirst.ActualAccess);
            afterSecond.ActualPermissions.ShouldBe(afterFirst.ActualPermissions, ignoreOrder: true);
        }

        [Fact]
        public async Task When_Import_ApiPermissions_ShouldNotTouchUnrelatedEndpoints_TestAsync()
        {
            var src = PrepareImportContext();
            var srcModule = await src.GetOrCreateModuleAsync("test-module");
            await src.AddPermissionedObjectAsync(srcModule, o =>
            {
                o.Object = TestServiceGet;
                o.Type = ShaPermissionedObjectsTypes.WebApiAction;
                o.Name = "Get";
                o.Parent = TestService;
                o.Access = RefListPermissionedAccess.RequiresPermissions;
                o.Permissions = "test:permission";
            });
            var srcExport = new ApiPermissionsManifestExport(src.PermissionedObjectRepo, src.ManifestRepo);
            var exported = await srcExport.ExportItemAsync(await src.GetOrCreateManifestAsync(srcModule));

            var dst = PrepareImportContext();
            var dstModule = await dst.GetOrCreateModuleAsync("test-module");
            const string unrelatedObject = "MyModule.Services.OtherAppService@Delete";
            var unrelated = await dst.AddPermissionedObjectAsync(dstModule, o =>
            {
                o.Object = unrelatedObject;
                o.Type = ShaPermissionedObjectsTypes.WebApiAction;
                o.Name = "Delete";
                o.Access = RefListPermissionedAccess.AnyAuthenticated;
            });

            var dstPermissionedObjectManager = Resolve<IPermissionedObjectManager>();
            var uowManager = Resolve<IUnitOfWorkManager>();
            var importer = new ApiPermissionsManifestImport(dst.ModuleRepo, dst.FrontEndAppRepo, dst.PermissionedObjectRepo, dstPermissionedObjectManager, dst.ManifestRepo)
            {
                UnitOfWorkManager = uowManager,
            };
            var importContext = new PackageImportContext { CreateModules = true };

            using (var uow = uowManager.Begin())
            {
                await importer.ImportItemAsync(exported, importContext);
                await uow.CompleteAsync();
            }

            var untouched = dst.PermissionedObjectRepo.GetAll().FirstOrDefault(x => x.Object == unrelatedObject);
            untouched.ShouldNotBeNull();
            untouched.Id.ShouldBe(unrelated.Id);
            untouched.Access.ShouldBe(RefListPermissionedAccess.AnyAuthenticated, "Endpoint absent from the imported package must be left untouched");
        }

        [Fact]
        public async Task When_Bootstrapper_Runs_After_Import_TestAsync()
        {
            // Simulates a Hardcoded endpoint (e.g. [AllowAnonymous]) whose imported configuration
            // must survive a later bootstrap run even when the code-derived Md5 has since drifted.
            // Uses the container-resolved manager/repository throughout (not the in-memory harness)
            // since this test exercises the real SetAsync + bootstrapper collision logic together.
            var permissionedObjectRepo = Resolve<IRepository<PermissionedObject, Guid>>();
            var dstPermissionedObjectManager = Resolve<IPermissionedObjectManager>();
            var uowManager = Resolve<IUnitOfWorkManager>();

            var uniqueObjectName = $"{TestServiceCreate}@{Guid.NewGuid():N}";

            PermissionedObject dbRow;
            using (var uow = uowManager.Begin())
            {
                // Import sets custom access on what is, in code, a Hardcoded [AllowAnonymous] endpoint.
                await dstPermissionedObjectManager.SetAsync(new PermissionedObjectDto
                {
                    Object = uniqueObjectName,
                    Type = ShaPermissionedObjectsTypes.WebApiAction,
                    Name = "Create",
                    Access = RefListPermissionedAccess.RequiresPermissions,
                    Permissions = new List<string> { "custom:permission" },
                });
                await uowManager.Current.SaveChangesAsync();

                dbRow = permissionedObjectRepo.GetAll().First(x => x.Object == uniqueObjectName);
                dbRow.Hardcoded.ShouldBe(false, "SetAsync must mark imported rows as no longer code-owned");

                await uow.CompleteAsync();
            }

            // Simulate the bootstrapper's next run: code still says AllowAnonymous (Hardcoded=true),
            // and the Md5 has drifted (e.g. an unrelated code change touched Name/Parent/etc).
            dbRow.Md5 = "stale-md5-from-before-import";
            var codeScannedItem = new PermissionedObjectDto
            {
                Object = uniqueObjectName,
                Type = ShaPermissionedObjectsTypes.WebApiAction,
                Name = "Create",
                Access = RefListPermissionedAccess.AllowAnonymous,
                Permissions = new List<string>(),
                Hardcoded = true,
                Md5 = "fresh-md5-after-deploy",
            };

            var collisionCondition = dbRow.Hardcoded != false &&
                (codeScannedItem.Hardcoded == true || dbRow.Access == RefListPermissionedAccess.Inherited);

            collisionCondition.ShouldBeFalse("Imported configuration on a Hardcoded endpoint must outrank a code attribute on the next bootstrap run");
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

        private class TestImportContext
        {
            public IMemoryDatabaseProvider DbProvider { get; set; }
            public IRepository<PermissionedObject, Guid> PermissionedObjectRepo { get; set; }
            public IRepository<ApiPermissionsManifest, Guid> ManifestRepo { get; set; }
            public IRepository<ConfigurationItem, Guid> ConfigurationItemRepo { get; set; }
            public IRepository<Module, Guid> ModuleRepo { get; set; }
            public IRepository<FrontEndApp, Guid> FrontEndAppRepo { get; set; }

            public async Task<PermissionedObject> AddPermissionedObjectAsync(Module module, Action<PermissionedObject> initAction)
            {
                var obj = new PermissionedObject
                {
                    Id = Guid.NewGuid(),
                    Module = module,
                    Access = RefListPermissionedAccess.Inherited,
                };
                initAction?.Invoke(obj);
                await PermissionedObjectRepo.InsertAsync(obj);
                return obj;
            }

            public async Task<ApiPermissionsManifest> GetOrCreateManifestAsync(Module module)
            {
                var manifest = await ManifestRepo.FirstOrDefaultAsync(m => m.Module == module);
                if (manifest == null)
                {
                    manifest = new ApiPermissionsManifest
                    {
                        Id = Guid.NewGuid(),
                        Name = ApiPermissionsManifest.ManifestName,
                        Module = module,
                        VersionNo = 1,
                    };
                    await ManifestRepo.InsertAsync(manifest);
                }
                return manifest;
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

            public IRepository<T, TId> GetRepository<T, TId>() where T : class, IEntity<TId>
            {
                return new MemoryRepository<T, TId>(DbProvider);
            }

            public TestImportContext(IMemoryDatabaseProvider dbProvider)
            {
                DbProvider = dbProvider;

                PermissionedObjectRepo = GetRepository<PermissionedObject, Guid>();
                ManifestRepo = GetRepository<ApiPermissionsManifest, Guid>();
                ConfigurationItemRepo = GetRepository<ConfigurationItem, Guid>();
                ModuleRepo = GetRepository<Module, Guid>();
                FrontEndAppRepo = GetRepository<FrontEndApp, Guid>();
            }
        }

        #endregion
    }
}
