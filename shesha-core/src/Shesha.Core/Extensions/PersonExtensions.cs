using Shesha.Domain;
using Shesha.Utilities;

namespace Shesha.Extensions
{
    /// <summary>
    /// Person extensions
    /// </summary>
    public static class PersonExtensions
    {
        /// <summary>
        /// Get email of the specified <paramref name="person"/>
        /// </summary>
        /// <param name="person">Person</param>
        /// <returns></returns>
        public static string GetEmail(this Person person) 
        {
            return StringHelper.FirstNotEmpty(person?.EmailAddress1, person?.EmailAddress2);
        }

        /// <summary>
        /// Get mobile number of the specified <paramref name="person"/>
        /// </summary>
        /// <param name="person">Person</param>
        /// <returns></returns>
        public static string GetMobileNumber(this Person person)
        {
            return StringHelper.FirstNotEmpty(person?.MobileNumber1, person?.MobileNumber2);
        }

        /// <summary>
        /// Get short name of person
        /// </summary>
        /// <param name="person">Person</param>
        /// <returns></returns>
        public static string GetShortName(this Person person)
        {
            return string.IsNullOrEmpty(person.CustomShortName)
                ? (string.IsNullOrEmpty(person.Initials)
                      ? (string.IsNullOrEmpty(person.FirstName) ? "" : ($" {person.FirstName[0]}" + " "))
                      : (person.Initials + " ")) +
                  person.LastName
                : person.CustomShortName;
        }
    }
}
