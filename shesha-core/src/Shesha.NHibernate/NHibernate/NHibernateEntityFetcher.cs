using Abp.Dependency;
using Abp.Linq;
using NHibernate.Linq;
using Shesha.Configuration.Runtime;
using Shesha.Domain;
using Shesha.Extensions;
using Shesha.Reflection;
using Shesha.Services;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using static Shesha.Reflection.ReflectionHelper;

namespace Shesha.NHibernate
{
    /// <summary>
    /// NHibernate entity fetcher
    /// </summary>
    public class NHibernateEntityFetcher : IEntityFetcher, ITransientDependency
    {
        private readonly IAsyncQueryableExecuter _asyncExecuter;

        public NHibernateEntityFetcher(IAsyncQueryableExecuter asyncExecuter)
        {
            _asyncExecuter = asyncExecuter;
        }

        public Task<List<T>> ToListAsync<T>(IQueryable<T> queryable, List<string> properties) where T : class, new()
        {
            var propertiesToFetch = new List<string>();
            var missingProperties = new List<string>();
            foreach (var propName in properties) 
            {
                var propWithPath = ExtractPropNameAndPath(propName);
                if (propWithPath.PropName == EntityConstants.DisplayNameField)
                {
                    var ownerProperty = propWithPath.Path.Delimited(".");

                    if (!string.IsNullOrWhiteSpace(ownerProperty))
                    {
                        var ownerProp = GetPropertyWithPath(typeof(T), ownerProperty);
                        if (ownerProp != null && ownerProp.PropertyInfo.PropertyType.IsEntityType()) 
                        {
                            var displayNamePropInfo = ownerProp.PropertyInfo.PropertyType.GetEntityConfiguration()?.DisplayNamePropertyInfo;
                            if (displayNamePropInfo != null && !string.IsNullOrWhiteSpace(displayNamePropInfo.Name)) 
                            {
                                string[] nestedPath = [.. ownerProp.Path, displayNamePropInfo.Name];
                                var nestedProp = nestedPath.Delimited(".");
                                propertiesToFetch.Add(nestedProp);
                            }
                        }
                    }
                    else
                    {
                        var displayNamePropInfo = typeof(T).GetEntityConfiguration()?.DisplayNamePropertyInfo;
                        if (displayNamePropInfo != null) 
                        {
                            propertiesToFetch.Add(displayNamePropInfo.Name);
                        }
                    }
                } else
                if (propWithPath.PropName == EntityConstants.ClassNameField)
                {
                    // noop
                }
                else
                {
                    var propertyWithPath = GetPropertyWithPath(typeof(T), propName);
                    if (propertyWithPath != null)
                    {
                        if (propertyWithPath.PropertyInfo.CanWrite) 
                        {
                            var realPath = propertyWithPath.Path.Delimited(".");
                            if (!propertiesToFetch.Contains(realPath))
                                propertiesToFetch.Add(realPath);
                        }                        
                    }
                    else
                    {
                        if (propName.EndsWith("Id"))
                        {
                            var nestedEntityPropName = propName.RemovePostfix("Id");
                            if (!string.IsNullOrWhiteSpace(nestedEntityPropName)) 
                            {
                                var nestedEntityPropertyWithPath = GetPropertyWithPath(typeof(T), nestedEntityPropName);
                                if (nestedEntityPropertyWithPath != null && nestedEntityPropertyWithPath.PropertyInfo.PropertyType.IsEntityType()) 
                                {
                                    string[] nestedPath = [.. nestedEntityPropertyWithPath.Path, "Id"];
                                    var nestedProp = nestedPath.Delimited(".");
                                    propertiesToFetch.Add(nestedProp);
                                } else
                                    missingProperties.Add(propName);
                            } else
                                missingProperties.Add(propName);
                        }                        
                        
                        missingProperties.Add(propName);
                    }
                }                
            }            

            var partialQuery = queryable.SelectProperties(propertiesToFetch);
            return _asyncExecuter.ToListAsync(partialQuery);
        }

        public PropertyInfoWithPath? GetPropertyWithPath(Type type, string propertyName)
        {
            var propTokens = propertyName.Split('.');
            var currentType = type;
            var path = new List<string>();

            for (int i = 0; i < propTokens.Length; i++)
            {
                PropertyInfo? propInfo;
                var containerType = currentType.StripCastleProxyType();
                try
                {
                    var props = containerType.GetProperties().Where(p => p.Name.ToCamelCase() == propTokens[i].ToCamelCase()).ToList();
                    if (props.Count() > 1)
                        throw new AmbiguousMatchException();

                    propInfo = props.FirstOrDefault();
                }
                catch (AmbiguousMatchException)
                {
                    // Property may have been overriden using the 'new' keyword hence there are multiple properties with the same name.
                    // Will look for the one declared at the highest level.
                    propInfo = FindHighestLevelProperty(propTokens[i], containerType);
                }

                if (propInfo == null)
                    return null;

                path.Add(propInfo.Name);

                if (i == propTokens.Length - 1)
                {
                    return new PropertyInfoWithPath(propInfo, path);
                }
                else
                {
                    if (propInfo.PropertyType.IsCollectionType(out var elementType))
                        currentType = elementType;
                    else
                        currentType = propInfo.PropertyType;
                }
            }

            return null;
        }

        private class PropWithPath 
        { 
            public string[] Path { get; set; }
            public string PropName { get; set; }
        }

        private PropWithPath ExtractPropNameAndPath(string dotNotation) 
        {
            var fullPath = dotNotation.Split('.');
            return new PropWithPath { PropName = fullPath[^1], Path = fullPath[..^1] };
        }

        public IQueryable<T> SetReadOnly<T>(IQueryable<T> queryable)
        {
            return queryable.WithOptions((options) => {
                options.SetReadOnly(true);
            });
        }
    }
}