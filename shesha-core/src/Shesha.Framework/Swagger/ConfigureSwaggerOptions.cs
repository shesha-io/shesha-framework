using System;
using System.IO;
using System.Reflection;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Shesha.Swagger
{
    public class ConfigureSwaggerOptions : IConfigureOptions<SwaggerGenOptions>
    {
        private readonly IApiVersionDescriptionProvider _provider;
        private readonly OpenApiInfo _openApiInfo;

        public ConfigureSwaggerOptions(
            IApiVersionDescriptionProvider provider,
            IOptions<OpenApiInfo> options)
        {
            _provider = provider;
            _openApiInfo = options.Value;
        }

        public void Configure(SwaggerGenOptions options)
        {
            foreach (ApiVersionDescription description in _provider.ApiVersionDescriptions)
            {
                options.SwaggerDoc(description.GroupName, CreateInfoForApiVersion(description));
                var xmlCommentsFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
                var xmlCommentsFullPath = Path.Combine(AppContext.BaseDirectory, xmlCommentsFile);
                if (File.Exists(xmlCommentsFullPath))
                    options.IncludeXmlComments(xmlCommentsFullPath);
            }
        }

        private OpenApiInfo CreateInfoForApiVersion(ApiVersionDescription description)
        {
            var info = new OpenApiInfo
            {
                Title = string.Format(_openApiInfo.Title ?? "Web Api", description.ApiVersion.ToString()),
                Version = description.ApiVersion.ToString(),
                Description = _openApiInfo.Description,
                Contact = new OpenApiContact
                {
                    Name = _openApiInfo.Contact?.Name,
                    Email = _openApiInfo.Contact?.Email,
                    Url = _openApiInfo.Contact?.Url
                },
                TermsOfService = _openApiInfo.TermsOfService,
                License = new OpenApiLicense
                {
                    Name = _openApiInfo.License?.Name,
                    Url = _openApiInfo.License?.Url
                }
            };

            if (description.IsDeprecated)
            {
                info.Description += " This API version has been deprecated.";
            }

            return info;
        }
    }
}

