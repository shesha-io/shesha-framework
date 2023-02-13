using System.Collections.Generic;
using System.Linq;
using Abp.Application.Services;
using Abp.Reflection;
using Castle.Core.Internal;
using Microsoft.AspNetCore.Mvc;
using Shesha.Attributes;
using Shesha.Push.Dtos;
using Shesha.Reflection;

namespace Shesha.Push
{
    [Route("api/Push/Notifiers")]
    public class PushNotifiersAppService : ApplicationService
    {
        private readonly ITypeFinder _typeFinder;

        public PushNotifiersAppService(ITypeFinder typeFinder)
        {
            _typeFinder = typeFinder;
        }

        [HttpGet, Route("")]
        public List<PushNotifierDto> GetAll()
        {
            var items = _typeFinder.Find(t => typeof(IPushNotifier).IsAssignableFrom(t))
                .Select(t => new
                {
                    Type = t,
                    ClassAttribute = t.GetAttribute<ClassUidAttribute>()
                })
                .Where(i => i.ClassAttribute != null)
                .OrderBy(i => i.Type.Name)
                .Select(t => new PushNotifierDto
                {
                    Uid = t.ClassAttribute.Uid,
                    Name = ReflectionHelper.GetDisplayName(t.Type),
                    Description = ReflectionHelper.GetDescription(t.Type)
                })
                .ToList();
            
            return items;
        }
    }
}
