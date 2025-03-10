using System;

namespace Shesha.Exceptions
{
    public class UnitOfWorkUnavailableException: Exception
    {
        public UnitOfWorkUnavailableException(): base("Unit Of Work is unavailable")
        {
            
        }
    }
}
