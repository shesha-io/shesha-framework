using Abp.Collections.Extensions;
using Abp.Domain.Entities;
using Abp.Domain.Uow;
using AutoMapper.Internal;
using Castle.Core.Internal;
using NetTopologySuite.Geometries;
using NHibernate;
using NHibernate.Cfg.MappingSchema;
using NHibernate.Mapping.ByCode;
using NHibernate.Mapping.ByCode.Conformist;
using NHibernate.Type;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.EntityReferences;
using Shesha.Extensions;
using Shesha.Generators;
using Shesha.NHibernate.Attributes;
using Shesha.NHibernate.Filters;
using Shesha.NHibernate.Generators;
using Shesha.NHibernate.UserTypes;
using Shesha.Reflection;
using Shesha.Services;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Reflection;
using ByCode = NHibernate.Mapping.ByCode;
using NHcfg = NHibernate.Cfg;
using NHGens = NHibernate.Mapping.ByCode.Generators;
using NMIMPL = NHibernate.Mapping.ByCode.Impl;

namespace Shesha.NHibernate.Maps
{
    /// <summary>
    /// Applies global common conventions to the mapped entities. 
    /// For clarity configurations set here can be overriden in 
    /// an entity's specific mapping file.  For example; The Id 
    /// convention here is set to Id but if the Id column 
    /// was mapped in the entity's mapping file then the entity's 
    /// mapping file configuration will take precedence.
    /// </summary>
    public class Conventions
    {
        private LazyRelation? _defaultLazyRelation;
        private readonly INameGenerator _nameGenerator;

        public Conventions(INameGenerator nameGenerator, Func<Type, Action<IIdMapper>?>? idMapper = null)
        {
            _nameGenerator = nameGenerator;
            _entitiesToMap = new List<Type>();

            var lazyRelation = Enum.TryParse(ConfigurationManager.AppSettings["NhConventions:DefaultLazyRelation"],
                out HbmLaziness parsed)
                ? parsed
                : (HbmLaziness?)null;

            _defaultLazyRelation = lazyRelation.HasValue
                ? lazyRelation == HbmLaziness.NoProxy
                    ? LazyRelation.NoProxy
                    : lazyRelation == HbmLaziness.Proxy
                        ? LazyRelation.Proxy
                        : LazyRelation.NoLazy
                : null;

            _idMapper = idMapper ?? (t =>
            {
                if (t == typeof(Int64) || t == typeof(int))
                {
                    return (id =>
                    {
                        id.Generator(NHGens.HighLow, g => g.Params(
                            new
                            {
                                table = "\"frwk\".\"hi_lo_sequences\"", // Important: NH doesn't apply Naming Strategy specified in the configuration, we have to quote names manually here
                                column = "next_value".DoubleQuote(),
                                sequence = "FrameworkSequence",
                                max_lo = "100"
                            }));
                    });
                }
                else if (t == typeof(Guid))
                {
                    return (id =>
                    {
                        id.Generator(new GuidAssignedGeneratorDef());
                    });
                }

                return null;
            });

            _defaultMapper = new ModelMapperWithNamingConventions();
        }

        private readonly Func<Type, Action<IIdMapper>?> _idMapper;
        private readonly List<Assembly> _assemblies = new List<Assembly>();

        public bool AssemblyAdded(Assembly assembly)
        {
            return _assemblies.Contains(assembly);
        }

        public void AddAssembly(Assembly assembly, string? databasePrefix = null)
        {
            _assemblies.Add(assembly);
            MappingHelper.AddDatabasePrefixForAssembly(assembly, databasePrefix ?? string.Empty);
        }

        private ModelMapperWithNamingConventions _defaultMapper;
        private List<Type> _entitiesToMap;

