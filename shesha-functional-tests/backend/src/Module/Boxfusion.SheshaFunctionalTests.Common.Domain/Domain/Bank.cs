using Abp.Domain.Entities;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.Web.FormsDesigner.Domain;
using System;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain
{
    [Entity(TypeShortAlias = "Boxfusion.SheshaFunctionalTests.Domain.Bank")]
    public class Bank: Entity<Guid>
    {
        public virtual string Name { get; set; }

        public virtual string Description { get; set; }

        public virtual Address Address { get; set; }
        /// <summary>
        /// Form to be rendered on the details view
        /// </summary>
        public virtual FormConfiguration DetailsForm { get; set; }
    }
}
