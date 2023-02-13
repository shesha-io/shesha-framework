using System;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Domain.Attributes
{
    [AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter, AllowMultiple = false)]
    public class PastAttribute : ValidationAttribute
    {
        public override string FormatErrorMessage(string name)
        {
            if (ErrorMessage == null && ErrorMessageResourceName == null)
            {
                ErrorMessage = "{0} should be in the past";
            }

            return base.FormatErrorMessage(name);
        }

        public override bool IsValid(object value)
        {
            if (value == null) return true;

            var date = Convert.ToDateTime(value);

            return date < DateTime.Now;
        }
    }
}
