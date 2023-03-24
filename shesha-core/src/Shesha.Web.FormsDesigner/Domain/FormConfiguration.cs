using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.NHibernate.Attributes;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Threading.Tasks;

namespace Shesha.Web.FormsDesigner.Domain
{
    /// <summary>
    /// Form configuration
    /// </summary>
    [Entity(TypeShortAlias = "Shesha.Core.FormConfiguration")]
    public class FormConfiguration : ConfigurationItemBase
    {
        public const string ItemTypeName = "form";

        /// <summary>
        /// Form markup
        /// </summary>
        [StringLength(int.MaxValue)]
        [Lazy]
        public virtual string Markup { get; set; }

        /// <summary>
        /// ModelType
        /// </summary>
        [StringLength(int.MaxValue)]
        public virtual string ModelType { get; set; }

        /// <summary>
        /// Type
        /// </summary>
        [StringLength(100)]
        public virtual string Type { get; set; }

        public override string ItemType => ItemTypeName;

        /// <summary>
        /// If true, indeicates that the form is a template
        /// </summary>
        public virtual bool IsTemplate { get; set; }

        /// <summary>
        /// Template that was used for the form creation
        /// </summary>
        public virtual FormConfiguration Template { get; set; }

        public override Task<IList<ConfigurationItemBase>> GetDependenciesAsync()
        {
            return Task.FromResult<IList<ConfigurationItemBase>>(new List<ConfigurationItemBase>());
        }

        public virtual string FullName => Configuration != null
            ? Configuration?.Module != null
                ? $"{Configuration.Module.Name}.{Configuration.Name}"
                : Configuration.Name
            : null;
    }
}
