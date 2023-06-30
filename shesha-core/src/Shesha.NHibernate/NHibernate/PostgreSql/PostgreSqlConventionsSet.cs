using FluentMigrator.Runner;
using FluentMigrator.Runner.Conventions;
using JetBrains.Annotations;
using Shesha.FluentMigrator.Conventions;
using System.Collections.Generic;
using System.Linq;

namespace Shesha.NHibernate.PostgreSql
{
    /// <summary>
    /// PostgreSql conventions set
    /// </summary>
    public class PostgreSqlConventionsSet: IConventionSet
    {
        public PostgreSqlConventionsSet()
            : this(new DefaultConventionSet())
        {
        }

        public PostgreSqlConventionsSet(IConventionSet innerConventionSet)
        {
            ForeignKeyConventions = innerConventionSet.ForeignKeyConventions;

            ColumnsConventions = innerConventionSet.ColumnsConventions.ToList();
            ColumnsConventions.Add(new CitextColumnConvention());

            ConstraintConventions = innerConventionSet.ConstraintConventions;
            IndexConventions = innerConventionSet.IndexConventions;
            SequenceConventions = innerConventionSet.SequenceConventions;
            AutoNameConventions = innerConventionSet.AutoNameConventions;
            SchemaConvention = innerConventionSet.SchemaConvention;
            RootPathConvention = innerConventionSet.RootPathConvention;
        }

        /// <inheritdoc />
        public IRootPathConvention RootPathConvention { get; }

        /// <inheritdoc />
        public DefaultSchemaConvention SchemaConvention { get; }

        /// <inheritdoc />
        public IList<IColumnsConvention> ColumnsConventions { get; }

        /// <inheritdoc />
        public IList<IConstraintConvention> ConstraintConventions { get; }

        /// <inheritdoc />
        public IList<IForeignKeyConvention> ForeignKeyConventions { get; }

        /// <inheritdoc />
        public IList<IIndexConvention> IndexConventions { get; }

        /// <inheritdoc />
        public IList<ISequenceConvention> SequenceConventions { get; }

        /// <inheritdoc />
        public IList<IAutoNameConvention> AutoNameConventions { get; }
    }
}
