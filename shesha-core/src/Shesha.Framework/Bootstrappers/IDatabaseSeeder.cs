using System;
using System.Threading.Tasks;

namespace Shesha.Bootstrappers
{
    /// <summary>
    /// Seed the database (execute migration, bootstrappers, initialisatons)
    /// </summary>
    public interface IDatabaseSeeder: IDisposable
    {
        /// <summary>
        /// 1 stage - migrate the DB
        /// </summary>
        /// <returns></returns>
        Task MigrateDatabaseAsync();

        /// <summary>
        /// 2 stage - bootstrap the DB from the code
        /// </summary>
        /// <returns></returns>
        Task BootstrapDatabaseAsync();

        /// <summary>
        /// 3 stage - initialization the application data from the DB
        /// </summary>
        /// <returns></returns>
        Task InitDataFromDatabaseAsync();
    }
}
