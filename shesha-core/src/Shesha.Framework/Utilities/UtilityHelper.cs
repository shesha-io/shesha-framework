using Shesha.AutoMapper.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Utilities
{
    public static class UtilityHelper
    {
        /// <summary>
        /// 
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="role"></param>
        /// <returns></returns>
        public static List<ReferenceListItemValueDto> GetMultiReferenceListItemValueList<T>(T role) where T : struct, IConvertible
        {
            var result = new List<ReferenceListItemValueDto>();

            if (role.ToString() == "0")
                return result;

            var flag = Enum.Parse(typeof(T), role.ToString()) as Enum;

            foreach (var r in (long[])Enum.GetValues(typeof(T)))
            {
                if ((Convert.ToInt32(flag) & r) == r)
                {
                    var nameValue = new ReferenceListItemValueDto()
                    {
                        Item = Enum.GetName(typeof(T), r),
                        ItemValue = r
                    };

                    result.Add(nameValue);
                }
            }
            return result;
        }
    }
}
