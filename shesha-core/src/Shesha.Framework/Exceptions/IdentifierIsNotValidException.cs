using System;

namespace Shesha.Exceptions
{
    /// <summary>
    /// Indicates that validation of the identifier failed
    /// </summary>
    public class IdentifierIsNotValidException: Exception
    {
        public string Identifier { get; private set; }

        public IdentifierIsNotValidException(string identifier): base($"Specified string '{identifier}' is not a valid identifier")
        {
            Identifier = identifier;
        }
    }
}
