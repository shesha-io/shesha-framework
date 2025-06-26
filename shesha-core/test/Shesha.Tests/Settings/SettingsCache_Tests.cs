using Abp.Domain.Repositories;
using Moq;
using Shesha.Configuration;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.Reflection;
using Shesha.Services.Settings;
using Shesha.Services.Settings.Cache;
using Shesha.Settings;
using Shesha.Tests.Fixtures;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.Settings
{
    [Collection(SqlServerCollection.Name)]
    public class SettingsCache_Tests : SheshaNhTestBase
    {
        public SettingsCache_Tests(SqlServerFixture fixture) : base(fixture)
        {
        }

        [Fact]
        public async Task GetCachedValueTest_Async()
        {
            var settingName = SheshaSettingNames.UploadFolder;
            var settingModule = typeof(ISheshaSettings).GetConfigurableModuleName().NotNull();

            var module = new Module { Name = settingModule };
            var testConfiguration = new SettingConfiguration { 
                Id = "268A7384-72F5-4CCF-A411-BFCF5E5DDAD7".ToGuid(),
                Module = module,
                Name = settingName,
                VersionStatus = ConfigurationItemVersionStatus.Live,
            };
            testConfiguration.SetIsLast(true);

            var testValue = new SettingValue { 
                Id = "DCCFCC16-4EAA-4C1C-855D-6AE29A7F5286".ToGuid(),
                SettingConfiguration = testConfiguration,
                Value = "Test Value",                
            };

            var mockValueRepo = new Mock<IRepository<SettingValue, Guid>>();
            mockValueRepo.Setup(repo => repo.GetAll()).Returns(() => {
                return new List<SettingValue> { testValue }.AsQueryable();
            });
            var mockConfigRepo = new Mock<IRepository<SettingConfiguration, Guid>>();
            mockConfigRepo.Setup(repo => repo.GetAll()).Returns(() => {
                return new List<SettingConfiguration> { testConfiguration }.AsQueryable();
            });
            var mockModuleRepo = new Mock<IRepository<Module, Guid>>();
            mockModuleRepo.Setup(repo => repo.GetAll()).Returns(() => {
                return new List<Module> { module }.AsQueryable();
            });

            var cacheHolder = Resolve<ISettingCacheHolder>();
            await cacheHolder.Cache.ClearAsync();

            var manager = Resolve<SettingStore>(new {
                repository = mockConfigRepo.Object,
                settingValueRepository = mockValueRepo.Object,
                moduleRepository = mockModuleRepo.Object,
                cacheHolder,
            });

            var definitionManager = Resolve<ISettingDefinitionManager>();
            var definition = definitionManager.GetAll().First(d => d.Name == settingName && d.ModuleName == settingModule);

            var value1 = await manager.GetValueAsync(definition, new SettingManagementContext());

            Assert.Equal(value1, testValue.Value);
            mockValueRepo.Verify(repo => repo.GetAll(), Times.Once);

            var value2 = await manager.GetValueAsync(definition, new SettingManagementContext());
            var value3 = await manager.GetValueAsync(definition, new SettingManagementContext());
            
            Assert.Equal(value1, value2);
            Assert.Equal(value2, value3);
            mockValueRepo.Verify(repo => repo.GetAll(), Times.Once);            
        }
    }
}
