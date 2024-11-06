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
        protected DbmsType DbmsType { get; private set; }

        public SheshaMigrationExpressionBase(DbmsType dbmsType, IQuerySchema querySchema)
        {
            QuerySchema = querySchema;
            DbmsType = dbmsType;
        }
    }
}
