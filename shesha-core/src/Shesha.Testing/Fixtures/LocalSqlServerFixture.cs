using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Testing.Fixtures
{
    /// <summary>
    /// xUnit fixture for a local SQL Server instance. Reads connection from appsettings.Test.json.
    /// </summary>
    public class LocalSqlServerFixture : IDatabaseFixture, IAsyncLifetime
    {
        public string ConnectionString { get; private set; } = default!;

        public DbmsType DbmsType { get; private set; } = DbmsType.SQLServer;

        public LocalSqlServerFixture()
        {
        }

        public Task InitializeAsync()
        {
            var config = new ConfigurationBuilder().AddJsonFile("appsettings.Test.json").Build();
            DbmsType = config.GetDbmsType();
            ConnectionString = config.GetRequiredConnectionString("TestDB");

            return Task.CompletedTask;
        }

        public Task DisposeAsync()
        {
            return Task.CompletedTask;
        }
    }
}
