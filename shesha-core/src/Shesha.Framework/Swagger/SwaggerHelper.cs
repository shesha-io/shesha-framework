using Abp.Application.Services;
using Abp.Reflection;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;
using Shesha.Domain;
using Shesha.DynamicEntities;
using Shesha.DynamicEntities.Dtos;
using Shesha.JsonEntities;
using Shesha.Reflection;
using Shesha.Services;
using Shesha.Utilities;
using Swashbuckle.AspNetCore.SwaggerGen;
using Swashbuckle.AspNetCore.SwaggerUI;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;

namespace Shesha.Swagger
{
    public static class SwaggerHelper
    {
        private static Lazy<IList<TypeInfo>> ServiceTypes = new Lazy<IList<TypeInfo>>(() => 
        {
            return ServiceTypesFunc();
        });

        public static IList<TypeInfo> ServiceTypesFunc()
        {
            var types = GetRegisteredControllerTypes();

            var assemblyFinder = StaticContext.IocManager.Resolve<IAssemblyFinder>();
            var assemblies = assemblyFinder.GetAllAssemblies();

            // filter assemblies to include only the ones which are defined in modules
            types = types.Where(t => assemblies.Contains(t.Assembly)).ToList();
            return types;
        }

        private static Lazy<IList<Type>> EntityTypes = new Lazy<IList<Type>>(() =>
        {
            return EntityTypesFunc();
        });

        public static IList<Type> EntityTypesFunc()
        {
            var assemblyFinder = StaticContext.IocManager.Resolve<IAssemblyFinder>();
            return assemblyFinder.GetAllAssemblies()
                .Distinct(new AssemblyFullNameComparer())
                .Where(a => !a.IsDynamic &&
                            a.GetTypes().Any(t => MappingHelper.IsEntity(t) || MappingHelper.IsJsonEntity(t) && t != typeof(JsonEntity))
                ).SelectMany(a => a.GetTypes().Where(t => MappingHelper.IsEntity(t) || MappingHelper.IsJsonEntity(t) && t != typeof(JsonEntity)))
                .ToList();
        }

        public static void AddEndpointsPerService(this SwaggerUIOptions options, bool useDynamicUpdate = true) 
        {
            if (useDynamicUpdate)
            {
                options.ConfigObject.Urls = new SwaggerEndpointEnumerator();
            }
            else
            {
                var types = ServiceTypes.Value;
                var serviceNames = types.Select(t => MvcHelper.GetControllerName(t)).OrderBy(s => s).ToList();
                foreach (var serviceName in serviceNames)
                {
                    options.SwaggerEndpoint($"swagger/{GetDocumentNameForService(serviceName)}/swagger.json", serviceName);
                }
            }
        }

        /// <summary>
        /// Add separate Swagger documents for each Application Service and Controller
        /// Url format: `/swagger/service:{ApplicationService or controller name}/swagger.json`
        /// </summary>
        /// <param name="options"></param>
        public static void AddDocumentsPerService(this SwaggerGenOptions options)
        {
            var types = ServiceTypes.Value;

            var docs = new Dictionary<string, OpenApiInfo>();

            // 1. add controllers
            var controllers = types.Where(t => typeof(ControllerBase).IsAssignableFrom(t)).ToList();
            foreach (var controller in controllers)
            {
                var serviceName = MvcHelper.GetControllerName(controller);
                docs.Add(GetDocumentNameForService(serviceName), new OpenApiInfo() { Title = $"{serviceName} (ControllerBase)", Version = "v1" });
            }

            // 2. add application services
            var appServices = types.Where(t => typeof(IApplicationService).IsAssignableFrom(t)).ToList();
            foreach (var service in appServices)
            {
                var serviceName = MvcHelper.GetControllerName(service);
                docs.Add(GetDocumentNameForService(serviceName), new OpenApiInfo() { Title = $"API {serviceName} (IApplicationService)", Version = "v1" });
            }

            var entityTypes = EntityTypes.Value;

            // 3. Add Entities (need to add all entities because services may have been disabled but will be enabled in the future)
            foreach (var entity in entityTypes)
            {
                var serviceName = entity.Name;
                if (!docs.ContainsKey(GetDocumentNameForService(serviceName)))
                    docs.Add(GetDocumentNameForService(serviceName), new OpenApiInfo() { Title = $"API {serviceName} (IApplicationService)", Version = "v1" });
            }

            foreach (var doc in docs)
            {
                options.SwaggerDoc(doc.Key, doc.Value);
            }

            options.DocInclusionPredicate((docName, description) => ApiExplorerGroupPerControllerConvention.GroupInclusionPredicate(docName, description));
        }

        public static string GetDocumentNameForService(string serviceName) 
        {
            return $"service:{serviceName}";
        }

        private static IList<TypeInfo> GetRegisteredControllerTypes() 
        {
            var controllerFeature = new ControllerFeature();
            var applicationPartManager = StaticContext.IocManager.Resolve<ApplicationPartManager>();
            applicationPartManager.PopulateFeature(controllerFeature);
            return controllerFeature.Controllers;
        }

        public static void AddXmlDocuments(this SwaggerGenOptions options)
        {
            var assemblyFinder = StaticContext.IocManager.Resolve<IAssemblyFinder>();

            var assemblies = assemblyFinder.GetAllAssemblies();

            foreach (var assembly in assemblies)
            {
                var xmlPath = Path.ChangeExtension(assembly.Location, ".xml");
                if (File.Exists(xmlPath))
                    options.IncludeXmlComments(xmlPath, true);
            }
        }

        public static string GetSchemaId(Type modelType)
        {
            if (modelType.IsDynamicDto())
            {
                if (modelType.IsConstructedGenericType)
                {
                    var typeName = String.Concat(modelType.Name.TakeWhile(x => x != '`'));
                    var test = typeName + modelType.GetGenericArguments().Select(genericArg => GetSchemaId(genericArg)).Aggregate((previous, current) => previous + current);
                    return test;
                } 
                else if (modelType.HasInterface(typeof(IDynamicDtoProxy)))
                    return "Proxy" + GetSchemaId(modelType.BaseType);
                else
                    return modelType.Name;
            }

            if (!modelType.IsConstructedGenericType) return modelType.Name.Replace("[]", "Array");

            var prefix = modelType.GetGenericArguments()
                .Select(genericArg => GetSchemaId(genericArg))
                .Aggregate((previous, current) => previous + current);

            var result = prefix + modelType.Name.Split('`').First();

            return result;
        }
    }
}
