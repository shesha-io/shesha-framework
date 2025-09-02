using Abp.Reflection;
using Castle.Core.Internal;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.Extensions;
using Shesha.FluentMigrator;
using Shesha.Generators;
using Shesha.Reflection;
using Shesha.Startup;
using System.Linq;

namespace Shesha.Migrations
{

    public class MultiEntityReferenceMigration : SheshaAutoDbMigration, ISheshaAutoDbMigration
    {
        private readonly ITypeFinder _typeFinder;
        private readonly IApplicationStartupSession _startupSession;
        private readonly INameGenerator _nameGenerator;

        public MultiEntityReferenceMigration(ITypeFinder typeFinder, IApplicationStartupSession startupSession, INameGenerator nameGenerator)
        {
            _typeFinder = typeFinder;
            _startupSession = startupSession;
            _nameGenerator = nameGenerator;
        }

        public override void Process()
        {
            var entityTypes = _typeFinder.Find(x => x.IsEntityType() && !_startupSession.AssemblyStaysUnchanged(x.Assembly));
            var mtmProperties = entityTypes
                .SelectMany(x => x.GetProperties().Where(p => p.HasAttribute<ManyToManyAttribute>()))
                .Where(x => x.GetAttribute<ManyToManyAttribute>().AutoGeneration)
                .DistinctBy(x => $"{x.DeclaringType.NotNull().Name}_{x.Name}")
                .ToList();

            if (!Schema.Schema(_nameGenerator.AutoGeneratorDbSchema).Exists())
                Create.Schema(_nameGenerator.AutoGeneratorDbSchema);

            foreach (var property in mtmProperties)
            {
                var (parentType, parentIdType, childType, childIdType) = MappingHelper.GetManyToManyTableData(property);
                var(tableName, parentTableName, childTableName, parentColumnName, childColumnName) = _nameGenerator.GetAutoManyToManyTableNames(property);
                if (!Schema.Schema(_nameGenerator.AutoGeneratorDbSchema).Table(tableName).Exists())
                {
                    var table = Create.Table(tableName).InSchema(_nameGenerator.AutoGeneratorDbSchema)
                        .WithForeignKeyColumn(parentIdType, parentColumnName, parentTableName).NotNullable()
                        .WithForeignKeyColumn(childIdType, childColumnName, childTableName).NotNullable();
                }
            }
        }
    }
}
