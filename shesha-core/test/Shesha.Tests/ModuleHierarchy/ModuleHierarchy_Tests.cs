using Abp.Domain.Uow;
using Shesha.ConfigurationItems;
using Shesha.Tests.Fixtures;
using Shesha.Tests.ModuleA;
using Shesha.Tests.ModuleB;
using Shesha.Web.FormsDesigner.Services;
using Shouldly;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.ModuleHierarchy
{
    [Collection(SqlServerCollection.Name)]
    public partial class ModuleHierarchy_Tests : CiSheshaTestBase
    {
        public ModuleHierarchy_Tests(SqlServerFixture fixture) : base(fixture)
        {
        }

        [Fact]
        public async Task MultiLevelExposedFormResolution_Case1() 
        {
            /*
             * case: 
             *  modules hierarchy: TestModule > ModuleA > ModuleB > Shesha
             *  forms:
             *      Shesha/form-case1 declared
             *      ModuleA/form-case1 exposed from Shesha
             *      ModuleB/form-case1 exposed from Shesha
             *  current module: TestModule
             * expectations:
             *  request Shesha/form-case1 should return ModuleA/form-case1
             *  request ModuleB/form-case1 should return ModuleB/form-case1
             *  request ModuleA/form-case1 should return ModuleA/form-case1
             */

            var formManager = Resolve<FormManager>();
            var moduleManager = Resolve<IModuleManager>();

            var formName = "form-case1";

            await DeleteFormFromAllModulesAsync(formName);

            var uowManager = Resolve<IUnitOfWorkManager>();
            
            await WithUnitOfWorkAsync(async() => {

                var sheshaModule = await moduleManager.GetModuleAsync(SheshaFrameworkModule.ModuleName);

                // 1. Create Shesha form
                var sheshaForm1 = await formManager.CreateItemAsync(new Shesha.ConfigurationItems.Models.CreateItemInput { 
                    Module = sheshaModule,
                    Name = formName,
                });
                
                Assert.NotNull(sheshaForm1);

                // 2. Expose form1 to ModuleA
                var moduleA = await moduleManager.GetModuleAsync(SheshaTestsModuleA.ModuleName);
                var exposedInA = await formManager.ExposeAsync(sheshaForm1, moduleA);

                // 3. Expose form1 to ModuleB
                var moduleB = await moduleManager.GetModuleAsync(SheshaTestsModuleB.ModuleName);
                var exposedInB = await formManager.ExposeAsync(sheshaForm1, moduleB);

                await uowManager.Current.SaveChangesAsync();

                // 4. Resolve Shesha form (expect ModuleA form)
                var resolvedSheshaForm = await formManager.ResolveItemAsync(SheshaFrameworkModule.ModuleName, formName);
                resolvedSheshaForm.ShouldBe(exposedInA, $"Manager must resolve form `{SheshaFrameworkModule.ModuleName}/{formName}` as `{SheshaTestsModuleA.ModuleName}/{formName}`");

                // 5. Resolve ModuleB form (expect ModuleA form)
                var resolvedModuleBForm = await formManager.ResolveItemAsync(SheshaTestsModuleB.ModuleName, formName);
                resolvedModuleBForm.ShouldBe(exposedInB, $"Manager must resolve form `{SheshaTestsModuleB.ModuleName}/{formName}` as `{SheshaTestsModuleB.ModuleName}/{formName}`");

                // 6. Resolve ModuleA form (expect ModuleA form)
                var resolvedModuleAForm = await formManager.ResolveItemAsync(SheshaTestsModuleA.ModuleName, formName);
                resolvedModuleAForm.ShouldBe(exposedInA, $"Manager must resolve form `{SheshaTestsModuleA.ModuleName}/{formName}` as `{SheshaTestsModuleA.ModuleName}/{formName}`");
            });
        }


        [Fact]
        public async Task MultiLevelExposedFormResolution_Case2()
        {
            /*
             * case: 
             *  modules hierarchy: TestModule > ModuleA > ModuleB > Shesha
             *  forms:
             *      Shesha/form-case2 declared
             *      ModuleB/form-case2 exposed from Shesha
             *      ModuleA/form-case2 exposed from ModuleB
             *  current module: TestModule
             * expectations: 
             *  request Shesha/form-case2 should return ModuleA/form-case2
             *  request ModuleB/form-case2 should return ModuleA/form-case2
             *  request ModuleA/form-case2 should return ModuleA/form-case2
             */

            var formManager = Resolve<FormManager>();
            var moduleManager = Resolve<IModuleManager>();

            var formName = "form-case2";

            await DeleteFormFromAllModulesAsync(formName);

            var uowManager = Resolve<IUnitOfWorkManager>();

            await WithUnitOfWorkAsync(async () => {

                var sheshaModule = await moduleManager.GetModuleAsync(SheshaFrameworkModule.ModuleName);

                // 1. Create Shesha form
                var sheshaForm = await formManager.CreateItemAsync(new Shesha.ConfigurationItems.Models.CreateItemInput
                {
                    Module = sheshaModule,
                    Name = formName,
                });
                Assert.NotNull(sheshaForm);

                // 2. Expose sheshaForm to ModuleB
                var moduleB = await moduleManager.GetModuleAsync(SheshaTestsModuleB.ModuleName);
                var moduleBForm = await formManager.ExposeAsync(sheshaForm, moduleB);

                // 3. Expose moduleBForm to moduleA
                var moduleA = await moduleManager.GetModuleAsync(SheshaTestsModuleA.ModuleName);
                var moduleAForm = await formManager.ExposeAsync(moduleBForm, moduleA);

                await uowManager.Current.SaveChangesAsync();

                // 4. Resolve Shesha form (expect ModuleA form)
                var resolvedSheshaForm = await formManager.ResolveItemAsync(SheshaFrameworkModule.ModuleName, formName);
                resolvedSheshaForm.ShouldBe(moduleAForm, $"Manager must resolve form `{SheshaFrameworkModule.ModuleName}/{formName}` as `{SheshaTestsModuleA.ModuleName}/{formName}`");

                // 5. Resolve ModuleB form (expect ModuleA form)
                var resolvedModuleBForm = await formManager.ResolveItemAsync(SheshaTestsModuleB.ModuleName, formName);
                resolvedModuleBForm.ShouldBe(moduleAForm, $"Manager must resolve form `{SheshaTestsModuleB.ModuleName}/{formName}` as `{SheshaTestsModuleA.ModuleName}/{formName}`");

                // 6. Resolve ModuleA form (expect ModuleA form)
                var resolvedModuleAForm = await formManager.ResolveItemAsync(SheshaTestsModuleA.ModuleName, formName);
                resolvedModuleAForm.ShouldBe(moduleAForm, $"Manager must resolve form `{SheshaTestsModuleA.ModuleName}/{formName}` as `{SheshaTestsModuleA.ModuleName}/{formName}`");
            });
        }

        [Fact]
        public async Task MultiLevelExposedFormResolution_Case3()
        {
            /*
             * case: 
             *  modules hierarchy: TestModule > ModuleA > ModuleB > Shesha
             *  forms:
             *      Shesha/form-case3 declared
             *      ModuleB/form-case3 declared
             *  current module: TestModule
             * expectations: 
             *  request Shesha/form-case3 should return Shesha/form-case3
             *  request ModuleB/form-case3 should return ModuleB/form-case3
             */

            var formManager = Resolve<FormManager>();
            var moduleManager = Resolve<IModuleManager>();

            var formName = "form-case3";

            await DeleteFormFromAllModulesAsync(formName);

            var uowManager = Resolve<IUnitOfWorkManager>();

            await WithUnitOfWorkAsync(async () => {

                var sheshaModule = await moduleManager.GetModuleAsync(SheshaFrameworkModule.ModuleName);

                // 1. Create Shesha form
                var sheshaForm = await formManager.CreateItemAsync(new Shesha.ConfigurationItems.Models.CreateItemInput
                {
                    Module = sheshaModule,
                    Name = formName,
                });
                Assert.NotNull(sheshaForm);

                // 2. Create moduleB form
                var moduleB = await moduleManager.GetModuleAsync(SheshaTestsModuleB.ModuleName);
                var moduleBForm = await formManager.CreateItemAsync(new Shesha.ConfigurationItems.Models.CreateItemInput
                {
                    Module = moduleB,
                    Name = formName,
                });                
                Assert.NotNull(moduleBForm);

                await uowManager.Current.SaveChangesAsync();

                // 3. Resolve Shesha form (expect Shesha form)
                var resolvedSheshaForm = await formManager.ResolveItemAsync(SheshaFrameworkModule.ModuleName, formName);
                resolvedSheshaForm.ShouldBe(sheshaForm, $"Manager must resolve form `{SheshaFrameworkModule.ModuleName}/{formName}` as `{SheshaFrameworkModule.ModuleName}/{formName}`");

                // 4. Resolve ModuleB form (expect ModuleA form)
                var resolvedModuleBForm = await formManager.ResolveItemAsync(SheshaTestsModuleB.ModuleName, formName);
                resolvedModuleBForm.ShouldBe(moduleBForm, $"Manager must resolve form `{SheshaTestsModuleB.ModuleName}/{formName}` as `{SheshaTestsModuleB.ModuleName}/{formName}`");
            });
        }

        [Fact]
        public async Task When_ExposedOnTopLevel_Should_ReturnTopLevel()
        {
            /*
             * case: 
             *  modules hierarchy: TestModule > ModuleA > ModuleB > Shesha
             *  forms:
             *      Shesha/form-top-level declared
             *      TestModule/form-top-level exposed from Shesha
             *  current module: TestModule
             * expectations:
             *  request Shesha/form-top-level should return TestModule/form-top-level
             *  request TestModule/form-top-level should return TestModule/form-top-level
             */

            var formManager = Resolve<FormManager>();
            var moduleManager = Resolve<IModuleManager>();

            var formName = "form-top-level";

            await DeleteFormFromAllModulesAsync(formName);

            var uowManager = Resolve<IUnitOfWorkManager>();

            await WithUnitOfWorkAsync(async () => {

                var sheshaModule = await moduleManager.GetModuleAsync(SheshaFrameworkModule.ModuleName);

                // 1. Create Shesha form
                var sheshaForm1 = await formManager.CreateItemAsync(new Shesha.ConfigurationItems.Models.CreateItemInput
                {
                    Module = sheshaModule,
                    Name = formName,
                });

                Assert.NotNull(sheshaForm1);

                // 2. Expose form1 to ModuleA
                var testModule = await moduleManager.GetModuleAsync(SheshaTestModule.ModuleName);
                var exposedInTestModule = await formManager.ExposeAsync(sheshaForm1, testModule);

                await uowManager.Current.SaveChangesAsync();

                // 3. Resolve Shesha form (expect TestModule form)
                var resolvedSheshaForm = await formManager.ResolveItemAsync(SheshaFrameworkModule.ModuleName, formName);
                resolvedSheshaForm.ShouldBe(exposedInTestModule, $"Manager must resolve form `{SheshaFrameworkModule.ModuleName}/{formName}` as `{SheshaTestModule.ModuleName}/{formName}`");

                // 5. Resolve TestModule form (expect TestModule form)
                var resolvedTestModuleForm = await formManager.ResolveItemAsync(SheshaTestModule.ModuleName, formName);
                resolvedTestModuleForm.ShouldBe(exposedInTestModule, $"Manager must resolve form `{SheshaTestModule.ModuleName}/{formName}` as `{SheshaTestModule.ModuleName}/{formName}`");
            });
        }

        /*
        TODO: test exceptions when item not found in different operations (expose, get etc.)
        TODO: test exception when item is already exposed
        TODO: test exception when item already exists when creating
        TODO: test exception when item already exists when exposing
         */
    }
}
