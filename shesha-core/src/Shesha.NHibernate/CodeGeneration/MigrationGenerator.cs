using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Reflection;
using System.Text;
using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using FluentMigrator.Builders;
using FluentMigrator.Builders.Alter.Table;
using FluentMigrator.Builders.Create.Table;
using FluentMigrator.Infrastructure;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.Extensions;
using Shesha.FluentMigrator;
using Shesha.Migrations;
using Shesha.NHibernate.Maps;
using Shesha.Reflection;

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
                        prop => !prop.PropertyType.IsEntityType());
                    if (!string.IsNullOrWhiteSpace(migration))
                        sb.AppendLine(migration);
                }
                catch (Exception e)
                {

                }
            }
            
            // step 2: handle foreign keys
            foreach (var entityType in types)
            {
                var migration = GenerateTableMigration(entityType, DdlStatement.Alter, prop => prop.PropertyType.IsEntityType());
                if (!string.IsNullOrWhiteSpace(migration))
                    sb.AppendLine(migration);
            }

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
                        AddColumns(sb, props, ddlStatement);
                        var discriminatorColumn = MappingHelper.GetDiscriminatorColumn(entityType);
                        if (!string.IsNullOrWhiteSpace(discriminatorColumn))
                        {
                            sb.AppendLine();
                            sb.Append($@"                .{nameof(SheshaFluentMigratorExtensions.WithDiscriminator)}()");
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
                        AddColumns(sb, props, ddlStatement);
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
                            (!typeof(System.Collections.IEnumerable)
                                 .IsAssignableFrom(p.PropertyType) /*skip enumerables except strings*/ ||
                             p.PropertyType == typeof(string)))
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

        private static void AddColumns(StringBuilder sb, List<PropertyInfo> properties, DdlStatement statement)
        {
            var allProps = properties.ToList(); // make a copy of the list to prevent mutations

            var idProp = properties.FirstOrDefault(p => p.Name == "Id");
            if (idProp != null)
            {
                if (statement == DdlStatement.Create)
                {
                    sb.AppendLine();
                    if (idProp.PropertyType == typeof(Guid))
                        sb.Append($@"                .{nameof(SheshaFluentMigratorExtensions.WithIdAsGuid)}()");
                    else
                    if (idProp.PropertyType == typeof(int))
                        sb.Append($@"                .{nameof(SheshaFluentMigratorExtensions.WithIdAsInt32)}()");
                    else
                    if (idProp.PropertyType == typeof(Int64))
                        sb.Append($@"                .{nameof(SheshaFluentMigratorExtensions.WithIdAsInt64)}()");
                    else
                        throw new NotSupportedException($"Id of type {idProp.PropertyType.FullName} is not supported");

                    allProps.Remove(idProp);
                }
            }
            
            var customProps = ProcessFrameworkColumns(sb, allProps, statement)
                .OrderBy(p => p.Name)
                .ToList();
            
            foreach (var property in customProps)
            {
                sb.AppendLine();
                if (property.PropertyType.IsEntityType())
                {
                    var fkTable = MappingHelper.GetTableName(property.PropertyType);
                    var fkColumn = MappingHelper.GetForeignKeyColumn(property);

                    var method = statement == DdlStatement.Create
                        ? nameof(SheshaFluentMigratorExtensions.WithForeignKeyColumn)
                        : nameof(SheshaFluentMigratorExtensions.AddForeignKeyColumn);

                    sb.Append($@"                .{method}(""{fkColumn}"", ""{fkTable}"")");
                } else 
                {
                    var method = statement == DdlStatement.Create
                        ? nameof(ICreateTableWithColumnSyntax.WithColumn)
                        : nameof(IAlterTableAddColumnOrAlterColumnSyntax.AddColumn);

                    var columnName = MappingHelper.GetColumnName(property);

                    sb.Append($@"                .{method}(""{columnName}"")");

                    if (property.PropertyType == typeof(string))
                    {
                        var maxLength = property.GetAttribute<StringLengthAttribute>()?.MaximumLength;
                        sb.Append(maxLength != null && maxLength < int.MaxValue
                            ? $@".{nameof(IColumnTypeSyntax<IFluentSyntax>.AsString)}({maxLength})"
                            : $@".{nameof(SheshaFluentMigratorExtensions.AsStringMax)}()");
                    }
                    else if (property.PropertyType == typeof(int) || property.PropertyType == typeof(int?))
                    {
                        sb.Append($@".{nameof(IColumnTypeSyntax<IFluentSyntax>.AsInt32)}()");
                    }
                    else if (property.PropertyType == typeof(Int64) || property.PropertyType == typeof(Int64?) || property.PropertyType.IsEnumType())
                    {
                        sb.Append($@".{nameof(IColumnTypeSyntax<IFluentSyntax>.AsInt64)}()");
                    }
                    else if (property.PropertyType == typeof(decimal) || property.PropertyType == typeof(decimal?))
                    {
                        var precisionAttribute = property.GetAttribute<PrecisionAndScaleAttribute>();
                        if (precisionAttribute != null)
                            sb.Append($@".{nameof(IColumnTypeSyntax<IFluentSyntax>.AsDecimal)}({precisionAttribute.Precision}, {precisionAttribute.Scale})");
                        else
                            sb.Append($@".{nameof(IColumnTypeSyntax<IFluentSyntax>.AsDecimal)}()");
                    }
                    else if (property.PropertyType == typeof(float) || property.PropertyType == typeof(float?))
                    {
                        sb.Append($@".{nameof(IColumnTypeSyntax<IFluentSyntax>.AsFloat)}()");
                    }
                    else if (property.PropertyType == typeof(double) || property.PropertyType == typeof(double?))
                    {
                        sb.Append($@".{nameof(IColumnTypeSyntax<IFluentSyntax>.AsDouble)}()");
                    }
                    else if (property.PropertyType == typeof(bool) || property.PropertyType == typeof(bool?))
                    {
                        sb.Append($@".{nameof(IColumnTypeSyntax<IFluentSyntax>.AsBoolean)}()");
                    }
                    else if (property.PropertyType == typeof(DateTime) || property.PropertyType == typeof(DateTime?))
                    {
                        sb.Append($@".{nameof(IColumnTypeSyntax<IFluentSyntax>.AsDateTime)}()");
                    }
                    else if (property.PropertyType == typeof(Guid) || property.PropertyType == typeof(Guid?))
                    {
                        sb.Append($@".{nameof(IColumnTypeSyntax<IFluentSyntax>.AsGuid)}()");
                    }
                    else if (property.PropertyType == typeof(TimeSpan) || property.PropertyType == typeof(TimeSpan?))
                    {
                        sb.Append($@".{nameof(IColumnTypeSyntax<IFluentSyntax>.AsInt64)}()");
                    }
                    else
                        throw new NotSupportedException($"unsupported property type: '{property.PropertyType.FullName}'");

                    if (property.PropertyType.IsNullableType() 
                        || property.PropertyType == typeof(string)
                        || property.DeclaringType?.BaseType != null && property.DeclaringType.BaseType.IsEntityType() /*property declared in the subclass*/)
                        sb.Append($@".{nameof(IColumnOptionSyntax<IFluentSyntax, IFluentSyntax>.Nullable)}()");
                }
            }
        }

        /// <summary>
        /// Process framework helpers and return list of unprocessed properties
        /// </summary>
        /// <param name="sb"></param>
        /// <param name="properties"></param>
        /// <param name="statement"></param>
        /// <returns></returns>
        private static List<PropertyInfo> ProcessFrameworkColumns(StringBuilder sb, List<PropertyInfo> properties, DdlStatement statement)
        {
            var helpers = new Dictionary<string, List<string>>()
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

            foreach (var helper in helpers)
            {
                if (helper.Value.All(propName => properties.Any(p => p.Name == propName)))
                {
                    // apply helper
                    sb.AppendLine();
                    sb.Append($@"                .{helper.Key}()");
                    
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
                    sb.Append($@"                .{helper}()");
                }
            }

            return properties;
        }
    }
}
