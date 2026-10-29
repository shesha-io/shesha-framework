using Abp.Authorization;

namespace Shesha.Abp.Authorization
{
    public class SheshaAuthorizationException: AbpAuthorizationException
    {
        public SheshaAuthorizationException(string message): base(message) 
        { 
        }

        public SheshaAuthorizationException(): base()
        {
            
        }
    }
}
