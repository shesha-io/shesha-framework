using Shesha.Domain.Attributes;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Core.OrganisationUnit")]
    public class OrganisationUnit : OrganisationBase<OrganisationUnit>
    {
        /*
        [StringLength(20)]
        [Display(Name = "Mobile Number")]
        public virtual string MobileNumber1 { get; set; }

        [StringLength(50), EmailAddress]
        [Display(Name = "Work Email Address")]
        public virtual string EmailAddress1 { get; set; }

        [Display(Name = "Email Address Confirmed")]
        public virtual bool EmailAddressConfirmed { get; set; }

        [Display(Name = "Mobile Number Confirmed")]
        public virtual bool MobileNumberConfirmed { get; set; }

        [Display(Name = "Authentication Guid")]
        [StringLength(36)]
        public virtual string AuthenticationGuid { get; set; }

        [Display(Name = "Authentication Guid Expiry Date")]
        public virtual DateTime? AuthenticationGuidExpiresOn { get; set; }
        */
    }
}
