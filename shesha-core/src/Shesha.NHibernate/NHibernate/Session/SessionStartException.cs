using System;

namespace Shesha.NHibernate.Session
{
    /// <summary>
    /// Session start exception
    /// </summary>
    public class SessionStartException: Exception
    {
        public SessionStartException()
        {

        }

        public SessionStartException(string message) : base(message)
        {

        }

        public SessionStartException(string message, Exception exception) : base(message, exception)
        {

        }
    }
}