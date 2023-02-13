using System;
using Abp.Dependency;
using Microsoft.AspNetCore.Mvc;
using Shesha.Authorization.Users;

namespace Shesha.Controllers
{
    /*
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class UsersAdministrationController: ControllerBase, ITransientDependency
    {
        public static DataTableConfig IndexTable()
        {
            var table = new DataTableConfig<User, Int64>("Users_Index");

            table.AddProperty(e => e.UserName);
            table.AddProperty(e => e.Name);
            table.AddProperty(e => e.Surname);
            table.AddProperty(e => e.EmailAddress);
            table.AddProperty(e => e.PhoneNumber);
            table.AddProperty(e => e.CreatorUser);
            table.AddProperty(e => e.CreatorUserId);
            table.AddProperty(e => e.CreationTime);
            table.AddProperty(e => e.IsActive);

            return table;
        }
    }
    */
}