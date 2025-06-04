using Boxfusion.SheshaFunctionalTests.Common.Application.Services.Dto;
using Shesha;
using Shesha.FormTemplates;
using Shesha.Metadata;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Boxfusion.SheshaFunctionalTests.Common.Application.Services
{
    public class TemplateTestAppService: SheshaAppServiceBase
    {
        private readonly ITemplateGenerator _templateGenerator;
        public TemplateTestAppService(ITemplateGenerator templateGenerator)     
        {
            _templateGenerator = templateGenerator;
        }

        public async Task<string> TestTemplateAsync(TemplateConfigsDto input)
        {
            return await _templateGenerator.GenerateTemplateAsync(input.TemplateId, input.Data);
        }
    }
}
