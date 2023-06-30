using FluentMigrator.Expressions;
using FluentMigrator.Runner.Conventions;
using System.Data;

namespace Shesha.FluentMigrator.Conventions
{
    public class CitextColumnConvention : IColumnsConvention
    {
        private List<DbType> _stringTypes = new List<DbType> { DbType.String, DbType.StringFixedLength, DbType.AnsiString, DbType.AnsiStringFixedLength };

        public IColumnsExpression Apply(IColumnsExpression expression)
        {
            foreach (var columnDefinition in expression.Columns)
            {
                if (columnDefinition.Type != null && _stringTypes.Contains(columnDefinition.Type.Value))
                {
                    columnDefinition.Type = null;
                    columnDefinition.CustomType = "citext";
                }
            }

            return expression;
        }
    }
}
