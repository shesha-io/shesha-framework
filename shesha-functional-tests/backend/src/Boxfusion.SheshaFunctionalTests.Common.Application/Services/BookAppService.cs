using Abp.Domain.Repositories;
using Abp.Runtime.Validation;
using Boxfusion.SheshaFunctionalTests.Common.Domain.Domain;
using Shesha;
using Shesha.DynamicEntities.Dtos;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Boxfusion.SheshaFunctionalTests.Common.Application.Services
{
    public class BookAppService: SheshaAppServiceBase
    {
        public BookAppService()
        {
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        /// <exception cref="AbpValidationException"></exception>
        public async Task<DynamicDto<Book, Guid>> CreateBook(DynamicDto<Book, Guid> input)
        {
            var book = await SaveOrUpdateEntityAsync<Book>(null, async item =>
            {
                var validationResults = new List<ValidationResult>();

                var result = await MapJObjectToEntityAsync<Book, Guid>(input._jObject, item, validationResults);
                if (!result) throw new AbpValidationException("Please correct the errors and try again", validationResults);
            });
            return await MapToDynamicDtoAsync<Book, Guid>(book);
        }
    }
}
