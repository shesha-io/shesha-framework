using FluentMigrator;

namespace Shesha.FluentMigrator
{
    public interface ISheshaAutoDbMigration : IMigration
    {
        /// <summary>
        /// Collect the migration expressions
        /// </summary>
        void Process();
    }
}
