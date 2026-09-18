using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.MemoryDb;
using Abp.MemoryDb.Repositories;
using NSubstitute;
using Shesha.Configuration.Runtime;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities.Cache;
using Shesha.DynamicEntities.Distribution;
using Shesha.DynamicEntities.Distribution.Dto;
using Shesha.Permissions;
using Shouldly;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.ConfigurationItems
{
    public class EntityConfiguration_Tests : SheshaNhTestBase
    {
        private const string Ns = "MyModule.Domain";
        private const string Cls = "TestEntity";
        private static string FullClassName => $"{Ns}.{Cls}";

        [Fact]
        public async Task ShouldExport_TestAsync()
        {
            var src = PrepareImportContext();
            var module = await src.GetOrCreateModuleAsync("test-module");

            var entityConfig = await src.AddEntityConfigAsync(c =>
            {
                c.Name = "test-entity";
                c.Label = "-Label";
                c.Description = "-Description";
                c.ClassName = Cls;
                c.Namespace = Ns;
                c.Module = module;
                return Task.CompletedTask;
            });

            var permissionedObjectManager = Resolve<IPermissionedObjectManager>();
            var export = new EntityConfigExport(src.EntityConfigRepo, src.EntityPropertyRepo, permissionedObjectManager);

            var exported = await export.ExportItemAsync(entityConfig.Id) as DistributedEntityConfig;
            exported.ShouldNotBeNull();
            exported.Name.ShouldBe(entityConfig.Name);
            exported.ModuleName.ShouldBe(module.Name);
            exported.ClassName.ShouldBe(Cls);
            exported.Namespace.ShouldBe(Ns);
            exported.Label.ShouldBe(entityConfig.Label);
            exported.Description.ShouldBe(entityConfig.Description);
        }

        [Fact]
        public async Task When_Import_EntityPermissions_ShouldBeEnforceable_TestAsync()
        {
            // Unique per run so no stale row from an earlier test/run can make this pass vacuously.
            //
            // The pre-existing dst row below is seeded at a DIFFERENT access level (AnyAuthenticated)
            // than what src exports (RequiresPermissions). This specifically catches D1: SetAsync
            // matches rows on (Object, Type), so a buggy import that writes the wrong Type inserts a
            // SIBLING row instead of updating this one -- leaving it at AnyAuthenticated and letting
            // the assertion below fail, which a same-value seed (or no pre-existing row at all,
            // combined with GetOrDefaultAsync's non-null default) would not reliably catch.
            var uniqueClassName = $"{Cls}_{Guid.NewGuid():N}";
            var uniqueFullClassName = $"{Ns}.{uniqueClassName}";

            var src = PrepareImportContext();
            var module = await src.GetOrCreateModuleAsync("test-module");

            var entityConfig = await src.AddEntityConfigAsync(c =>
            {
                c.Name = "test-entity";
                c.ClassName = uniqueClassName;
                c.Namespace = Ns;
                c.Module = module;
                return Task.CompletedTask;
            });

            var permissionedObjectRepo = Resolve<IRepository<PermissionedObject, Guid>>();
            var uowManager = Resolve<IUnitOfWorkManager>();

            // src-side: seed the permission that EntityConfigExport reads for RequiresPermissions/test:permission
            using (var uow = uowManager.Begin())
            {
                foreach (var action in new[] { "Get", "Create", "Update", "Delete" })
                {
                    await permissionedObjectRepo.InsertAsync(new PermissionedObject
                    {
                        Object = $"{uniqueFullClassName}@{action}",
                        Type = ShaPermissionedObjectsTypes.EntityAction,
                        Name = action,
                        Parent = uniqueFullClassName,
                        Access = RefListPermissionedAccess.RequiresPermissions,
                        Permissions = "test:permission",
                    });
                }
                await uow.CompleteAsync();
            }

            var permissionedObjectManager = Resolve<IPermissionedObjectManager>();
            var export = new EntityConfigExport(src.EntityConfigRepo, src.EntityPropertyRepo, permissionedObjectManager);
            var exported = await export.ExportItemAsync(entityConfig.Id);

            // dst-side: pre-seed the SAME (Object, Type) rows at a different access level, so the
            // import must UPDATE them (not insert siblings) for the post-import assertion to hold.
            using (var uow = uowManager.Begin())
            {
                foreach (var action in new[] { "Get", "Create", "Update", "Delete" })
                {
                    await permissionedObjectRepo.InsertAsync(new PermissionedObject
                    {
                        Object = $"{uniqueFullClassName}@{action}",
                        Type = ShaPermissionedObjectsTypes.EntityAction,
                        Name = action,
                        Parent = uniqueFullClassName,
                        Access = RefListPermissionedAccess.AnyAuthenticated,
                    });
                }
                await uow.CompleteAsync();
            }

            var dst = PrepareImportContext();
            var entityConfigManager = Resolve<IEntityConfigManager>();
            var modelConfigsCacheHolder = Resolve<IModelConfigsCacheHolder>();
            var importer = new EntityConfigImport(dst.ModuleRepo, dst.FrontEndAppRepo, dst.EntityConfigRepo, dst.EntityPropertyRepo, permissionedObjectManager, entityConfigManager, uowManager, modelConfigsCacheHolder)
            {
                UnitOfWorkManager = uowManager,
            };
            var importContext = new PackageImportContext { CreateModules = true };

            using (var uow = uowManager.Begin())
            {
                await importer.ImportItemAsync(exported, importContext);
                await uow.CompleteAsync();
            }

            foreach (var action in new[] { "Get", "Create", "Update", "Delete" })
            {
                var p = await permissionedObjectManager.GetOrDefaultAsync($"{uniqueFullClassName}@{action}", ShaPermissionedObjectsTypes.EntityAction);
                p.ShouldNotBeNull($"permission for action {action} should exist");
                p.ActualAccess.ShouldBe(RefListPermissionedAccess.RequiresPermissions, $"action {action} should require permissions");
                p.ActualPermissions.ShouldContain("test:permission", $"action {action} should carry the imported permission");
            }
        }

        [Fact]
        public async Task When_Import_EntityPermissions_ShouldNotDuplicateRows_TestAsync()
        {
            var uniqueClassName = $"{Cls}_{Guid.NewGuid():N}";
            var uniqueFullClassName = $"{Ns}.{uniqueClassName}";

            var src = PrepareImportContext();
            var module = await src.GetOrCreateModuleAsync("test-module");

            var entityConfig = await src.AddEntityConfigAsync(c =>
            {
                c.Name = "test-entity";
                c.ClassName = uniqueClassName;
                c.Namespace = Ns;
                c.Module = module;
                return Task.CompletedTask;
            });

            var permissionedObjectRepo = Resolve<IRepository<PermissionedObject, Guid>>();
            var uowManager = Resolve<IUnitOfWorkManager>();
            using (var uow = uowManager.Begin())
            {
                foreach (var action in new[] { "Get", "Create", "Update", "Delete" })
                {
                    await permissionedObjectRepo.InsertAsync(new PermissionedObject
                    {
                        Object = $"{uniqueFullClassName}@{action}",
                        Type = ShaPermissionedObjectsTypes.EntityAction,
                        Name = action,
                        Parent = uniqueFullClassName,
                        Access = RefListPermissionedAccess.RequiresPermissions,
                        Permissions = "test:permission",
                    });
                }
                await uow.CompleteAsync();
            }

            var permissionedObjectManager = Resolve<IPermissionedObjectManager>();
            var export = new EntityConfigExport(src.EntityConfigRepo, src.EntityPropertyRepo, permissionedObjectManager);
            var exported = await export.ExportItemAsync(entityConfig.Id);

            var dst = PrepareImportContext();
            var entityConfigManager = Resolve<IEntityConfigManager>();
            var modelConfigsCacheHolder = Resolve<IModelConfigsCacheHolder>();
            var importer = new EntityConfigImport(dst.ModuleRepo, dst.FrontEndAppRepo, dst.EntityConfigRepo, dst.EntityPropertyRepo, permissionedObjectManager, entityConfigManager, uowManager, modelConfigsCacheHolder)
            {
                UnitOfWorkManager = uowManager,
            };
            var importContext = new PackageImportContext { CreateModules = true };

            using (var uow = uowManager.Begin())
            {
                await importer.ImportItemAsync(exported, importContext);
                await uow.CompleteAsync();
            }

            using (var uow = uowManager.Begin())
            {
                foreach (var action in new[] { "Get", "Create", "Update", "Delete" })
                {
                    var objectName = $"{uniqueFullClassName}@{action}";
                    var wrongTypeRows = permissionedObjectRepo.GetAll()
                        .Where(x => x.Object == objectName && x.Type == ShaPermissionedObjectsTypes.Entity)
                        .ToList();
                    wrongTypeRows.ShouldBeEmpty($"no row for action {action} should be written under Type '{ShaPermissionedObjectsTypes.Entity}'");

                    var correctTypeRows = permissionedObjectRepo.GetAll()
                        .Where(x => x.Object == objectName && x.Type == ShaPermissionedObjectsTypes.EntityAction)
                        .ToList();
                    correctTypeRows.Count.ShouldBe(1, $"exactly one row should exist for action {action} under Type '{ShaPermissionedObjectsTypes.EntityAction}'");
                }
                await uow.CompleteAsync();
            }
        }

        [Fact]
        public async Task When_Import_Properties_ShouldPreserveAllFields_TestAsync()
        {
            var src = PrepareImportContext();
            var module = await src.GetOrCreateModuleAsync("test-module");

            var entityConfig = await src.AddEntityConfigAsync(c =>
            {
                c.Name = "test-entity";
                c.ClassName = Cls;
                c.Namespace = Ns;
                c.Module = module;
                return Task.CompletedTask;
            });

            // scalar property with non-default SortOrder and explicit Source
            await src.AddPropertyAsync(entityConfig, p =>
            {
                p.Name = "ScalarProp";
                p.DataType = "string";
                p.Source = MetadataSourceType.UserDefined;
                p.SortOrder = 5;
            });

            // complex property with 2 levels of nested properties
            var complexProp = await src.AddPropertyAsync(entityConfig, p =>
            {
                p.Name = "ComplexProp";
                p.DataType = "object";
                p.Source = MetadataSourceType.UserDefined;
                p.SortOrder = 1;
            });
            var childProp = await src.AddPropertyAsync(entityConfig, p =>
            {
                p.Name = "ChildProp";
                p.DataType = "string";
                p.ParentProperty = complexProp;
                p.SortOrder = 0;
            }, addToEntityConfig: false);
            await src.AddPropertyAsync(entityConfig, p =>
            {
                p.Name = "GrandChildProp";
                p.DataType = "string";
                p.ParentProperty = childProp;
                p.SortOrder = 0;
            }, addToEntityConfig: false);

            // list property with ItemsType
            var itemsTypeProp = await src.AddPropertyAsync(entityConfig, p =>
            {
                p.Name = "ListItemType";
                p.DataType = "string";
            }, addToEntityConfig: false);
            await src.AddPropertyAsync(entityConfig, p =>
            {
                p.Name = "ListProp";
                p.DataType = "array";
                p.ItemsType = itemsTypeProp;
                p.SortOrder = 2;
            });

            var permissionedObjectManager = Resolve<IPermissionedObjectManager>();
            var export = new EntityConfigExport(src.EntityConfigRepo, src.EntityPropertyRepo, permissionedObjectManager);
            var exported = await export.ExportItemAsync(entityConfig.Id) as DistributedEntityConfig;

            var dst = PrepareImportContext();
            var uowManager = Resolve<IUnitOfWorkManager>();
            var entityConfigManager = Resolve<IEntityConfigManager>();
            var modelConfigsCacheHolder = Resolve<IModelConfigsCacheHolder>();
            var importer = new EntityConfigImport(dst.ModuleRepo, dst.FrontEndAppRepo, dst.EntityConfigRepo, dst.EntityPropertyRepo, permissionedObjectManager, entityConfigManager, uowManager, modelConfigsCacheHolder)
            {
                UnitOfWorkManager = uowManager,
            };
            var importContext = new PackageImportContext { CreateModules = true };

            EntityConfig imported;
            using (var uow = uowManager.Begin())
            {
                imported = await importer.ImportItemAsync(exported, importContext) as EntityConfig;
                await uow.CompleteAsync();
            }
            imported.ShouldNotBeNull();

            var importedScalar = dst.EntityPropertyRepo.GetAll().FirstOrDefault(p => p.EntityConfig == imported && p.Name == "ScalarProp");
            importedScalar.ShouldNotBeNull();
            importedScalar.Source.ShouldBe(MetadataSourceType.UserDefined);
            importedScalar.SortOrder.ShouldBe(5);

            var importedComplex = dst.EntityPropertyRepo.GetAll().FirstOrDefault(p => p.EntityConfig == imported && p.Name == "ComplexProp");
            importedComplex.ShouldNotBeNull();
            var importedChild = dst.EntityPropertyRepo.GetAll().FirstOrDefault(p => p.ParentProperty == importedComplex && p.Name == "ChildProp");
            importedChild.ShouldNotBeNull("nested property (level 1) should survive import");
            var importedGrandChild = dst.EntityPropertyRepo.GetAll().FirstOrDefault(p => p.ParentProperty == importedChild && p.Name == "GrandChildProp");
            importedGrandChild.ShouldNotBeNull("nested property (level 2) should survive import");

            var importedList = dst.EntityPropertyRepo.GetAll().FirstOrDefault(p => p.EntityConfig == imported && p.Name == "ListProp");
            importedList.ShouldNotBeNull();
            importedList.ItemsType.ShouldNotBeNull("ItemsType should survive import");
            importedList.ItemsType.Name.ShouldBe("ListItemType");
        }

        [Fact]
        public async Task When_Import_Properties_ShouldRemoveStaleProperties_TestAsync()
        {
            var src = PrepareImportContext();
            var module = await src.GetOrCreateModuleAsync("test-module");

            var entityConfig = await src.AddEntityConfigAsync(c =>
            {
                c.Name = "test-entity";
                c.ClassName = Cls;
                c.Namespace = Ns;
                c.Module = module;
                return Task.CompletedTask;
            });
            await src.AddPropertyAsync(entityConfig, p =>
            {
                p.Name = "KeptProp";
                p.DataType = "string";
            });

            var permissionedObjectManager = Resolve<IPermissionedObjectManager>();
            var export = new EntityConfigExport(src.EntityConfigRepo, src.EntityPropertyRepo, permissionedObjectManager);
            var exported = await export.ExportItemAsync(entityConfig.Id) as DistributedEntityConfig;

            var dst = PrepareImportContext();
            var dstModule = await dst.GetOrCreateModuleAsync("test-module");
            var dstEntityConfig = await dst.AddEntityConfigAsync(c =>
            {
                c.Name = "test-entity";
                c.ClassName = Cls;
                c.Namespace = Ns;
                c.Module = dstModule;
                c.SetIsLast(true);
                return Task.CompletedTask;
            });
            await dst.AddPropertyAsync(dstEntityConfig, p =>
            {
                p.Name = "StaleProp";
                p.DataType = "string";
            });

            var uowManager = Resolve<IUnitOfWorkManager>();
            var mapper = Resolve<global::AutoMapper.IMapper>();
            var entityConfigManager = new EntityConfigManager(dst.EntityConfigRepo, dst.EntityPropertyRepo, dst.ModuleRepo, uowManager, mapper);
            var modelConfigsCacheHolder = Resolve<IModelConfigsCacheHolder>();
            var importer = new EntityConfigImport(dst.ModuleRepo, dst.FrontEndAppRepo, dst.EntityConfigRepo, dst.EntityPropertyRepo, permissionedObjectManager, entityConfigManager, uowManager, modelConfigsCacheHolder)
            {
                UnitOfWorkManager = uowManager,
            };
            var importContext = new PackageImportContext { CreateModules = true };

            var imported = await importer.ImportItemAsync(exported, importContext) as EntityConfig;
            imported.ShouldNotBeNull();

            var staleStillThere = dst.EntityPropertyRepo.GetAll().Any(p => p.EntityConfig == imported && p.Name == "StaleProp");
            staleStillThere.ShouldBeFalse("property absent from the imported package should be removed");

            var keptStillThere = dst.EntityPropertyRepo.GetAll().Any(p => p.EntityConfig == imported && p.Name == "KeptProp");
            keptStillThere.ShouldBeTrue("property present in the imported package should remain");
        }

        [Fact]
        public async Task When_Import_Existing_EntityConfig_ShouldCreateNewVersion_TestAsync()
        {
            var src = PrepareImportContext();
            var srcModule = await src.GetOrCreateModuleAsync("test-module");
            var srcEntityConfig = await src.AddEntityConfigAsync(c =>
            {
                c.Name = "test-entity";
                c.ClassName = Cls;
                c.Namespace = Ns;
                c.Label = "src-label";
                c.Module = srcModule;
                c.VersionNo = 2;
                c.SetIsLast(true);
                c.VersionStatus = ConfigurationItemVersionStatus.Live;
                return Task.CompletedTask;
            });

            var permissionedObjectManager = Resolve<IPermissionedObjectManager>();
            var export = new EntityConfigExport(src.EntityConfigRepo, src.EntityPropertyRepo, permissionedObjectManager);
            var exported = await export.ExportItemAsync(srcEntityConfig.Id);

            var dst = PrepareImportContext();
            var dstModule = await dst.GetOrCreateModuleAsync("test-module");
            var dstEntityConfig = await dst.AddEntityConfigAsync(c =>
            {
                c.Name = "test-entity";
                c.ClassName = Cls;
                c.Namespace = Ns;
                c.Label = "dst-label";
                c.Module = dstModule;
                c.VersionNo = 10;
                c.SetIsLast(true);
                c.VersionStatus = ConfigurationItemVersionStatus.Live;
                return Task.CompletedTask;
            });

            var uowManager = Resolve<IUnitOfWorkManager>();
            var mapper = Resolve<global::AutoMapper.IMapper>();
            // Built against dst's in-memory repos, not Resolve<IEntityConfigManager>() -- the real,
            // container-resolved manager operates on the real NHibernate-backed repos, which don't
            // know about the in-memory Module/EntityConfig rows this test set up and would fail on
            // real FK constraints when the UoW below flushes.
            var entityConfigManager = new EntityConfigManager(dst.EntityConfigRepo, dst.EntityPropertyRepo, dst.ModuleRepo, uowManager, mapper);
            var modelConfigsCacheHolder = Resolve<IModelConfigsCacheHolder>();
            var importer = new EntityConfigImport(dst.ModuleRepo, dst.FrontEndAppRepo, dst.EntityConfigRepo, dst.EntityPropertyRepo, permissionedObjectManager, entityConfigManager, uowManager, modelConfigsCacheHolder)
            {
                UnitOfWorkManager = uowManager,
            };
            var importContext = new PackageImportContext { CreateModules = true };

            EntityConfig imported;
            using (var uow = uowManager.Begin())
            {
                imported = await importer.ImportItemAsync(exported, importContext) as EntityConfig;
                await uow.CompleteAsync();
            }
            imported.ShouldNotBeNull();

            imported.Id.ShouldNotBe(dstEntityConfig.Id, "a new version record should be created, not the existing row mutated in place");
            imported.VersionNo.ShouldBe(dstEntityConfig.VersionNo + 1, "the new version number should be one greater than the existing version");
            imported.ParentVersion.ShouldBe(dstEntityConfig, "the new version's ParentVersion should point at the previous record");
            dstEntityConfig.VersionStatus.ShouldBe(ConfigurationItemVersionStatus.Retired, "the previous Live version should be retired");
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
            public IRepository<EntityConfig, Guid> EntityConfigRepo { get; set; }
            public IRepository<EntityProperty, Guid> EntityPropertyRepo { get; set; }
            public IRepository<Module, Guid> ModuleRepo { get; set; }
            public IRepository<FrontEndApp, Guid> FrontEndAppRepo { get; set; }

            public async Task<EntityConfig> AddEntityConfigAsync(Func<EntityConfig, Task> initAction)
            {
                var config = new EntityConfig
                {
                    Id = Guid.NewGuid(),
                };
                if (initAction != null)
                    await initAction(config);

                await EntityConfigRepo.InsertAsync(config);
                return config;
            }

            public async Task<EntityProperty> AddPropertyAsync(EntityConfig entityConfig, Action<EntityProperty> initAction, bool addToEntityConfig = true)
            {
                var property = new EntityProperty
                {
                    Id = Guid.NewGuid(),
                    EntityConfig = addToEntityConfig ? entityConfig : null,
                    Properties = new List<EntityProperty>(),
                };
                initAction?.Invoke(property);

                // NHibernate populates ParentProperty's Properties collection live from the DB
                // relationship (it's an [InverseProperty] navigation); the in-memory test double
                // doesn't, so link it explicitly to mirror what the real exporter expects to see.
                property.ParentProperty?.Properties.Add(property);

                await EntityPropertyRepo.InsertAsync(property);
                return property;
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

                EntityConfigRepo = GetRepository<EntityConfig, Guid>();
                EntityPropertyRepo = GetRepository<EntityProperty, Guid>();
                ModuleRepo = GetRepository<Module, Guid>();
                FrontEndAppRepo = GetRepository<FrontEndApp, Guid>();
            }
        }

        #endregion
    }
}
