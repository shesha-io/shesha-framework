using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using FluentMigrator.Builders;
using FluentMigrator.Builders.Alter.Table;
using FluentMigrator.Builders.Create.Table;
using FluentMigrator.Infrastructure;
using FluentMigrator.Model;
using NHibernate.Type;
using Shesha.Authorization.Users;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.EntityReferences;
using Shesha.Extensions;
using Shesha.FluentMigrator;
using Shesha.Migrations;
using Shesha.NHibernate.Maps;
using Shesha.Reflection;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Reflection;
using System.Text;

namespace Shesha.CodeGeneration
{
    public class MigrationGenerator: IMigrationGenerator, ITransientDependency
    {
        public string GenerateMigrations(List<Type> entityTypes)
        {
            var types = SortEntityTypesByDependencies(entityTypes);

            // generate migration for each entity type
            var sb = new StringBuilder();

            
            // step 1: create/alter tables (except foreign keys)
            foreach (var entityType in types)
            {
                try
                {
                    var isRoot = MappingHelper.IsRootEntity(entityType);
                    var migration = GenerateTableMigration(entityType,
                        isRoot ? DdlStatement.Create : DdlStatement.Alter, 
                        prop => true
                    );
                    if (!string.IsNullOrWhiteSpace(migration))
                        sb.AppendLine(migration);
                }
                catch (Exception e)
                {
                    sb.AppendLine($"            // ⚠ failed to generate migration for {entityType.FullName}");
                    sb.AppendLine($"            // Error message: {e.Message}");
                    sb.AppendLine("");
                }
            }
            
            // step 2: handle foreign keys
            foreach (var entityType in types)
            {
                var helpersColumns = GetHelpers().Values.SelectMany(e => e).Distinct().ToList();

                var isRoot = MappingHelper.IsRootEntity(entityType);
                var allProps = GetPersistedProperties(entityType, !isRoot);
                var props = allProps.Where(prop =>
                {
                    if (!prop.PropertyType.IsEntityType())
                        return false;

                    var specialNames = new string[] {
                        nameof(ICreationAudited<User>.CreatorUser),
                        nameof(IAudited<User>.LastModifierUser),
                        nameof(IDeletionAudited<User>.DeleterUser),
                    };

                    return !(prop.PropertyType.IsAssignableTo(typeof(User)) && specialNames.Contains(prop.Name));
                }).ToList();

                foreach (var prop in props)
                {
                    var migration = GenerateForeignKeyMigration(entityType, prop);
                    if (!string.IsNullOrWhiteSpace(migration))
                        sb.AppendLine(migration);
                }            
            }

            return sb.ToString();
        }

        private string GenerateForeignKeyMigration(Type entityType, PropertyInfo property)
        {
            if (!property.PropertyType.IsEntityType())
                return string.Empty;

            var sb = new StringBuilder();
            
            var masterIdProp = property.PropertyType.GetRequiredProperty(nameof(Entity.Id));

            var primaryTable = MappingHelper.GetTableName(property.PropertyType);
            var primaryTableSchema = MappingHelper.GetSchemaName(property.PropertyType);
            var primaryIdName = MappingHelper.GetColumnName(masterIdProp);

            var fkColumn = MappingHelper.GetForeignKeyColumn(property);
            var schema = MappingHelper.GetSchemaName(entityType);

            var fk = new ForeignKeyDefinition()
            {
                ForeignTableSchema = schema,
                ForeignTable = MappingHelper.GetTableName(entityType),
                ForeignColumns = new[] { fkColumn },

                PrimaryTableSchema = primaryTableSchema,
                PrimaryTable = primaryTable,
                PrimaryColumns = new[] { primaryIdName },
            };
            var fkName = GetDefaultForeignKeyName(fk);

            sb.Append($"            Create.ForeignKey(\"{fkName}\")");
            sb.Append($".FromTable(\"{fk.ForeignTable}\")");
            
            if (!string.IsNullOrWhiteSpace(fk.ForeignTableSchema))
                sb.Append($".InSchema(\"{fk.ForeignTableSchema}\")");
            
            if (fk.ForeignColumns.Count == 1)
                sb.Append($".ForeignColumn({fk.ForeignColumns.Single().DoubleQuote()})");
            else
                sb.Append($".ForeignColumns({(fk.ForeignColumns.Select(c => c.DoubleQuote()).Delimited(", "))})");
            

            sb.Append($".ToTable(\"{fk.PrimaryTable}\")");

            if (!string.IsNullOrWhiteSpace(fk.PrimaryTableSchema))
                sb.Append($".InSchema(\"{fk.PrimaryTableSchema}\")");

            if (fk.PrimaryColumns.Count == 1)
                sb.Append($".PrimaryColumn({fk.PrimaryColumns.Single().DoubleQuote()})");
            else
                sb.Append($".PrimaryColumns({(fk.PrimaryColumns.Select(c => c.DoubleQuote()).Delimited(", "))})");
            sb.Append(";");
            sb.AppendLine();

            return sb.ToString();
        }

