using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.Fixtures
{
    public class LocalSqlServerFixture : IDatabaseFixture, IAsyncLifetime
    {
        public string ConnectionString { get; private set; }

        public DbmsType DbmsType { get; private set; } = DbmsType.SQLServer;

        public LocalSqlServerFixture()
        {
        }

        public Task InitializeAsync()
        {
            var config = new ConfigurationBuilder().AddJsonFile("appsettings.json").Build();
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
