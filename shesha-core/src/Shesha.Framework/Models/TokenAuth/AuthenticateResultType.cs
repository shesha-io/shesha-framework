using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Models.TokenAuth
{
    public enum AuthenticateResultType
    {
        Success = 0,
        Redirect = 1,
        RedirectNoAuth = 2,
    }
}
