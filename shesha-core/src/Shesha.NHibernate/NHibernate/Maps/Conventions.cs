using Abp.Domain.Entities;
using AutoMapper.Internal;
using Castle.Core.Internal;
using NHibernate;
using NHibernate.Cfg.MappingSchema;
using NHibernate.Mapping.ByCode;
using NHibernate.Mapping.ByCode.Conformist;
using NHibernate.Mapping.ByCode.Impl.CustomizersImpl;
using NHibernate.Type;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.EntityReferences;
using Shesha.Extensions;
using Shesha.NHibernate.Attributes;
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
        private LazyRelation _defaultLazyRelation;

        public Conventions(Func<Type, Action<IIdMapper>> idMapper = null)
        {
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
                        id.Generator(NHGens.HighLow, g => g.Params(new { table = "Frwk_HiLoSequences", sequence = "FrameworkSequence", column = "NextValue", max_lo = "100" }));
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
            DefaultModelInspector = _defaultMapper.ModelInspector;
        }

        private readonly Func<Type, Action<IIdMapper>> _idMapper;
        private readonly List<Assembly> _assemblies = new List<Assembly>();

        public bool AssemblyAdded(Assembly assembly)
        {
            return _assemblies.Contains(assembly);
        }

        public void AddAssembly(Assembly assembly, string databasePrefix = "")
        {
            _assemblies.Add(assembly);
            MappingHelper.AddDatabasePrefixForAssembly(assembly, databasePrefix);
        }

        public static IModelInspector DefaultModelInspector { get; set; }
        private static ModelMapperWithNamingConventions _defaultMapper;
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
                    Attribute.IsDefined(mi, (typeof(OneToOneAttribute))))
                {
                    return false;
                }

                return declared || _defaultMapper.ModelInspector.IsOneToMany(mi);
            });

            mapper.IsComponent((mi, declared) =>
            {
                if (mi == typeof(GenericEntityReference))
                {
                    return true;
                }

                if (mi.IsJsonEntityType() || Attribute.IsDefined(mi, (typeof(SaveAsJsonAttribute))))
                {
                    return false;
                }

                return declared || _defaultMapper.ModelInspector.IsComponent(mi);
            });

            mapper.IsProperty((mi, declared) =>
            {
                if (mi.GetMemberType() == typeof(GenericEntityReference))
                {
                    return true;
                }
                if (mi.GetMemberType().IsJsonEntityType() || Attribute.IsDefined(mi, (typeof(SaveAsJsonAttribute))))
                {
                    return true;
                }

                return declared || _defaultMapper.ModelInspector.IsProperty(mi);
            });

            mapper.IsManyToMany((mi, declared) =>
            {
                if (Attribute.IsDefined(mi, (typeof(ManyToManyAttribute))))
                {
                    return true;
                }

                return declared || _defaultMapper.ModelInspector.IsManyToAny(mi);
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
                            j.Table(joinPropAttribute.TableName);

                            j.Fetch(FetchKind.Join);

                            j.Key(k =>
                            {
                                k.Column("Id");
                            });
                        });
                    }
                }
            };

            mapper.SplitsFor((type, definedSplits) =>
            {
                var splits = definedSplits.ToList();

                if (type.Name.Contains("TestProcessConfiguration"))
                {
                }

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
                if (member.LocalMember.Name.Equals("Id", StringComparison.InvariantCultureIgnoreCase)) 
                { 
                }
                var propertyType = member.LocalMember.GetPropertyOrFieldType();

                var lazyAttribute = member.LocalMember.GetAttribute<LazyAttribute>(true);
                if (lazyAttribute != null)
                    propertyCustomizer.Lazy(true);

                var columnName = MappingHelper.GetColumnName(member.LocalMember);
                string sqlType = null;
                IType columnType = null;

                if (member.LocalMember.DeclaringType == typeof(GenericEntityReference) ||
                    member.LocalMember.GetMemberType() == typeof(GenericEntityReference))
                {
                    var attr = member.LocalMember.GetCustomAttribute<EntityReferenceAttribute>();
                    var idn = attr?.IdColumnName ?? $"{member.LocalMember.Name}Id";
                    var cnn = attr?.ClassNameColumnName ?? $"{member.LocalMember.Name}ClassName";
                    var dnn = attr?.DisplayNameColumnName ?? $"{member.LocalMember.Name}DisplayName";
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

                if (propertyType == typeof(DateTime) || propertyType == typeof(DateTime?))
                {
                    columnType = NHibernateUtil.DateTime;
                    sqlType = "DateTime";
                }
                else
                    if (member.LocalMember.GetAttribute<StringLengthAttribute>()?.MaximumLength == int.MaxValue)
                //if (Attribute.IsDefined(member.LocalMember, (typeof(StringClobAttribute))))
                {
                    columnType = NHibernateUtil.StringClob;
                    sqlType = "nvarchar(max)";
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
                                var idColumn = idProp.GetAttribute<ColumnAttribute>()?.Name ?? "Id";

                                // get Id mapper
                                var idMapper = _idMapper.Invoke(idProp.PropertyType);
                                if (idMapper != null)
                                {
                                    classCustomizer.Id(p =>
                                    {
                                        idMapper.Invoke(p);
                                        p.Column(idColumn);
                                    });
                                }
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
                if (typeof(IMayHaveTenant).IsAssignableFrom(type))
                {
                    classCustomizer.Filter("MayHaveTenant", m =>
                    {
                    });
                }

                // ISoftDelete support
                if (typeof(ISoftDelete).IsAssignableFrom(type))
                {
                    classCustomizer.Filter("SoftDelete", m =>
                    {
                    });
                }
            };

            mapper.BeforeMapOneToOne += (modelInspector, member, map) =>
            {
                map.Cascade(Cascade.All);
                map.Constrained(true);
                map.Fetch(FetchKind.Join);
                map.ForeignKey("none");
            };

            mapper.BeforeMapManyToOne += (modelInspector, propertyPath, map) =>
           {
               string columnPrefix = MappingHelper.GetColumnPrefix(propertyPath.LocalMember.DeclaringType);

               var lazyAttribute = propertyPath.LocalMember.GetAttribute<LazyAttribute>(true);
               var lazyRelation = lazyAttribute != null ? lazyAttribute.GetLazyRelation() : _defaultLazyRelation;
               if (lazyRelation != null)
                   map.Lazy(lazyRelation);

               var foreignKeyAttribute = propertyPath.LocalMember.GetAttribute<ForeignKeyAttribute>(true);
               var foreignKeyColumn = foreignKeyAttribute != null
                   ? foreignKeyAttribute.Name
                   : columnPrefix + propertyPath.LocalMember.Name + "Id";

               //map.NotFound(NotFoundMode.Ignore); disabled due to performance issues, this option breaks lazy loading
               map.Column(foreignKeyColumn);

               var directlyMappedFk = propertyPath.LocalMember.DeclaringType?.GetProperty(foreignKeyColumn);

               if (foreignKeyColumn.ToLower() == "id" || directlyMappedFk != null)
               {
                   map.Insert(false);
                   map.Update(false);
               }

               var cascadeAttribute = propertyPath.LocalMember.GetAttribute<CascadeAttribute>(true);
               map.Cascade(cascadeAttribute?.Cascade ?? Cascade.Persist);
               map.Class(propertyPath.LocalMember.GetPropertyOrFieldType());
           };

            mapper.BeforeMapBag += (modelInspector, propertyPath, map) =>
            {
                var inversePropertyAttribute = propertyPath.LocalMember.GetAttribute<InversePropertyAttribute>(true);
                if (inversePropertyAttribute != null)
                    map.Key(keyMapper => keyMapper.Column(inversePropertyAttribute.Property));
                else
                    map.Key(keyMapper => keyMapper.Column(propertyPath.GetContainerEntity(modelInspector).Name + "Id"));

                map.Cascade(Cascade.All);
                map.Lazy(CollectionLazy.Lazy);

                var bagMapper = map as NMIMPL.BagMapper;

                var manyToManyAttribute = propertyPath.LocalMember.GetAttribute<ManyToManyAttribute>(true);

                if (manyToManyAttribute != null)
                {
                    map.Cascade(Cascade.None);

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
                    if (bagMapper != null && typeof(ISoftDelete).IsAssignableFrom(bagMapper.ElementType)) 
                    {
                        //TODO: Check IsDeletedColumn for Many-To-Many
                        map.Filter("SoftDelete", m =>
                        {
                        });
                        // map.Where($"{SheshaDatabaseConsts.IsDeletedColumn.DoubleQuote()} = 0");
                    }
                }
            };

            mapper.BeforeMapManyToMany += (modelInspector, propertyPath, map) =>
            {
                //map.NotFound(NotFoundMode.Ignore); disabled due to performance issues, this option breaks lazy loading

                var manyToManyAttribute = propertyPath.LocalMember.GetAttribute<ManyToManyAttribute>(true);
                if (manyToManyAttribute != null)
                {
                    if (!string.IsNullOrEmpty(manyToManyAttribute.ChildColumn))
                        map.Column(manyToManyAttribute.ChildColumn);
                }
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
            /* for debug
            foreach (var ent in _entitiesToMap)
            {
                try
                {
                    var mapping1 = mapper.CompileMappingFor(new List<Type> { ent });
                }
                catch (Exception e)
                {
                    throw;
                }
            }
            */

            HbmMapping mapping = mapper.CompileMappingFor(_entitiesToMap);

            mapping.autoimport = false;

            configuration.AddDeserializedMapping(mapping, "AutoMapping");

            LastCompiledXml = mapping.AsString();
        }

        public void SaveXml(string filename)
        {
            TextWriter wr = new StreamWriter(filename);
            wr.Write(LastCompiledXml);
            wr.Close();
        }

        /// <summary>
        /// Last compiled conventions in the xml format
        /// </summary>
        public static string LastCompiledXml { get; set; }

        private static Type GetEntityTypeByMapping(Type mappingType)
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

            Type baseType = type.BaseType;
            if (baseType == null) return false;

            return baseType.IsGenericType &&
                (baseType.GetGenericTypeDefinition() == typeof(ClassMapping<>) ||
                baseType.GetGenericTypeDefinition() == typeof(SubclassMapping<>) ||
                baseType.GetGenericTypeDefinition() == typeof(JoinedSubclassMapping<>)) ||
                IsClassMapping(baseType);
        }
    }
}
