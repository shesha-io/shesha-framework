using GraphQL;
using GraphQL.Execution;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;

namespace Shesha.GraphQL.NewtonsoftJson
{
    /// <summary>
    /// Converts an instance of <see cref="ExecutionResult"/> to JSON. Doesn't support read from JSON.
    /// </summary>
    public class ExecutionResultJsonConverter : JsonConverter
    {
        private readonly NamingStrategy? _namingStrategy;

        /// <summary>
        /// Initializes a new instance.
        /// </summary>
        public ExecutionResultJsonConverter()
        {
        }

        /// <summary>
        /// Initializes a new instance with the specified <see cref="NamingStrategy"/>.
        /// </summary>
        public ExecutionResultJsonConverter(NamingStrategy? namingStrategy)
        {
            _namingStrategy = namingStrategy;
        }

        /// <inheritdoc/>
        public override void WriteJson(JsonWriter writer, object? value, JsonSerializer serializer)
        {
            var result = (ExecutionResult)value!;
            WriteData(writer, result, serializer);
        }

        private void WriteData(JsonWriter writer, ExecutionResult result, JsonSerializer serializer)
        {
            if (result.Executed)
            {
                if (result.Data is ExecutionNode executionNode)
                {
                    WriteExecutionNode(writer, executionNode, serializer, true);
                }
                else
                {
                    serializer.Serialize(writer, result.Data);
                }
            }
        }

        private void WriteExecutionNode(JsonWriter writer, ExecutionNode node, JsonSerializer serializer, bool isRoot)
        {
            if (node is ValueExecutionNode valueExecutionNode)
            {
                serializer.Serialize(writer, valueExecutionNode.ToValue());
            }
            else if (node is ObjectExecutionNode objectExecutionNode)
            {
                if (objectExecutionNode.SubFields == null)
                {
                    writer.WriteNull();
                }
                else
                {
                    if (!isRoot)
                        writer.WriteStartObject();
                    foreach (var childNode in objectExecutionNode.SubFields)
                    {
                        if (!isRoot) 
                        {
                            var propName = childNode.Name!;
                            if (_namingStrategy != null)
                                propName = _namingStrategy.GetPropertyName(propName, false);
                            writer.WritePropertyName(propName);
                        }
                        WriteExecutionNode(writer, childNode, serializer, false);
                    }
                    if (!isRoot)
                        writer.WriteEndObject();
                }
            }
            else if (node is ArrayExecutionNode arrayExecutionNode)
            {
                // GraphQL.NET 8+: ArrayExecutionNode.Items is null after execution; the resolved
                // values must be obtained via ToValue(). Reading Items directly (as the previous
                // implementation did, written against GraphQL.NET 5.x) silently writes JSON null
                // for any list field — including [MultiValueReferenceList] properties.
                var value = arrayExecutionNode.ToValue();
                if (value == null)
                    writer.WriteNull();
                else
                    serializer.Serialize(writer, value);
            }
            else if (node == null || node is NullExecutionNode)
            {
                writer.WriteNull();
            }
            else
            {
                serializer.Serialize(writer, node.ToValue());
            }
        }

        /// <summary>
        /// This JSON converter does not support reading.
        /// </summary>
        public override object ReadJson(JsonReader reader, Type objectType, object? existingValue, JsonSerializer serializer) => throw new NotImplementedException();

        /// <inheritdoc/>
        public override bool CanRead => false;

        /// <inheritdoc/>
        public override bool CanConvert(Type objectType) => typeof(ExecutionResult).IsAssignableFrom(objectType);
    }

}
