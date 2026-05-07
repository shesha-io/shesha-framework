using Abp.Dependency;
using Abp.Linq;
using NHibernate.Linq;
using Shesha.Configuration.Runtime;
using Shesha.Domain;
using Shesha.Extensions;
using Shesha.Services;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ReflectionHelper = Shesha.Reflection.ReflectionHelper;

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
                        var ownerProp = ReflectionHelper.GetPropertyWithPath(typeof(T), ownerProperty, useCamelCase: true);
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
                    var propertyWithPath = ReflectionHelper.GetPropertyWithPath(typeof(T), propName, useCamelCase: true);
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
                                var nestedEntityPropertyWithPath = ReflectionHelper.GetPropertyWithPath(typeof(T), nestedEntityPropName, useCamelCase: true);
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