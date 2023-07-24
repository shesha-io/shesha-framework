using System;

namespace Shesha.Exceptions
{
    /// <summary>
    /// Indicates that DBMS type already specified for the application
    /// </summary>
    public class DbmsTypeAlreadySpecified: Exception
    {
        public DbmsTypeAlreadySpecified(): base("DBMS type already specified for the application")
        {

        }
    }
}
