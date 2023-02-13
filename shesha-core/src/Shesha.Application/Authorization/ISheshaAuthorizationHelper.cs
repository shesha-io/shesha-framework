using System;
using System.Reflection;
using System.Threading.Tasks;

namespace Shesha.Authorization
{
    public interface ISheshaAuthorizationHelper
    {
        Task AuthorizeAsync(MethodInfo methodInfo, Type type);
    }
}