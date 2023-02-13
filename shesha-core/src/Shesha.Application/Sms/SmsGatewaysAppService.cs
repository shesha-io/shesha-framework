using System.Collections.Generic;
using System.Linq;
using Abp.Application.Services;
using Abp.Reflection;
using Castle.Core.Internal;
using Microsoft.AspNetCore.Mvc;
using Shesha.Attributes;
using Shesha.Reflection;
using Shesha.Sms.Dtos;

namespace Shesha.Sms
{
    [Route("api/Sms/Gateways")]
    public class SmsGatewaysAppService: ApplicationService
    {
        private readonly ITypeFinder _typeFinder;

        public SmsGatewaysAppService(ITypeFinder typeFinder)
        {
            _typeFinder = typeFinder;
        }

        [HttpGet, Route("")]
        public List<SmsGatewayDto> GetAll()
        {
            var items = _typeFinder.Find(t => typeof(ISmsGateway).IsAssignableFrom(t))
                .Select(t => new
                {
                    Type = t,
                    ClassAttribute = t.GetAttribute<ClassUidAttribute>()
                })
                .Where(i => i.ClassAttribute != null)
                .OrderBy(i => i.Type.Name)
                .Select(t => new SmsGatewayDto
                {
                    Uid = t.ClassAttribute.Uid,
                    Alias = SmsUtils.GetGatewayAlias(t.Type),
                    Name = ReflectionHelper.GetDisplayName(t.Type),
                    Description = ReflectionHelper.GetDescription(t.Type)
                })
                .ToList();
            
            return items;
        }
    }
}
