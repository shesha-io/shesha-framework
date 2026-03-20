using Abp.Dependency;
using Abp.Reflection;
using Boxfusion.SheshaFunctionalTests.Common.Application.Utils.Models;
using Shesha.Cache;
using Shesha.Extensions;
using Shesha.Reflection;
using Shesha.Utilities;
using System.Reflection;
using System.Runtime.Serialization;
using System.Text;

namespace Boxfusion.SheshaFunctionalTests.Common.Application.Utils
{
    public class CacheAnalyzerService: ICacheAnalyzerService, ITransientDependency
    {
        private readonly ITypeFinder _typeFinder;
        private readonly IocManager _iocManager;
        

        public CacheAnalyzerService(
            ITypeFinder typeFinder,
            IocManager iocManager)
        {
            _typeFinder = typeFinder;
            _iocManager = iocManager;
        }

        public string FormatResults(List<CacheItemTypeAnalysisResult> results) 
        {
            var sb = new StringBuilder();
            foreach (var result in results)
            {
                sb.AppendLine($"Cache {result.Name}:");
                sb.AppendLine($"    Contains Complex Types: {(result.ContainsComplexTypes ? "yes" : "no")}");
                sb.AppendLine($"    Is Serializable: {(result.IsSerializable ? "yes" : "no")}");
                sb.AppendLine($"    Circular References: {(result.HasCircularReferences ? "yes" : "no")}");
                sb.AppendLine($"    Json Compatibility: {result.JsonCompatibility}");
                sb.AppendLine();
            }
            return sb.ToString();
        }

        public List<CacheItemTypeAnalysisResult> AnalyzeCaches()
        {
            var cacheHolders = _typeFinder.Find(t => t.ImplementsGenericInterface(typeof(ICacheHolder<,>)) && !t.IsInterface && !t.IsGenericType && !t.IsAbstract);
            var registeredHolders = cacheHolders.Where(t => _iocManager.IsRegistered(t)).ToList();

            var sb = new StringBuilder();
            var results = new List<CacheItemTypeAnalysisResult>();
            foreach (var holder in registeredHolders)
            {
                var generic = holder.Closest(t => t.BaseType, t => t.IsGenericType && t.GetGenericTypeDefinition() == typeof(CacheHolder<,>));
                if (generic == null)
                    continue;

                var args = generic.GetGenericArguments();

                var keyType = args[0];
                var itemType = args[1];

                var result = AnalyzeCacheItemType(holder.Name, itemType);

                results.Add(result);
            }

            return results;
        }

        private CacheItemTypeAnalysisResult AnalyzeCacheItemType(string name, Type itemType) 
        {
            return new CacheItemTypeAnalysisResult
            {
                Name = name,
                Type = itemType,
                IsSerializable = IsTypeSerializable(itemType),
                HasCircularReferences = CheckForCircularReferences(itemType),
                ContainsComplexTypes = ContainsComplexTypes(itemType),
                JsonCompatibility = GetJsonCompatibility(itemType)
            };            
        }

        private bool IsTypeSerializable(Type type)
        {
            return type.IsSerializable ||
                   type.GetCustomAttributes<DataContractAttribute>().Any() ||
                   type.GetProperties().Any();
        }

        private bool CheckForCircularReferences(Type type)
        {
            // Simple check for self-referencing types
            var visited = new HashSet<Type>();
            return HasCircularReferencesInternal(type, visited);
        }

        private bool HasCircularReferencesInternal(Type type, HashSet<Type> visited)
        {
            if (visited.Contains(type))
                return true;

            visited.Add(type);

            foreach (var prop in type.GetProperties())
            {
                if (prop.PropertyType.IsClass &&
                    prop.PropertyType != typeof(string) &&
                    HasCircularReferencesInternal(prop.PropertyType, new HashSet<Type>(visited)))
                {
                    return true;
                }
            }

            return false;
        }

        private bool ContainsComplexTypes(Type type)
        {
            return type.GetProperties().Any(p =>
                p.PropertyType.IsClass &&
                p.PropertyType != typeof(string) &&
                !p.PropertyType.IsValueType);
        }

        private string GetJsonCompatibility(Type type)
        {
            var issues = new List<string>();

            var report = NewtonsoftJsonChecker.CanDeserialize(type);
            if (!report.CanDeserialize) 
            {
                issues.Add("Can't be deserialized by Newtonsoft.Json. \r\n  Errors: " + report.Issues.Distinct().Delimited("\r\n"));
            }                

            /*
            // Check for common JSON serialization issues
            if (type.GetProperties().Any(p => p.GetIndexParameters().Length > 0))
                issues.Add("Contains indexed properties");

            if (type.GetFields().Any(f => !f.IsInitOnly))
                issues.Add("Contains public fields (consider properties instead)");

            if (type.GetConstructors().All(c => c.GetParameters().Length > 0))
                issues.Add("No parameterless constructor");
            */

            return issues.Count > 0 ? $"Issues: {string.Join(", ", issues)}" : "Compatible";
        }
    }
}
