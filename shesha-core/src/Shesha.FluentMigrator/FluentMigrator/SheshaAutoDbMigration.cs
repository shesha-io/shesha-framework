using Castle.Core.Logging;

namespace Shesha.FluentMigrator
{
    public abstract class SheshaAutoDbMigration : OneWayMigration, ISheshaAutoDbMigration
    {
        /// <summary>
        /// Gets or sets the logger.
        /// </summary>
        public ILogger Logger { get; set; } = NullLogger.Instance;

        public virtual void Process()
        {
            throw new NotImplementedException();
        }

        public override void Up()
        {
            Process();
        }
    }
}
