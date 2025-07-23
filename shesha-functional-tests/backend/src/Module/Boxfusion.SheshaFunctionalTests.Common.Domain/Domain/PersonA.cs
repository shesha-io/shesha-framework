using Abp.Auditing;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain
{
    [DiscriminatorValue("Core.Person")]
    [Table("core_persons")]
    [Discriminator]
    public class PersonModuleA : FullPowerEntity
    {
        public string ModuleATestField { get; set; }

        [StringLength(13)]
        [Display(Name = "Identity Number")]
        public virtual string? IdentityNumber { get; set; }

        public virtual RefListPersonTitle? Title { get; set; }

        [StringLength(50)]
        [Display(Name = "First Name")]
        [Audited]
        public virtual string? FirstName { get; set; }

        [StringLength(50)]
        [Display(Name = "Last Name")]
        [Audited]
        public virtual string? LastName { get; set; }

        [Display(Name = "Middle Name")]
        [StringLength(50)]
        [Audited]
        public virtual string? MiddleName { get; set; }
    }

    [DiscriminatorValue("SheshaFunctionalTests.Member")]
    //[Table("core_persons")]
    public class PersonSuperModuleA : PersonModuleA
    {
    }

    [DiscriminatorValue("Core.Person")]
    public class PersonModuleB : Person
    {
        //public new virtual OrganisationTest? PrimaryOrganisation { get => base.PrimaryOrganisation as OrganisationTest; set => base.PrimaryOrganisation = value; }
    }

}
