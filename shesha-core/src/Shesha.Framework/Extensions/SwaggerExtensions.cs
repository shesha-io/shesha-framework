using Microsoft.OpenApi;

namespace Shesha.Extensions
{
    /// <summary>
    ///  Swagger extensions
    /// </summary>
    public static class SwaggerExtensions
    {
        /// <summary>
        /// Set nullable
        /// </summary>
        public static void SetNullable(this IOpenApiSchema schema, bool nullable) 
        {
            if (schema is OpenApiSchema openApiSchema)
            {
                if (nullable)
                    openApiSchema.Type |= JsonSchemaType.Null;
                else
                    openApiSchema.Type &= ~JsonSchemaType.Null;
            }
        }

        /// <summary>
        /// Set parameter required
        /// </summary>
        public static void SetRequired(this IOpenApiParameter parameter, bool required)
        { 
            if (parameter is OpenApiParameter openApiSchema)
            {
                openApiSchema.Required = required;
            }
        }
    }
}
