using Abp.Auditing;
using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using Shesha.JsonEntities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Domain
{
    /// <summary>
    /// Represents an invitation to a user or would-be user to
    /// associate with an `Organisation account`
    /// </summary>
    [Discriminator]
    public class AccountInvitation : FullAuditedEntity<Guid>
    {
        /// <summary>
        /// UTC Time stamp of when the invitation was sent 
        /// </summary>
        public virtual DateTime SentDate { get; set; }
        /// <summary>
        /// The person who sent the invitation
        /// </summary>
        public virtual Person SentBy { get; set; }
        /// <summary>
        /// The expiry date of the invitation
        /// </summary>
        public virtual DateTime? ExpiryDate { get; set; }

        /// <summary>
        /// Status of the account invitation
        /// </summary>
        [ReferenceList("Shesha.Core", "AccountInvitationStatus")]
        public virtual RefListAccountInvitationStatus? Status { get; set; }

        /// <summary>
        /// The url of the registration page to complete registration
        /// </summary>
        [MaxLength(2000)]
        public virtual string RegistrationUrl { get; set; }
        /// <summary>
        /// The email address to send the invitation to
        /// </summary>
        [MaxLength(200)]
        public virtual string Email { get; set; }
        /// <summary>
        /// The mobile number used to send the invitation or OTP to during the authentication process
        /// </summary>
        [MaxLength(20)]
        public virtual string MobileNumber { get; set; }

        /// <summary>
        /// The organisation the user should be linked to upon finalization of the registration
        /// </summary>
        public virtual Organisation Organisation { get; set; }
        /// <summary>
        /// The account the user should be linked to upon finalization of the registration.
        /// This is the account of the organisation the user should be linked to.
        /// </summary>
        public virtual Account Account { get; set; } 

        /// <summary>
        /// The first name of the invited user
        /// <br />
        /// <i>Use if person entity does not exist</i>
        /// </summary>
        [MaxLength(50)]
        public virtual string FirstName { get; set; }
        /// <summary>
        /// The last name of the invited user
        /// <br />
        /// <i>Use if person entity does not exist</i>
        /// </summary>
        [MaxLength(50)]
        public virtual string LastName { get; set; }

        /// <summary>
        /// The role (name) that should be assigned to the user upon finalization of the registration of the registration
        /// </summary>
        public virtual string RoleName { get; set; }
        /// <summary>
        /// The `Role` entity that should be assigned to the user upon finalization of the registration of the registration
        /// </summary>
        public virtual ShaRole Role { get; set; }
        /// <summary>
        /// The person entity the invitation the invitation is for if indeed a person entity already exists for the user.
        /// <br />
        /// This is optional, especially if the person entity does not exist yet. And the inviter only has the user's email address or mobile number.
        /// In which case, upon successful registration, the person entity and the user account will be created and linked.
        /// </summary>
        public virtual Person Person { get; set; }

        // <summary>
        // Role parameters can be stored in a list or as individual properties if they have specific meanings
        // TODO: Discuss get more clarity on the role parameters
        // </summary>
        // public virtual IList<string> RoleParameters { get; set; } = new List<string>();

        /// <summary>
        /// Allows for the storage of dynamic (additional data) in a structured format
        /// </summary>
        public virtual JsonEntity ExtensionJs { get; set; }

        /// <summary>
        /// Last OTP issued to finalize registration
        /// </summary>
        [MaxLength(12)]
        public virtual string RegistrationOTP { get; set; }
        /// <summary>
        /// The time by which the OTP should be used to finalize registration or else it expires
        /// </summary>
        public virtual DateTime? RegistrationOTPExpiry { get; set; }
        /// <summary>
        /// The time after which the registration would have expired.
        /// After the user has authenticated vai the selected method (email or mobile number), he/she will have a limited time to finalize the registration process.
        /// If they fail to complete the registration within the stipulated time, they will have to start again with OTP authentication.
        /// </summary>
        public virtual DateTime? RegistrationExpiry { get; set; }
    }
}