        public Dictionary<string, List<Type>> GroupByPrefixes(List<Type> entityTypes)
        {
            return entityTypes
                .GroupBy(t => MappingHelper.GetTablePrefix(t), (prefix, types) => new {prefix, types})
                .ToDictionary(i => i.prefix, i => i.types.ToList());
        }

        public static List<Type> SortEntityTypesByDependencies(List<Type> types)
        {
            var withDeps = types.Select(et =>
            {
                var baseClasses = et.GetFullChain(t => t.BaseType).Where(t => t.IsEntityType() && t != et).ToList();
                var referencedTypes = GetPersistedProperties(et, false).Where(p => p.PropertyType.IsEntityType())
                    .Select(p => p.PropertyType).ToList();
                return new
                {
                    Type = et,
                    BaseClasses = baseClasses,
                    ReferencedTypes = referencedTypes
                };
            }).ToList();

            var sorted = new List<Type>();

            int added;
            do
            {
                added = 0;
                foreach (var item in withDeps)
                {
                    if (!sorted.Contains(item.Type) && 
                        item.BaseClasses.All(d => sorted.Contains(d)))
                    {
                        sorted.Add(item.Type);
                        added++;
                    }
                }
            } while (sorted.Count < withDeps.Count && added > 0);

            if (added == 0)
            {
                var missingTypes = withDeps.Where(i => !sorted.Contains(i.Type)).Select(i => i.Type).ToList();
                sorted.AddRange(missingTypes);
            }

            return sorted;
        }

        /// <summary>
        /// Generate migration 
        /// </summary>
        /// <param name="entityType"></param>
        /// <param name="ddlStatement"></param>
        /// <param name="propertyFilter"></param>
        /// <returns></returns>
        public static string GenerateTableMigration(Type entityType, DdlStatement ddlStatement, Func<PropertyInfo, bool> propertyFilter)
        {
            var sb = new StringBuilder();

            // todo: handle this case: OrganisationUnit -> OrganisationBase<OrganisationUnit> (parent prop here) -> OrganisationBase
            var isRoot = MappingHelper.IsRootEntity(entityType);
            var schema = MappingHelper.GetSchemaName(entityType);

            switch (ddlStatement)
            {
                case DdlStatement.Create:
                {
                    var props = GetPersistedProperties(entityType, !isRoot);
                    if (propertyFilter != null) 
                        props = props.Where(p => propertyFilter.Invoke(p)).ToList();

                    if (props.Any() || isRoot)
                    {
                        sb.AppendLine($"            // {entityType.FullName}");
                        sb.Append($@"            Create.Table(""{MappingHelper.GetTableName(entityType)}"")");
                        if (!string.IsNullOrWhiteSpace(schema))
                            sb.Append($@".InSchema(""{schema}"")");

                        AddColumns(entityType, sb, props, ddlStatement);
                        var discriminatorColumn = MappingHelper.GetDiscriminatorColumn(entityType);
                        if (!string.IsNullOrWhiteSpace(discriminatorColumn))
                        {
                            var columnName = discriminatorColumn == "Frwk_Discriminator"
                                ? null
                                : discriminatorColumn.DoubleQuote();
                            sb.AppendLine();
                            sb.Append($@"                .{nameof(SheshaFluentMigratorExtensions.WithDiscriminator)}({columnName})");
                        }
                        sb.AppendLine(";");
                    }

                    break;
                }
                case DdlStatement.Alter:
                {
                    var props = GetPersistedProperties(entityType, !isRoot);
                    if (propertyFilter != null)
                        props = props.Where(p => propertyFilter.Invoke(p)).ToList();
                    if (props.Any())
                    {
                        sb.AppendLine($"            // {entityType.FullName}");
                        sb.Append($@"            Alter.Table(""{MappingHelper.GetTableName(entityType)}"")");
                        if (!string.IsNullOrWhiteSpace(schema))
                            sb.Append($@".InSchema(""{schema}"")");
                        AddColumns(entityType, sb, props, ddlStatement);
                        sb.AppendLine(";");
                    }
                    break;
                }
            }
        
            return sb.ToString();
        }

