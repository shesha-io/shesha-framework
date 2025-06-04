using System;
using System.Threading.Tasks;
using Shesha.Metadata;


namespace Shesha.FormTemplates
{
    public interface ITemplateGenerator
    {
        /// <summary>
        /// Generates a form template based on the provided configuration.
        /// </summary>
        /// <returns>The generated form template.</returns>
        Task<string> GenerateTemplateAsync(Guid templateId, string data);
    }
}
