using System;

namespace Shesha.Exceptions
{
    /// <summary>
    /// Indicates that DBMS type is not specified
    /// </summary>
    public class DbmsTypeNotSpecified: Exception
    {
        public DbmsTypeNotSpecified(): base("DBMS type is not specified for the application")
        {

        }
    }
}
