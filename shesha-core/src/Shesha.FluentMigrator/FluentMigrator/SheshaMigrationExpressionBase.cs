using FluentMigrator;
using FluentMigrator.Expressions;

namespace Shesha.FluentMigrator
{
    /// <summary>
    /// Shesha migration expression base class
    /// </summary>
    public abstract class SheshaMigrationExpressionBase: MigrationExpressionBase
    {
        protected IQuerySchema QuerySchema { get; private set; }

        public SheshaMigrationExpressionBase(IQuerySchema querySchema)
        {
            QuerySchema = querySchema;
        }
    }
}
