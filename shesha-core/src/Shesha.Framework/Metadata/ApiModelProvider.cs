using Abp.Dependency;
using Abp.Runtime.Caching;
using Microsoft.AspNetCore.Mvc.ActionConstraints;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.AspNetCore.Mvc.Controllers;
using Shesha.Extensions;
using Shesha.Metadata.Dtos;
using Shesha.Reflection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Metadata
{
    public class ApiModelProvider : BaseModelProvider, ITransientDependency
    {
        private readonly IApiDescriptionGroupCollectionProvider _apiDescriptionsProvider;

        public ApiModelProvider(ICacheManager cacheManager, IApiDescriptionGroupCollectionProvider apiDescriptionsProvider) : base(cacheManager)
        {
            _apiDescriptionsProvider = apiDescriptionsProvider;
        }

        protected override Task<List<ModelDto>> FetchModelsAsync()
        {
            var actionDescriptors = _apiDescriptionsProvider.ApiDescriptionGroups.Items.SelectMany(g => g.Items.Select(gi => gi.ActionDescriptor)).ToList();
            var allTypes = actionDescriptors
                .Where(a => a.ActionConstraints != null && a.ActionConstraints.Any(ac => ac is HttpMethodActionConstraint httpConstraint &&
                    httpConstraint.HttpMethods.Any(m => m == System.Net.Http.HttpMethod.Post.ToString() || m == System.Net.Http.HttpMethod.Put.ToString() || m == System.Net.Http.HttpMethod.Get.ToString())
                    )
                )
                .SelectMany(a => {
                    var types = a.Parameters.Select(p => p.ParameterType).ToList();
                    if (a is ControllerActionDescriptor actionDesc)
                    {
                        var returnType = actionDesc.MethodInfo.ReturnType;
                        if (returnType.IsSubtypeOfGeneric(typeof(Task<>)))
                        {
                            var args = returnType.GetGenericArguments();
                            types.AddRange(args);
                        }
                        else
                            types.Add(returnType);
                    }
                    return types;
                })
                .ToList();
            Func<IEnumerable<Type>, List<Type>> getTypes = null;

            getTypes = (IEnumerable<Type> types) =>
            {
                // Paremeters types
                var parameterTypes = types
                    .Where(t => t.IsClass &&
                        !t.IsGenericType &&
                        !t.IsAbstract &&
                        !t.IsArray &&
                        t != typeof(string) &&
                        t != typeof(object) &&
                        !t.Namespace.StartsWith("Abp") &&
                        // skip entity types, they shouldn't be returned by the application service at all
                        !t.IsEntityType() && 
                        !t.IsJsonEntityType())
                    .ToList();

                // List parameters types
                var listTypes = types
                    .Where(t => t.IsClass &&
                        t.IsGenericType &&
                        t.IsListType() &&
                        !t.IsAbstract &&
                        t != typeof(string) &&
                        t != typeof(object) &&
                        !t.Namespace.StartsWith("Abp"))
                    .SelectMany(t => t.GenericTypeArguments);

                if (listTypes?.Count() > 0)
                {
                    parameterTypes.AddRange(getTypes(listTypes));
                }

                // Array parameters types
                var arrayTypes = types
                    .Where(t => t.IsClass &&
                        t.IsArray &&
                        !t.IsAbstract &&
                        t != typeof(string) &&
                        t != typeof(object) &&
                        !t.Namespace.StartsWith("Abp"))
                    .Select(t => t.GetElementType());

                if (arrayTypes?.Count() > 0)
                {
                    parameterTypes.AddRange(getTypes(arrayTypes));
                }

                return parameterTypes;
            };

            var parameterTypes = getTypes(allTypes.Distinct());

            var dtos = parameterTypes
                .Distinct(new ParameterTypeComparer())
                .OrderBy(x => x.Name)
                .Select(p => new ModelDto
                {
                    ClassName = p.FullName,
                    Type = p,
                    Description = ReflectionHelper.GetDescription(p),
                    Alias = null
                }).ToList();

            return Task.FromResult(dtos);
        }

        private class ParameterTypeComparer : IEqualityComparer<Type>
        {
            bool IEqualityComparer<Type>.Equals(Type x, Type y)
            {
                return x.FullName == y.FullName;
            }

            int IEqualityComparer<Type>.GetHashCode(Type obj)
            {
                return obj.GetHashCode();
            }
        }
    }
}
