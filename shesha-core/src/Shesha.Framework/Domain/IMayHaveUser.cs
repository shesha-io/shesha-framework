using Abp.Auditing;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Shesha.Authorization.Users;
using Shesha.ConfigurationItems;
using System;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Domain
{
    /// <summary>
    /// Setting value
    /// </summary>
    public interface IMayHaveUser
    {
        User User { get; set; }
    }
}