        private static List<PropertyInfo> GetPersistedProperties(Type entityType, bool declaredOnly)
        {
            var flags = BindingFlags.GetProperty | BindingFlags.Public | BindingFlags.Instance;
            if (declaredOnly)
                flags = flags | BindingFlags.DeclaredOnly;

            var properties = entityType.GetProperties(flags)
                .Where(p => NhMappingHelper.IsPersistentProperty(p) &&
                            (!typeof(System.Collections.IEnumerable).IsAssignableFrom(p.PropertyType) /*skip enumerables except strings*/ || p.PropertyType == typeof(string) || p.HasAttribute<SaveAsJsonAttribute>()))
                .ToList();
            if (declaredOnly && entityType.BaseType != null)
            {
                // filter out `overrided` properties
                properties = properties.Where(p => entityType.BaseType.GetProperty(p.Name, BindingFlags.GetProperty | BindingFlags.Public | BindingFlags.Instance) == null).ToList();
            }

            var propNames = properties
                .OrderBy(p => p.Name == "Id" ? 0 : 1)
                .ThenBy(p => p.Name)
                .ToList();

            return propNames;
        }

        private static void AddColumns(Type entityType, StringBuilder sb, List<PropertyInfo> properties, DdlStatement statement)
        {
            var allProps = properties.ToList(); // make a copy of the list to prevent mutations

            var idProp = properties.FirstOrDefault(p => p.Name == nameof(Entity.Id));
            if (idProp != null)
            {
                if (statement == DdlStatement.Create)
                {
                    sb.AppendLine();

                    var idName = MappingHelper.GetIdColumnName(idProp);
                    var idNameParam = idName == DatabaseConsts.IdColumn
                        ? null
                        : idName.DoubleQuote();

                    if (idProp.PropertyType == typeof(Guid))
                        sb.Append($@"                .{nameof(SheshaFluentMigratorExtensions.WithIdAsGuid)}({idNameParam})");
                    else
                    if (idProp.PropertyType == typeof(int))
                        sb.Append($@"                .{nameof(SheshaFluentMigratorExtensions.WithIdAsInt32)}({idNameParam})");
                    else
                    if (idProp.PropertyType == typeof(Int64))
                        sb.Append($@"                .{nameof(SheshaFluentMigratorExtensions.WithIdAsInt64)}({idNameParam})");
                    else
                        throw new NotSupportedException($"Id of type {idProp.PropertyType.FullName} is not supported");

                    allProps.Remove(idProp);
                }
            }

            var customProps = ProcessFrameworkColumns(entityType, sb, allProps, statement)
                .OrderBy(p => p.Name)
                .ToList();
            
            foreach (var property in customProps)
            {
                sb.AppendLine();
                if (property.PropertyType.IsEntityType())
                {
                    var masterIdProp = property.PropertyType.GetRequiredProperty(nameof(Entity.Id));

                    var primaryTable = MappingHelper.GetTableName(property.PropertyType);
                    var primaryTableSchema = MappingHelper.GetSchemaName(property.PropertyType);
                    var primaryIdName = MappingHelper.GetColumnName(masterIdProp);

                    var fkColumn = MappingHelper.GetForeignKeyColumn(property);
                    var schema = MappingHelper.GetSchemaName(entityType);

                    var fk = new ForeignKeyDefinition() { 
                        ForeignTableSchema = schema,
                        ForeignTable = MappingHelper.GetTableName(entityType),
                        ForeignColumns = new[] { fkColumn },

                        PrimaryTableSchema = primaryTableSchema,
                        PrimaryTable = primaryTable,
                        PrimaryColumns = new[] { primaryIdName },
                    };
                    var fkName = GetDefaultForeignKeyName(fk);

                    if (string.IsNullOrWhiteSpace(schema) && string.IsNullOrWhiteSpace(primaryTableSchema))
                    {
                        var method = statement == DdlStatement.Create
                            ? nameof(SheshaFluentMigratorExtensions.WithForeignKeyColumn)
                            : nameof(SheshaFluentMigratorExtensions.AddForeignKeyColumn);

                        sb.Append($@"                .{method}(""{fkColumn}"", ""{primaryTable}"")");
                    }
                    else {
                        var method = statement == DdlStatement.Create
                            ? nameof(ICreateTableWithColumnSyntax.WithColumn)
                            : nameof(IAlterTableAddColumnOrAlterColumnSyntax.AddColumn);

                        var masterIdType = masterIdProp.PropertyType;
                        var typeClause = masterIdType == typeof(Guid) 
                            ? "AsGuid()" 
                            : masterIdType == typeof(Int64) 
                                ? "AsInt64()"
                                : throw new NotSupportedException($"Id of type {masterIdType.FullName} is not supported");

                        var nullableClause = property.IsNullable() ? "Nullable()" : "NotNullable()";
                        sb.Append($@"                .{method}(""{fkColumn}"").{typeClause}.{nullableClause}.Indexed()");
                    }
                } else 
                {
                    var method = statement == DdlStatement.Create
                        ? nameof(ICreateTableWithColumnSyntax.WithColumn)
                        : nameof(IAlterTableAddColumnOrAlterColumnSyntax.AddColumn);

                    var columnName = MappingHelper.GetColumnName(property);

                    var propUnderlyingType = property.PropertyType.GetUnderlyingTypeIfNullable();
                    var treatAsString = false;

                    sb.Append($@"                .{method}(""{columnName}"")");

                    if (propUnderlyingType == typeof(string))
                    {
                        treatAsString = true;
                        var maxLength1 = property.GetAttributeOrNull<StringLengthAttribute>()?.MaximumLength;
                        var maxLength2 = property.GetAttributeOrNull<MaxLengthAttribute>()?.Length;
                        if (maxLength1.HasValue && maxLength2.HasValue && maxLength1 != maxLength2)
                            throw new NotSupportedException("MaxLengthAttribute and StringLengthAttribute have different values");
                        var maxLength = maxLength1 ?? maxLength2;

                        sb.Append(maxLength != null && maxLength < int.MaxValue
                            ? $@".{nameof(IColumnTypeSyntax<IFluentSyntax>.AsString)}({maxLength})"
                            : $@".{nameof(SheshaFluentMigratorExtensions.AsStringMax)}()");
                    }
                    else if (propUnderlyingType == typeof(int))
                    {
                        sb.Append($@".{nameof(IColumnTypeSyntax<IFluentSyntax>.AsInt32)}()");
                    }
                    else if (propUnderlyingType == typeof(Int64) || property.PropertyType.IsEnumType())
                    {
                        sb.Append($@".{nameof(IColumnTypeSyntax<IFluentSyntax>.AsInt64)}()");
                    }
                    else if (propUnderlyingType == typeof(decimal))
                    {
                        var precisionAttribute = property.GetAttributeOrNull<PrecisionAndScaleAttribute>();
                        if (precisionAttribute != null)
                            sb.Append($@".{nameof(IColumnTypeSyntax<IFluentSyntax>.AsDecimal)}({precisionAttribute.Precision}, {precisionAttribute.Scale})");
                        else
                            sb.Append($@".{nameof(IColumnTypeSyntax<IFluentSyntax>.AsDecimal)}()");
                    }
                    else if (propUnderlyingType == typeof(float))
                    {
                        sb.Append($@".{nameof(IColumnTypeSyntax<IFluentSyntax>.AsFloat)}()");
                    }
                    else if (propUnderlyingType == typeof(double))
                    {
                        sb.Append($@".{nameof(IColumnTypeSyntax<IFluentSyntax>.AsDouble)}()");
                    }
                    else if (propUnderlyingType == typeof(bool))
                    {
                        sb.Append($@".{nameof(IColumnTypeSyntax<IFluentSyntax>.AsBoolean)}()");
                    }
                    else if (propUnderlyingType == typeof(DateTime))
                    {
                        sb.Append($@".{nameof(IColumnTypeSyntax<IFluentSyntax>.AsDateTime)}()");
                    }
                    else if (propUnderlyingType == typeof(Guid))
                    {
                        sb.Append($@".{nameof(IColumnTypeSyntax<IFluentSyntax>.AsGuid)}()");
                    }
                    else if (propUnderlyingType == typeof(TimeSpan))
                    {
                        sb.Append($@".{nameof(IColumnTypeSyntax<IFluentSyntax>.AsInt64)}()");
                    }
                    else if (propUnderlyingType == typeof(FormIdentifier))
                    {
                        sb.Append($@".{nameof(IColumnTypeSyntax<IFluentSyntax>.AsInt64)}()");
                    }
                    else if (property.HasAttribute<SaveAsJsonAttribute>())
                    {
                        treatAsString = true;
                        sb.Append($@".{nameof(SheshaFluentMigratorExtensions.AsStringMax)}()");
                    }
                    else if (propUnderlyingType.IsJsonEntityType()) 
                    {
                        treatAsString = true;
                        sb.Append($@".{nameof(SheshaFluentMigratorExtensions.AsStringMax)}()");
                    }
                    else
                        throw new NotSupportedException($"unsupported property type: '{property.PropertyType.FullName}'");

                    if (property.PropertyType.IsNullableType() 
                        || treatAsString && property.IsNullable()
                        || property.DeclaringType?.BaseType != null && property.DeclaringType.BaseType.IsEntityType() /*property declared in the subclass*/)
                        sb.Append($@".{nameof(IColumnOptionSyntax<IFluentSyntax, IFluentSyntax>.Nullable)}()");
                }
            }
        }

