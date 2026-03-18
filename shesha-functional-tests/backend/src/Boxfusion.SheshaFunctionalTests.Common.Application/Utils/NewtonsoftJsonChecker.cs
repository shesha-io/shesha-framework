using Newtonsoft.Json;
using System.Collections.Concurrent;
using System.Reflection;


namespace Boxfusion.SheshaFunctionalTests.Common.Application.Utils
{
    public static class NewtonsoftJsonChecker
    {
        private static readonly ConcurrentDictionary<Type, bool> _deserializationCache = new();
        private static readonly ConcurrentDictionary<Type, DeserializationCapability> _analysisCache = new();

        public class DeserializationCapability
        {
            public bool CanDeserialize { get; set; }
            public List<string> Issues { get; set; } = new();
            public List<string> Warnings { get; set; } = new();
            public string? RecommendedConstructor { get; set; }
            public Dictionary<string, Type>? ConstructorParameters { get; set; }
        }

        public static DeserializationCapability CanDeserialize(Type type)
        {
            // Use cached result if available
            if (_analysisCache.TryGetValue(type, out var cached))
                return cached;

            var result = new DeserializationCapability();
            var visitedTypes = new HashSet<Type>(); // Track visited types to prevent cycles

            try
            {
                AnalyzeType(type, result, visitedTypes, type.Name);
                result.CanDeserialize = result.Issues.Count == 0;

                // Cache the result
                _analysisCache[type] = result;

                return result;
            }
            catch (Exception ex)
            {
                result.Issues.Add($"Error analyzing type: {ex.Message}");
                result.CanDeserialize = false;
                return result;
            }
        }

        private static void AnalyzeType(Type type, DeserializationCapability result, HashSet<Type> visitedTypes, string path = "")
        {
            // Prevent infinite recursion
            if (visitedTypes.Contains(type))
            {
                result.Warnings.Add($"Circular reference detected for type {type.Name}. Stopping recursion.");
                return;
            }

            visitedTypes.Add(type);

            // Check if type is abstract or interface
            if (type.IsAbstract || type.IsInterface)
            {
                result.Issues.Add($"{path}: Type {type.Name} is abstract or interface. Newtonsoft.Json cannot instantiate it directly.");
                return;
            }

            // Skip primitive and simple types
            if (IsSimpleType(type))
                return;

            // Find the constructor that Json.NET would use
            var constructor = FindJsonConstructor(type);

            if (constructor == null)
            {
                result.Issues.Add($"{path}: No suitable constructor found for deserialization");
                return;
            }

            result.RecommendedConstructor = GetConstructorSignature(constructor);
            result.ConstructorParameters = constructor.GetParameters()
                .ToDictionary(p => p.Name!, p => p.ParameterType);

            // Check constructor parameters
            CheckConstructorParameters(constructor, result, visitedTypes, path);

            // Check properties
            CheckProperties(type, result, visitedTypes, path);

            // Check for default constructor
            CheckDefaultConstructor(type, result);
        }

        private static bool IsSimpleType(Type type)
        {
            return type.IsPrimitive ||
                   type == typeof(string) ||
                   type == typeof(decimal) ||
                   type == typeof(DateTime) ||
                   type == typeof(DateTimeOffset) ||
                   type == typeof(Guid) ||
                   type == typeof(Uri) ||
                   type.IsEnum ||
                   type == typeof(TimeSpan) ||
                   type == typeof(Version) ||
                   type == typeof(byte[]);
        }

        private static ConstructorInfo? FindJsonConstructor(Type type)
        {
            var constructors = type.GetConstructors(BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance);

            // Look for constructor with JsonConstructor attribute
            var attributedConstructor = constructors.FirstOrDefault(c =>
                c.GetCustomAttribute<JsonConstructorAttribute>() != null);

            if (attributedConstructor != null)
                return attributedConstructor;

            // Find the constructor with the most parameters (Json.NET's default behavior)
            var publicConstructors = constructors.Where(c => c.IsPublic).ToArray();
            if (publicConstructors.Length > 0)
            {
                return publicConstructors
                    .OrderByDescending(c => c.GetParameters().Length)
                    .FirstOrDefault();
            }

            // If no public constructors, try to find any constructor
            if (constructors.Length > 0)
            {
                return constructors
                    .OrderByDescending(c => c.GetParameters().Length)
                    .FirstOrDefault();
            }

            return null;
        }

