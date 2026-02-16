using Abp.Runtime.Validation;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using System.Linq;

namespace Shesha.Validations
{
    /// <summary>
    /// Validation extensions
    /// </summary>
    public static class ValidationExtensions
    {
        /// <summary>
        /// Throw <see cref="AbpValidationException"/> if <paramref name="validationResults"/> has any errors
        /// </summary>
        /// <param name="validationResults">Validation results</param>
        /// <param name="errorMessage">Common error message</param>
        /// <exception cref="AbpValidationException"></exception>
        public static void ThrowValidationExceptionIfAny(this IList<ValidationResult>? validationResults, string errorMessage)
        { 
            if (validationResults != null && validationResults.Any())
                throw new AbpValidationException(errorMessage, validationResults);
        }

        /// <summary>
        /// Throw <see cref="AbpValidationException"/> if <paramref name="validationResults"/> has any errors
        /// </summary>
        /// <param name="validationResults">Validation results</param>
        /// <param name="localizer">Localizer, is used for localization of common error message</param>
        public static void ThrowValidationExceptionIfAny(this IList<ValidationResult>? validationResults, Func<string, string> localizer) 
        {
            validationResults.ThrowValidationExceptionIfAny(localizer(AppMessages.ValidationCorrectErrorsAndTryAgain));
        }

        /// <summary>
        /// Throw validation exception. When <paramref name="validationResults"/> is not empty uses `Correct errors and try again...` message, otherwise uses common `Something went wrong`
        /// Is used in cases when you are sure that something went wrong but details may be unavailable
        /// </summary>
        /// <param name="validationResults"></param>
        /// <param name="localizer"></param>
        /// <exception cref="AbpValidationException"></exception>
        [DoesNotReturn]
        public static void ThrowValidationException(this IList<ValidationResult>? validationResults, Func<string, string> localizer)
        {
            if (validationResults != null && validationResults.Any())
                throw new AbpValidationException(localizer(AppMessages.ValidationCorrectErrorsAndTryAgain), validationResults);
            else
                throw new AbpValidationException(localizer(AppMessages.ValidationSomethingWentWrong));
        }

        /// <summary>
        /// Throw exception if <paramref name="validationResults"/> has any errors
        /// Note: for single error throws <see cref="ArgumentException"/>, for multiple errors - <see cref="AggregateException"/>
        /// </summary>
        /// <param name="validationResults"></param>
        /// <exception cref="AbpValidationException"></exception>
        public static void ThrowArgumentExceptionIfAny(this IList<ValidationResult>? validationResults)
        {
            if (validationResults != null && validationResults.Any()) 
            {
                if (validationResults.Count() == 1)
                    throw ValidationResult2ArgumentException(validationResults.Single());
                else
                    throw new AggregateException(validationResults.Select(r => ValidationResult2ArgumentException(r)));
            }                
        }

        private static ArgumentException ValidationResult2ArgumentException(ValidationResult validationResult) 
        {
            return new ArgumentException(validationResult.ErrorMessage, validationResult.MemberNames.Delimited(", "));
        }
    }
}