        private static string GetDefaultForeignKeyName(ForeignKeyDefinition foreignKey)
        {
            var sb = new StringBuilder();

            sb.Append("fk_");
            sb.Append(foreignKey.ForeignTable);

            foreach (string foreignColumn in foreignKey.ForeignColumns)
            {
                sb.Append("_");
                sb.Append(foreignColumn);
            }

            return sb.ToString();
        }

        private static Dictionary<string, List<string>> GetHelpers() 
        {
            return new Dictionary<string, List<string>>()
            {
                { nameof(SheshaFluentMigratorExtensions.WithFullAuditColumns),
                    new List<string>
                    {
                        nameof(ISoftDelete.IsDeleted),
                        nameof(IDeletionAudited.DeleterUserId),
                        nameof(IHasDeletionTime.DeletionTime),

                        nameof(ICreationAudited.CreatorUserId),
                        nameof(IHasCreationTime.CreationTime),
                        nameof(IModificationAudited.LastModifierUserId),
                        nameof(IHasModificationTime.LastModificationTime)
                    }
                },
                { nameof(SheshaFluentMigratorExtensions.WithAuditColumns),
                    new List<string>
                    {
                        nameof(ICreationAudited.CreatorUserId),
                        nameof(IHasCreationTime.CreationTime),
                        nameof(IModificationAudited.LastModifierUserId),
                        nameof(IHasModificationTime.LastModificationTime)
                    }
                },
                { nameof(SheshaFluentMigratorExtensions.WithCreationAuditColumns),
                    new List<string>
                    {
                        nameof(ICreationAudited.CreatorUserId),
                        nameof(IHasCreationTime.CreationTime)
                    }
                },
                { nameof(SheshaFluentMigratorExtensions.WithModificationAuditColumns),
                    new List<string>
                    {
                        nameof(IModificationAudited.LastModifierUserId),
                        nameof(IHasModificationTime.LastModificationTime)
                    }
                },
                { nameof(SheshaFluentMigratorExtensions.WithDeletionAuditColumns),
                    new List<string>
                    {
                        nameof(ISoftDelete.IsDeleted),
                        nameof(IDeletionAudited.DeleterUserId),
                        nameof(IHasDeletionTime.DeletionTime)
                    }
                }
            };
        }

