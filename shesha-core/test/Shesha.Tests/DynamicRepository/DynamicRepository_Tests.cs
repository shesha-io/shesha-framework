using Abp.Domain.Uow;
using Shesha.MultiTenancy;
using Shesha.Services;
using Shouldly;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.DynamicRepository
{
    public class DynamicRepository_Tests: SheshaNhTestBase
    {
        [Fact]
        public async Task GetEntity_Test()
        {
            var uowManager = Resolve<IUnitOfWorkManager>();

            using (var uow = uowManager.Begin()) 
            {
                var rep = Resolve<IDynamicRepository>();
                var tenant = await rep.GetAsync(typeof(Tenant), "1");

                tenant.ShouldNotBeNull();
            }
        }
    }
}