        public void Compile(NHcfg.Configuration configuration)
        {
            var mapper = new ModelMapperWithNamingConventions();

            mapper.IsEntity((type, declared) => MappingHelper.IsEntity(type));
            mapper.IsRootEntity((type, declared) => MappingHelper.IsRootEntity(type));
            mapper.IsTablePerClass((type, declared) =>
            {
                var discriminator = MappingHelper.GetDiscriminatorColumn(type);
                return string.IsNullOrWhiteSpace(discriminator);
            });
            mapper.IsTablePerClassHierarchy((type, declared) =>
            {
                var discriminator = MappingHelper.GetDiscriminatorColumn(type);
                return !string.IsNullOrWhiteSpace(discriminator);
            });
            mapper.IsTablePerConcreteClass((type, declared) => false);

            mapper.IsOneToOne((mi, declared) =>
            {
                return Attribute.IsDefined(mi, (typeof(OneToOneAttribute))) || declared || _defaultMapper.ModelInspector.IsOneToOne(mi);
            });
            mapper.IsOneToMany((mi, declared) =>
            {
                if (Attribute.IsDefined(mi, (typeof(ManyToManyAttribute))) ||
                    Attribute.IsDefined(mi, (typeof(OneToOneAttribute)))
                    )
                {
                    return false;
                }

                return declared || _defaultMapper.ModelInspector.IsOneToMany(mi);
            });

            mapper.IsManyToMany((mi, declared) =>
            {
                if (Attribute.IsDefined(mi, (typeof(ManyToManyAttribute))))
                {
                    return true;
                }

                return declared || _defaultMapper.ModelInspector.IsManyToAny(mi);
            });

            mapper.IsComponent((mi, declared) =>
            {
                if (mi == typeof(GenericEntityReference) || mi.IsAssignableTo(typeof(ConfigurationItemIdentifier)))
                {
                    return true;
                }

                if (mi == typeof(Geometry) || mi.IsJsonEntityType() || Attribute.IsDefined(mi, (typeof(SaveAsJsonAttribute))))
                {
                    return false;
                }

                return declared || _defaultMapper.ModelInspector.IsComponent(mi);
            });

            mapper.IsProperty((mi, declared) =>
            {
                if (mi.GetMemberType() == typeof(GenericEntityReference) || mi.GetMemberType().IsAssignableTo(typeof(ConfigurationItemIdentifier)))
                {
                    return true;
                }
                if (mi.GetMemberType().IsJsonEntityType() || Attribute.IsDefined(mi, (typeof(SaveAsJsonAttribute))))
                {
                    return true;
                }

                return declared || _defaultMapper.ModelInspector.IsProperty(mi);
            });

            mapper.IsPersistentProperty((mi, declared) =>
            {
                if (!NhMappingHelper.IsPersistentProperty(mi))
                    return false;

                return _defaultMapper.ModelInspector.IsPersistentProperty(mi);
            });

            mapper.BeforeMapSubclass += (modelInspector, type, subclassCustomizer) =>
            {
                var discriminatorValue = MappingHelper.GetDiscriminatorValue(type);

                subclassCustomizer.DiscriminatorValue(discriminatorValue);


                var joinPropAttribute = type.GetAttribute<JoinedPropertyAttribute>();
                if (joinPropAttribute != null)
                {
                    if (string.IsNullOrWhiteSpace(joinPropAttribute.TableName))
                        throw new Exception($"{nameof(JoinedPropertyAttribute.TableName)} is mandatory for `{joinPropAttribute.GetType().Name}`, check class `{type.FullName}`");

                    if (subclassCustomizer is NMIMPL.SubclassMapper subclassMapper)
                    {
                        // add join with provided table name, all properties will be added using current conventions and placed to the corresponding group using SplitGroupId = TableName
                        subclassMapper.Join(joinPropAttribute.TableName, j =>
                        {
                            j. Table(joinPropAttribute.TableName);
                            if (!string.IsNullOrWhiteSpace(joinPropAttribute.Schema))
                                j.Schema(joinPropAttribute.Schema);

                            j.Fetch(FetchKind.Join);

                            var idProp = type.GetRequiredProperty("Id");
                            var idColumn = MappingHelper.GetColumnName(idProp);

                            j.Key(k =>
                            {
                                k.Column(idColumn);
                            });
                        });
                    }
                }
            };

            mapper.SplitsFor((type, definedSplits) =>
            {
                var splits = definedSplits.ToList();

                var joinPropAttribute = type.GetAttribute<JoinedPropertyAttribute>();
                if (joinPropAttribute != null && !splits.Contains(joinPropAttribute.TableName))
                    splits.Add(joinPropAttribute.TableName);

                return splits;
            });

            mapper.IsTablePerClassSplit((definition, b) => true);

            mapper.BeforeMapElement += (modelInspector, member, collectionRelationElementCustomizer) =>
            {

            };

            mapper.BeforeMapComponent += (modelInspector, member, propertyCustomizer) =>
            {

            };

            mapper.BeforeMapProperty += (modelInspector, member, propertyCustomizer) =>
            {
                var propertyType = ByCode.TypeExtensions.GetPropertyOrFieldType(member.LocalMember);

                var lazyAttribute = member.LocalMember.GetAttributeOrNull<NhLazyLoadAttribute>(true);
                if (lazyAttribute != null)
                    propertyCustomizer.Lazy(true);

                var columnName = member.LocalMember.GetCustomAttribute<ColumnAttribute>()?.Name ?? MappingHelper.GetColumnName(member.LocalMember);

                if (member.LocalMember.DeclaringType == typeof(GenericEntityReference) ||
                    member.LocalMember.GetMemberType() == typeof(GenericEntityReference))
                {
                    var attr = member.LocalMember.GetCustomAttribute<EntityReferenceAttribute>();

                    var prefix = MappingHelper.GetColumnPrefix(member.LocalMember.DeclaringType.NotNull());

                    var idn = attr?.IdColumnName ?? MappingHelper.GetNameForMember(member.LocalMember, prefix, member.LocalMember.Name, "Id");
                    var cnn = attr?.ClassNameColumnName ?? MappingHelper.GetNameForMember(member.LocalMember, prefix, member.LocalMember.Name, "ClassName");
                    var dnn = attr?.DisplayNameColumnName ?? MappingHelper.GetNameForMember(member.LocalMember, prefix, member.LocalMember.Name, "DisplayName");

                    if (attr?.StoreDisplayName ?? false)
                    {
                        propertyCustomizer.Columns(
                            c => { c.Name(idn); c.SqlType("nvarchar(100)"); },
                            c => { c.Name(cnn); c.SqlType("nvarchar(1000)"); },
                            c => { c.Name(dnn); c.SqlType("nvarchar(1000)"); }
                            );
                        var gtype = typeof(EntityReferenceWithDisplayUserType);
                        propertyCustomizer.Type(gtype, null);
                    }
                    else
                    {
                        propertyCustomizer.Columns(
                            c => { c.Name(idn); c.SqlType("nvarchar(100)"); },
                            c => { c.Name(cnn); c.SqlType("nvarchar(1000)"); }
                            );
                        var gtype = typeof(EntityReferenceUserType);
                        propertyCustomizer.Type(gtype, null);
                    }
                    return;
                }

                if (propertyType.IsAssignableTo(typeof(ConfigurationItemIdentifier)))
                {
                    if (!propertyType.IsAssignableTo(typeof(IIdentifierFactory)))
                        throw new Exception($"Type '{propertyType.Name}' must implement '{nameof(IIdentifierFactory)}'");

                    var prefix = MappingHelper.GetColumnPrefix(member.LocalMember.DeclaringType.NotNull());
                    var moduleColumn = MappingHelper.GetNameForMember(member.LocalMember, prefix, member.LocalMember.Name, nameof(ConfigurationItemIdentifier.Module));
                    var nameColumn = MappingHelper.GetNameForMember(member.LocalMember, prefix, member.LocalMember.Name, nameof(ConfigurationItemIdentifier.Name));

                    propertyCustomizer.Columns(
                            c => { c.Name(moduleColumn); },
                            c => { c.Name(nameColumn); }
                        );
                    var gtype = typeof(ConfigurationItemIdentifierUserType<>).MakeGenericType(propertyType);
                    propertyCustomizer.Type(gtype, null);
                    return;
                }

                string? sqlType = null;
                IType? columnType = null;

                if (propertyType == typeof(DateTime) || propertyType == typeof(DateTime?))
                {
                    columnType = NHibernateUtil.DateTime;
                    sqlType = "DateTime";
                }
                else
                    if (member.LocalMember.GetAttribute<StringLengthAttribute>()?.MaximumLength == int.MaxValue)
                {
                    columnType = NHibernateUtil.StringClob;
                    sqlType = "nvarchar(max)";
                }

                if (propertyType == typeof(Geometry))
                {
                    propertyCustomizer.Type<global::NHibernate.Spatial.Type.GeometryType>();
                }

                if (member.LocalMember.GetMemberType().IsJsonEntityType() || member.LocalMember.HasAttribute<SaveAsJsonAttribute>())
                {
                    sqlType = "nvarchar(max)";
                    var gtype = typeof(JsonUserType<>).MakeGenericType(member.LocalMember.GetMemberType());
                    propertyCustomizer.Type(gtype, null);
                }

                if (columnType != null)
                    propertyCustomizer.Type(columnType);

                if (Attribute.GetCustomAttribute(member.LocalMember, typeof(ReadonlyPropertyAttribute), true) is ReadonlyPropertyAttribute readonlyAttribute)
                {
                    propertyCustomizer.Insert(readonlyAttribute.Insert);
                    propertyCustomizer.Update(readonlyAttribute.Update);
                }

                propertyCustomizer.Column(c =>
                {
                    c.Name(columnName);
                    if (!string.IsNullOrWhiteSpace(sqlType))
                        c.SqlType(sqlType);
                });
            };


            var isCustomMapperRegistered = StaticContext.IocManager.IsRegistered<ICustomMapper>();
            if (isCustomMapperRegistered)
            {
                var customMapper = StaticContext.IocManager.Resolve<ICustomMapper>();
                mapper.BeforeMapProperty += customMapper.BeforeMapProperty;
            }

            //mapper.BeforeMapIdBag

            mapper.IsPersistentId((mi, d) =>
            {
                var isId = mi.Name.Equals("Id", StringComparison.InvariantCultureIgnoreCase);
                return isId;
            });

            mapper.BeforeMapClass += (modelInspector, type, classCustomizer) =>
            {
                var tableName = MappingHelper.GetTableName(type);
                classCustomizer.Table(tableName);


                var schemaName = MappingHelper.GetSchemaName(type);
                if (!string.IsNullOrWhiteSpace(schemaName))
                    classCustomizer.Schema(schemaName);

                var imMutable = type.HasAttribute<ImMutableAttribute>(true);
                if (imMutable)
                    classCustomizer.Mutable(false);

                if (MappingHelper.IsEntity(type))
                {
                    try
                    {
                        var idProp = type.GetProperty("Id");
                        if (idProp != null)
                        // note: Id may be missing when entity has hand-written mapping but isn't derived from EntityWithTypedId<> (for example: NhIdentityUserLogin)
                        {
                            if (tableName.StartsWith("Abp") && (idProp.PropertyType == typeof(Int64) || idProp.PropertyType == typeof(int)))
                            {
                                // temporary map `Abp` tables without hilo
                                classCustomizer.Id(p =>
                                {
                                    p.Column("Id");
                                    p.Generator(NHGens.Identity);
                                });
                            }
                            else
                            {
                                var idColumn = MappingHelper.GetIdColumnName(idProp);

                                // get Id mapper
                                var idMapper = imMutable
                                    ? null
                                    : _idMapper.Invoke(idProp.PropertyType);
                                classCustomizer.Id(p =>
                                {
                                    idMapper?.Invoke(p);
                                    p.Column(idColumn);
                                });
                            }
                        }
                        else
                        {
                        }
                    }
                    catch (Exception)
                    {
                        throw;
                    }
                }

                var discriminatorColumn = MappingHelper.GetDiscriminatorColumn(type);
                if (!string.IsNullOrWhiteSpace(discriminatorColumn))
                {
                    classCustomizer.Discriminator(d =>
                    {
                        d.Column(discriminatorColumn);

                        if (MappingHelper.GetFilterUnknownDiscriminatorsFlag(type))
                            d.Force(true);
                    });

                    var discriminatorValue = MappingHelper.GetDiscriminatorValue(type);

                    classCustomizer.DiscriminatorValue(discriminatorValue);
                }

                // IMayHaveTenant support
                if (typeof(IMustHaveTenant).IsAssignableFrom(type))
                {
                    var tenantIdProp = type.GetRequiredProperty(nameof(IMustHaveTenant.TenantId));
                    var tenantIdColumnName = MappingHelper.GetColumnName(tenantIdProp);
                    classCustomizer.Filter(AbpDataFilters.MustHaveTenant, m =>
                    {
                        if (tenantIdColumnName != tenantIdProp.Name)
                            m.Condition(MustHaveTenantFilter.GetCondition(tenantIdColumnName));
                    });
                }

                // IMayHaveTenant support
                if (typeof(IMayHaveTenant).IsAssignableFrom(type))
                {
                    var tenantIdProp = type.GetRequiredProperty(nameof(IMayHaveTenant.TenantId));
                    var tenantIdColumnName = MappingHelper.GetColumnName(tenantIdProp);
                    classCustomizer.Filter(AbpDataFilters.MayHaveTenant, m =>
                    {
                        if (tenantIdColumnName != tenantIdProp.Name)
                            m.Condition(MayHaveTenantFilter.GetCondition(tenantIdColumnName));
                    });
                }

                // ISoftDelete support
                if (typeof(ISoftDelete).IsAssignableFrom(type))
                {
                    var isDeletedProp = type.GetRequiredProperty(nameof(ISoftDelete.IsDeleted));
                    var isDeletedColumnName = MappingHelper.GetColumnName(isDeletedProp);

                    classCustomizer.Filter(AbpDataFilters.SoftDelete, m =>
                    {
                        if (isDeletedColumnName != isDeletedProp.Name)
                            m.Condition(SoftDeleteFilter.GetCondition(isDeletedColumnName));
                    });
                }
            };

            mapper.BeforeMapOneToOne += (modelInspector, member, map) =>
            {
                map.Cascade(ByCode.Cascade.All);
                map.Constrained(true);
                map.Fetch(FetchKind.Join);
                map.ForeignKey("none");
            };

            mapper.BeforeMapManyToOne += (modelInspector, propertyPath, map) =>
            {
                string columnPrefix = MappingHelper.GetColumnPrefix(propertyPath.LocalMember.DeclaringType.NotNull());

                var lazyAttribute = propertyPath.LocalMember.GetAttributeOrNull<LazyLoadAttribute>(true);
                var lazyRelation = lazyAttribute != null
                    ? lazyAttribute is NhLazyLoadAttribute nhLazy
                        ? nhLazy.GetLazyRelation()
                        : LazyRelation.NoProxy
                    : _defaultLazyRelation;
                if (lazyRelation != null)
                    map.Lazy(lazyRelation);

                //map.NotFound(NotFoundMode.Ignore); disabled due to performance issues, this option breaks lazy loading

                var foreignKeyColumn = propertyPath.LocalMember.GetCustomAttribute<ColumnAttribute>()?.Name 
                    ?? MappingHelper.GetForeignKeyColumn(propertyPath.LocalMember);
                map.Column(foreignKeyColumn);

               var readonlyAttribute = propertyPath.LocalMember.GetAttributeOrNull<ReadonlyPropertyAttribute>();
               if (readonlyAttribute != null)
               {
                   map.Insert(readonlyAttribute.Insert);
                   map.Update(readonlyAttribute.Update);
               }
               else 
               {
                   var directlyMappedFk = propertyPath.LocalMember.ReflectedType != null
                       ? propertyPath.LocalMember.ReflectedType.GetProperties().FirstOrDefault(p => p != propertyPath.LocalMember && modelInspector.IsPersistentProperty(p) && MappingHelper.GetColumnName(p) == foreignKeyColumn)
                       : null;
                   if (foreignKeyColumn.ToLower() == "id" || directlyMappedFk != null)
                   {
                       map.Insert(false);
                       map.Update(false);
                   }
               }

               var cascadeAttribute = propertyPath.LocalMember.GetAttributeOrNull<CascadeAttribute>(true);
               map.Cascade(cascadeAttribute?.Cascade ?? ByCode.Cascade.Persist);
               map.Class(ByCode.TypeExtensions.GetPropertyOrFieldType(propertyPath.LocalMember));
           };

            mapper.BeforeMapBag += (modelInspector, propertyPath, map) =>
            {
                var containerEntity = propertyPath.GetContainerEntity(modelInspector);
                var inversePropertyAttribute = propertyPath.LocalMember.GetAttributeOrNull<InversePropertyAttribute>(true);
                if (inversePropertyAttribute != null)
                    map.Key(keyMapper => keyMapper.Column(inversePropertyAttribute.Property));
                else
                {
                    var manyToOneAttribute = propertyPath.LocalMember.GetAttributeOrNull<DynamicManyToOneAttribute>(true);
                    if (manyToOneAttribute != null)
                    {
                        var propType = (propertyPath.LocalMember as PropertyInfo)?.PropertyType;
                        var foreignClass = (propType?.IsGenericType ?? false) ? propType.GenericTypeArguments[0] : null;
                        var referenceProperty = foreignClass?.GetProperties().FirstOrDefault(x => x.Name.ToCamelCase() == manyToOneAttribute.PropertyName.ToCamelCase());
                        if (referenceProperty != null)
                            map.Key(keyMapper => keyMapper.Column(MappingHelper.GetColumnName(referenceProperty)));
                        else
                            map.Key(keyMapper => keyMapper.Column(manyToOneAttribute.PropertyName));
                    } else
                        map.Key(keyMapper => keyMapper.Column(containerEntity.Name + "Id"));
                }

                map.Cascade(ByCode.Cascade.All);
                map.Lazy(CollectionLazy.Lazy);

                var bagMapper = map as NMIMPL.BagMapper;

                var manyToManyAttribute = propertyPath.LocalMember.GetAttributeOrNull<ManyToManyAttribute>(true);

                if (manyToManyAttribute != null)
                {
                    if (!manyToManyAttribute.AutoGeneration)
                    {
                        map.Cascade(ByCode.Cascade.None);

                        if (!string.IsNullOrEmpty(manyToManyAttribute.Table))
                            map.Table(manyToManyAttribute.Table);

                        if (!string.IsNullOrEmpty(manyToManyAttribute.KeyColumn))
                            map.Key(keyMapper => keyMapper.Column(manyToManyAttribute.KeyColumn));
                        if (!string.IsNullOrEmpty(manyToManyAttribute.Where))
                            map.Where(manyToManyAttribute.Where);
                        if (!string.IsNullOrEmpty(manyToManyAttribute.OrderBy))
                            map.OrderBy(manyToManyAttribute.OrderBy);
                    }
                    else
                    {
                        map.Cascade(ByCode.Cascade.None);

                        var (tableName, parentTableName, childTableName, parentColumnName, childColumnName) =
                            _nameGenerator.GetAutoManyToManyTableNames(propertyPath.LocalMember);
                        map.Schema(_nameGenerator.AutoGeneratorDbSchema);
                        tableName = manyToManyAttribute.Table.IsNullOrEmpty() ? tableName : manyToManyAttribute.Table;
                        map.Table(tableName);
                        parentColumnName = manyToManyAttribute.KeyColumn.IsNullOrEmpty() ? parentColumnName : manyToManyAttribute.KeyColumn;
                        map.Key(keyMapper => keyMapper.Column(parentColumnName));

                        if (!string.IsNullOrEmpty(manyToManyAttribute.Where))
                            map.Where(manyToManyAttribute.Where);
                        if (!string.IsNullOrEmpty(manyToManyAttribute.OrderBy))
                            map.OrderBy(manyToManyAttribute.OrderBy);
                    }
                }
                else if (bagMapper != null && typeof(ISoftDelete).IsAssignableFrom(bagMapper.ElementType))
                {
                    var isDeletedProp = bagMapper.ElementType.GetRequiredProperty(nameof(ISoftDelete.IsDeleted));
                    var isDeletedColumnName = MappingHelper.GetColumnName(isDeletedProp);
                    map.Filter("SoftDelete", m =>
                    {
                        if (isDeletedColumnName != isDeletedProp.Name)
                            m.Condition(SoftDeleteFilter.GetCondition(isDeletedColumnName));
                    });
                }
            };

            mapper.BeforeMapManyToMany += (modelInspector, propertyPath, map) =>
            {
                //map.NotFound(NotFoundMode.Ignore); disabled due to performance issues, this option breaks lazy loading

                var manyToManyAttribute = propertyPath.LocalMember.GetAttributeOrNull<ManyToManyAttribute>(true);
                if (manyToManyAttribute != null)
                {
                    if (!string.IsNullOrEmpty(manyToManyAttribute.ChildColumn))
                        map.Column(manyToManyAttribute.ChildColumn);
                    else if (manyToManyAttribute.AutoGeneration)
                    {
                        var (_, _, _, _, childColumnName) =
                            _nameGenerator.GetAutoManyToManyTableNames(propertyPath.LocalMember);
                        map.Column(childColumnName);
                    }
                }
                map.Lazy(LazyRelation.NoProxy);
            };

            foreach (var assembly in _assemblies)
            {
                var allTypes = !assembly.IsDynamic
                    ? assembly.GetExportedTypes()
                    : assembly.GetTypes();
                var allEntities = allTypes.Where(t => MappingHelper.IsEntity(t)).ToList();
                foreach (var entityType in allEntities)
                {
                    var classMapping = configuration.GetClassMapping(entityType);
                    if (classMapping == null)
                    {
                        _entitiesToMap.Add(entityType);
                    }
                }

                var mappingOverride = allTypes.Where(t => IsClassMapping(t) && !t.IsAbstract).ToList();
                foreach (var @override in mappingOverride)
                {
                    try
                    {
                        var entityType = GetEntityTypeByMapping(@override);

                        if (entityType.IsEntityType())
                        {
                            _defaultMapper.AddMapping(@override);
                            mapper.AddMapping(@override);

                            if (entityType != null && !entityType.IsAbstract && !_entitiesToMap.Contains(entityType))
                                _entitiesToMap.Add(entityType);
                        }
                    }
                    catch (Exception)
                    {
                        throw;
                    }
                }
            }

            // sort entity types by hierarchy
            _entitiesToMap = MappingHelper.SortEntityTypesByInheritance(_entitiesToMap);

            HbmMapping mapping = mapper.CompileMappingFor(_entitiesToMap);

            mapping.autoimport = false;

            configuration.AddDeserializedMapping(mapping, "AutoMapping");

            LastCompiledXml = mapping.AsString();
        }

