using Shesha.Metadata;
using Stubble.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.FormTemplates
{
    public interface IGenerationLogic
    {
        Task<string> PrepareTemplateAsync(string markup, string data, StubbleVisitorRenderer stubbleRenderer, IMetadataAppService metadataAppService);
    }
}
