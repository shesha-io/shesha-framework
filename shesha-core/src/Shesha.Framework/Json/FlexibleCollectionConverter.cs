using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Shesha.Extensions;

/// <summary>
/// A converter that handles both array of objects and stringified JSON arrays of objects
/// </summary>
/// <typeparam name="T">The type of objects in the collection</typeparam>
public class FlexibleCollectionConverter<T> : JsonConverter
{
    public override bool CanConvert(Type objectType)
    {
        return objectType == typeof(List<T>) || objectType == typeof(IEnumerable<T>) ||
               objectType == typeof(ICollection<T>) || objectType == typeof(IList<T>);
    }

    public override object? ReadJson(JsonReader reader, Type objectType, object? existingValue, JsonSerializer serializer)
    {
        try
        {
            // Handle null values
            if (reader.TokenType == JsonToken.Null)
            {
                return new List<T>();
            }

            // Handle empty strings
            if (reader.TokenType == JsonToken.String && string.IsNullOrEmpty(reader.Value?.ToString()))
            {
                return new List<T>();
            }

            // Handle stringified JSON arrays
            if (reader.TokenType == JsonToken.String)
            {
                var jsonString = reader.Value?.ToString();

                if (!string.IsNullOrWhiteSpace(jsonString))
                {
                    // Try to parse the string as JSON
                    var token = JToken.Parse(jsonString);

                    // If it's an array, deserialize it
                    if (token is JArray jArray)
                    {
                        var stringList = jArray.ToObject<List<string>>(serializer) ?? new List<string>();
                        
                        return stringList.WhereNotNull().Select(s => JsonConvert.DeserializeObject<T>(s)).ToList();
                    }

                    // If it's a single object, wrap it in a list
                    if (token is JObject jObject)
                    {
                        var singleItem = jObject.ToObject<T>(serializer);
                        if (singleItem != null)
                            return new List<T> { singleItem };
                    }
                }

                return new List<T>();
            }

            // Handle direct JSON arrays
            if (reader.TokenType == JsonToken.StartArray)
            {
                var jArray = JArray.Load(reader);
                return jArray.ToObject<List<T>>(serializer);
            }

            // Handle single object (wrap in array)
            if (reader.TokenType == JsonToken.StartObject)
            {
                var jObject = JObject.Load(reader);
                var singleItem = jObject.ToObject<T>(serializer);
                if (singleItem != null)
                    return new List<T> { singleItem };
            }

            return new List<T>();
        }
        catch (Exception ex)
        {
            // Log error if needed, then return empty list
            // You might want to log this exception in production
            System.Diagnostics.Debug.WriteLine($"FlexibleCollectionConverter error: {ex.Message}");
            return new List<T>();
        }
    }

    public override void WriteJson(JsonWriter writer, object? value, JsonSerializer serializer)
    {
        // Always write as proper JSON array
        serializer.Serialize(writer, value);
    }

    public override bool CanWrite => true;
}