using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;

namespace Shesha.Web.FormsDesigner.Dtos
{
    /// <summary>
    /// Form update validation results input
    /// </summary>
    public class FormUpdateValidationResultsInput : EntityDto<Guid>
    {
        public List<FormConfigurationIssue> Issues { get; set; } = new();

        public class FormConfigurationIssue 
        {
            public string Severity { get; set; }
            public string Location { get; set; }
            public string Property { get; set; }
            public string Message { get; set; }
            public string? Code { get; set; }
        }
    }
}
