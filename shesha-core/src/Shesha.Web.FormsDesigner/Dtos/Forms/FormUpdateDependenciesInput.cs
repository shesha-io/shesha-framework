using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;

namespace Shesha.Web.FormsDesigner.Dtos
{
    /// <summary>
    /// Form update dependencies input
    /// </summary>
    public class FormUpdateDependenciesInput : EntityDto<Guid>
    {
        public List<DependencyInfo> Dependencies { get; set; } = new();

        public class DependencyInfo 
        {
            public virtual string Type { get; set; }
            public virtual string? Module { get; set; }
            public virtual string Name { get; set; }
            public virtual bool IsSatisfied { get; set; }
            public virtual bool HasIssues { get; set; }
        }
    }
}