        /// <summary>
        /// Process framework helpers and return list of unprocessed properties
        /// </summary>
        private static List<PropertyInfo> ProcessFrameworkColumns(Type entityType, StringBuilder sb, List<PropertyInfo> properties, DdlStatement statement)
        {
            var helpers = GetHelpers();

            var objectNamesExpression = MappingHelper.GetDbNamesExpression(entityType);

            foreach (var helper in helpers)
            {
                if (helper.Value.All(propName => properties.Any(p => p.Name == propName)))
                {
                    // apply helper
                    sb.AppendLine();
                    sb.Append($@"                .{helper.Key}({objectNamesExpression})");
                    
                    // filter properties
                    properties = properties.Where(p => !helper.Value.Contains(p.Name)).ToList();
                }
            }

            // handle tenantId
            var tenantProp = properties.FirstOrDefault(p => p.Name == nameof(IMayHaveTenant.TenantId));
            if (tenantProp != null)
            {
                //IMustHaveTenant
                var helper = typeof(IMustHaveTenant).IsAssignableFrom(tenantProp.DeclaringType)
                    ? nameof(SheshaFluentMigratorExtensions.WithTenantIdAsRequired)
                    : typeof(IMayHaveTenant).IsAssignableFrom(tenantProp.DeclaringType)
                        ? nameof(SheshaFluentMigratorExtensions.WithTenantIdAsNullable)
                    : null;

                if (!string.IsNullOrWhiteSpace(helper))
                {
                    properties.Remove(tenantProp);

                    // apply helper
                    sb.AppendLine();
                    sb.Append($@"                .{helper}({objectNamesExpression})");
                }
            }

            var propertiesCopy = properties.ToList();
            foreach (var property in propertiesCopy) 
            {
                var propUnderlyingType = property.PropertyType.GetUnderlyingTypeIfNullable();
                var isNullable = property.IsNullable();

                if (propUnderlyingType == typeof(FormIdentifier))
                {
                    properties.Remove(property);

                    var prefix = MappingHelper.GetColumnPrefix(property.DeclaringType.NotNull());
                    var moduleColumn = MappingHelper.GetNameForMember(property, prefix, property.Name, nameof(FormIdentifier.Module));
                    var nameColumn = MappingHelper.GetNameForMember(property, prefix, property.Name, nameof(FormIdentifier.Name));

                    // apply helper
                    sb.AppendLine();
                    sb.Append($@"                .WithColumn(""{moduleColumn}"").AsString(200).Nullable()");
                    sb.AppendLine();
                    sb.Append($@"                .WithColumn(""{nameColumn}"").AsString(200).Nullable()");
                }

                if (propUnderlyingType == typeof(GenericEntityReference)) 
                {
                    properties.Remove(property);

                    var prefix = MappingHelper.GetColumnPrefix(property.DeclaringType.NotNull());

                    var attr = property.GetCustomAttribute<EntityReferenceAttribute>();
                    var idn = attr?.IdColumnName ?? MappingHelper.GetNameForMember(property, prefix, property.Name, "Id");
                    var cnn = attr?.ClassNameColumnName ?? MappingHelper.GetNameForMember(property, prefix, property.Name, "ClassName");
                    var dnn = attr?.DisplayNameColumnName ?? MappingHelper.GetNameForMember(property, prefix, property.Name, "DisplayName");

                    var nullableClause = property.IsNullable() ? "Nullable()" : "NotNullable()";

                    // apply helper
                    sb.AppendLine();
                    sb.Append($@"                .WithColumn(""{idn}"").AsString(100).{nullableClause}");
                    sb.AppendLine();
                    sb.Append($@"                .WithColumn(""{cnn}"").AsString(1000).{nullableClause}");

                    if (attr != null && attr.StoreDisplayName && !string.IsNullOrWhiteSpace(dnn))
                    {
                        sb.AppendLine();
                        sb.Append($@"                .WithColumn(""{dnn}"").AsString(1000).Nullable()"); // display name is always nullable
                    }                    
                }
            }

            return properties;
        }
    }
}
 