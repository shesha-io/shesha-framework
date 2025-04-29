using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Shesha.Domain;
using Shesha.Services.VersionedFields;
using Shesha.Tests.Fixtures;
using Shouldly;
using System;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.VersionedFields
{
    [Collection(SqlServerCollection.Name)]
    public class VersionedField_Tests: SheshaNhTestBase
    {
        private readonly IUnitOfWorkManager _unitOfWorkManager;

        public VersionedField_Tests(SqlServerFixture fixture) : base(fixture)
        {
            _unitOfWorkManager = Resolve<IUnitOfWorkManager>();
        }

        [Fact]
        public async Task ReadWrite_TestAsync()
        {
            LoginAsHostAdmin();

            using (var uow = _unitOfWorkManager.Begin()) 
            {
                var areaRepo = LocalIocManager.Resolve<IRepository<Area, Guid>>();

                // create temp area
                var area = new Area()
                {
                    Name = "Test Area",
                };
                await areaRepo.InsertAsync(area);

                var manager = Resolve<IVersionedFieldManager>();
                var fieldName = "DynamicField";
                    
                var fieldValue = await manager.GetVersionedFieldValueAsync<Area, Guid>(area, fieldName);
                fieldValue.ShouldBeNull();

                const string testValue = "test value";
                await manager.SetVersionedFieldValueAsync<Area, Guid>(area, fieldName, testValue, true);
                    
                var fieldValue2 = await manager.GetVersionedFieldValueAsync<Area, Guid>(area, fieldName);
                fieldValue2.ShouldBe(testValue);

                // delete temp area
                await areaRepo.HardDeleteAsync(area);
                await uow.CompleteAsync();
            }
        }
    }
}
