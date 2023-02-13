using Shesha.Domain.Attributes;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Domain.Enums
{
    [ReferenceList("Shesha.Framework", "PasswordResetMethods")]
    [Flags]
    public enum RefListPasswordResetMethods: long
    {
        [Display(Name = "Email Link")]
        EmailLink = 2,

        [Display(Name = "SMS OTP")]
        SMSOtp = 4,

        [Display(Name = "Security Questions")]
        SecurityQuestions = 8,
    }
}
