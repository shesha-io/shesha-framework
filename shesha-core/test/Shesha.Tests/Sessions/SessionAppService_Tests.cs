using System.Threading.Tasks;
using Shouldly;
using Xunit;
using Shesha.Sessions;

namespace Shesha.Tests.Sessions
{
    /*
    public class SessionAppService_Tests : SheshaTestBase
    {
        private readonly ISessionAppService _sessionAppService;

        public SessionAppService_Tests()
        {
            _sessionAppService = Resolve<ISessionAppService>();
        }

        [MultiTenantFact]
        public async Task Should_Get_Current_User_When_Logged_In_As_Host()
        {
            // Arrange
            LoginAsHostAdmin();

            // Act
            var output = await _sessionAppService.GetCurrentLoginInformations();

            // Assert
            var currentUser = await GetCurrentUserAsync();
            output.User.ShouldNotBe(null);
            output.User.FirstName.ShouldBe(currentUser.Name);
            output.User.LastName.ShouldBe(currentUser.Surname);

            output.Tenant.ShouldBe(null);
        }

        [Fact]
        public async Task Should_Get_Current_User_And_Tenant_When_Logged_In_As_Tenant()
        {
            // Act
            var output = await _sessionAppService.GetCurrentLoginInformations();

            // Assert
            var currentUser = await GetCurrentUserAsync();
            var currentTenant = await GetCurrentTenantAsync();

            output.User.ShouldNotBe(null);
            output.User.FirstName.ShouldBe(currentUser.Name);

            output.Tenant.ShouldNotBe(null);
            output.Tenant.Name.ShouldBe(currentTenant.Name);
        }
    }
    */
}