        private static void CheckConstructorParameters(ConstructorInfo constructor, DeserializationCapability result, HashSet<Type> visitedTypes, string path = "")
        {
            foreach (var param in constructor.GetParameters())
            {
                // Check if parameter has a matching property/field
                var matchingProperty = constructor.DeclaringType!.GetProperty(param.Name!,
                    BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.IgnoreCase);

                var matchingField = constructor.DeclaringType!.GetField(param.Name!,
                    BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.IgnoreCase);

                if (matchingProperty == null && matchingField == null)
                {
                    result.Warnings.Add($"No matching property or field found for constructor parameter '{param.Name}'. " +
                        "The value will be used only for construction and not stored.");
                }

                // Check parameter type (but avoid deep recursion for complex types)
                if (!IsSimpleType(param.ParameterType))
                {
                    // Only analyze if not already visited and not causing cycle
                    if (!visitedTypes.Contains(param.ParameterType))
                    {
                        // Create a new HashSet for the nested analysis to maintain path
                        var nestedVisited = new HashSet<Type>(visitedTypes);
                        AnalyzeType(param.ParameterType, result, nestedVisited, $"{path}({param.Name})");
                    }
                }
            }
        }

        private static void CheckProperties(Type type, DeserializationCapability result, HashSet<Type> visitedTypes, string path = "")
        {
            var properties = type.GetProperties(BindingFlags.Public | BindingFlags.Instance)
                .Where(p => p.CanWrite || p.GetCustomAttribute<JsonPropertyAttribute>() != null);

            foreach (var prop in properties)
            {
                // Check if property has a setter
                if (!prop.CanWrite && prop.GetCustomAttribute<JsonPropertyAttribute>() == null)
                {
                    result.Warnings.Add($"Property '{prop.Name}' has no setter and no [JsonProperty] attribute. It will be ignored during deserialization.");
                }

                // Check for required properties
                var jsonPropertyAttr = prop.GetCustomAttribute<JsonPropertyAttribute>();
                if (jsonPropertyAttr?.Required == Required.Always)
                {
                    result.Warnings.Add($"Property '{prop.Name}' is marked as Required. Ensure JSON always contains this property.");
                }

                // Check property type (but avoid deep recursion)
                if (!IsSimpleType(prop.PropertyType) && !visitedTypes.Contains(prop.PropertyType))
                {
                    var nestedVisited = new HashSet<Type>(visitedTypes);
                    AnalyzeType(prop.PropertyType, result, nestedVisited, $"{path}.{prop.Name}");
                }
            }

            // Check fields with JsonProperty attribute
            var fields = type.GetFields(BindingFlags.Public | BindingFlags.Instance)
                .Where(f => f.GetCustomAttribute<JsonPropertyAttribute>() != null);

            foreach (var field in fields)
            {
                if (!IsSimpleType(field.FieldType) && !visitedTypes.Contains(field.FieldType))
                {
                    var nestedVisited = new HashSet<Type>(visitedTypes);
                    AnalyzeType(field.FieldType, result, nestedVisited);
                }
            }
        }

        private static void CheckDefaultConstructor(Type type, DeserializationCapability result)
        {
            var defaultCtor = type.GetConstructor(Type.EmptyTypes);
            if (defaultCtor != null)
            {
                result.Warnings.Add("Type has a default constructor. Json.NET will use it if no [JsonConstructor] is specified and no matching constructor parameters are found.");
            }
        }

        private static string GetConstructorSignature(ConstructorInfo constructor)
        {
            var parameters = string.Join(", ",
                constructor.GetParameters().Select(p => $"{p.ParameterType.Name} {p.Name}"));
            return $"{constructor.DeclaringType!.Name}({parameters})";
        }

        // Helper method to clear cache if needed
        public static void ClearCache()
        {
            _analysisCache.Clear();
            _deserializationCache.Clear();
        }
    }
}
