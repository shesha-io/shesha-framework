using Shesha.Permissions;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.Permissions
{
    public class Permissions_Tests : SheshaNhTestBase
    {
        [Fact]
        public async Task GetAllApi_Test()
        {
            var permissionedObjectManager = Resolve<PermissionedObjectManager>();
            var api = await permissionedObjectManager.GetAllTreeAsync();
        }
    }
}
