using Shesha.Domain.Attributes;
using System;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Domain.Enums
{
    [ReferenceList("Shesha.Framework", "PasswordResetMethods")]
    [Flags]
    public enum RefListPasswordResetMethods: long
    {
        [Display(Name = "Email Link")]
        EmailLink = 2,

        [Display(Name = "SMS OTP")]
        SmsOtp = 4,

        [Display(Name = "Security Questions")]
        SecurityQuestions = 8,
    }
}