        public void SaveXml(string filename)
        {
            using var wr = new StreamWriter(filename);
            wr.Write(LastCompiledXml);
        }

        /// <summary>
        /// Last compiled conventions in the xml format
        /// </summary>
        public static string? LastCompiledXml { get; set; }

        private static Type? GetEntityTypeByMapping(Type mappingType)
        {
            var genericMapping = mappingType.BaseType;
            return genericMapping != null && genericMapping.GenericTypeArguments.Any()
                ? genericMapping.GenericTypeArguments[0]
                : null;
        }

        public static bool IsClassMapping(Type type)
        {
            var interfaceTypes = type.GetInterfaces();

            foreach (var it in interfaceTypes)
                if (it.IsGenericType)
                    if (it.GetGenericTypeDefinition() == typeof(ClassMapping<>) || it.GetGenericTypeDefinition() == typeof(SubclassMapping<>) || it.GetGenericTypeDefinition() == typeof(JoinedSubclassMapping<>))
                        return true;

            var baseType = type.BaseType;
            if (baseType == null) return false;

            return baseType.IsGenericType &&
                (baseType.GetGenericTypeDefinition() == typeof(ClassMapping<>) ||
                baseType.GetGenericTypeDefinition() == typeof(SubclassMapping<>) ||
                baseType.GetGenericTypeDefinition() == typeof(JoinedSubclassMapping<>)) ||
                IsClassMapping(baseType);
        }
    }
}