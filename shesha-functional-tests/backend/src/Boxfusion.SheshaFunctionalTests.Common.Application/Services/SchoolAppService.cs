using Abp.Runtime.Validation;
using Boxfusion.SheshaFunctionalTests.Common.Domain.Domain;
using Shesha;
using Shesha.DynamicEntities.Dtos;
using System.ComponentModel.DataAnnotations;

namespace Boxfusion.SheshaFunctionalTests.Common.Application.Services
{
    public class SchoolsAppService: SheshaAppServiceBase
    {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        /// <exception cref="AbpValidationException"></exception>
        public async Task<DynamicDto<School, Guid>> CreateSchoolCustom (DynamicDto<School, Guid> input)
        {
            var school = await SaveOrUpdateEntityAsync<School>(null, async item =>
            {
                var validationResults = new List<ValidationResult>();

                var result = await MapJObjectToEntityAsync<School, Guid>(input._jObject, item, validationResults);
                if (!result) throw new AbpValidationException("Please correct the errors and try again", validationResults);
            });
            return await MapToDynamicDtoAsync<School, Guid>(school);
        }
        
        /// <summary>
        /// 
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        /// <exception cref="AbpValidationException"></exception>
        public async Task<DynamicDto<School, Guid>> UpdateSchoolCustom(DynamicDto<School, Guid> input)
        {
            var school = await SaveOrUpdateEntityAsync<School>(input.Id, async item =>
            {
                var validationResults = new List<ValidationResult>();

                var result = await MapJObjectToEntityAsync<School, Guid>(input._jObject, item, validationResults);
                if (!result) throw new AbpValidationException("Please correct the errors and try again", validationResults);
            });
            return await MapToDynamicDtoAsync<School, Guid>(school);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        /// <exception cref="AbpValidationException"></exception>
        public async Task<DynamicDto<Subject, Guid>> CreateSubjectCustom(DynamicDto<Subject, Guid> input)
        {
            var subject = await SaveOrUpdateEntityAsync<Subject>(null, async item =>
            {
                var validationResults = new List<ValidationResult>();

                var result = await MapJObjectToEntityAsync<Subject, Guid>(input._jObject, item, validationResults);
                if (!result) throw new AbpValidationException("Please correct the errors and try again", validationResults);
            });
            return await MapToDynamicDtoAsync<Subject, Guid>(subject);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        /// <exception cref="AbpValidationException"></exception>
        public async Task<DynamicDto<Subject, Guid>> UpdateSubjectCustom(DynamicDto<Subject, Guid> input)
        {
            var subject = await SaveOrUpdateEntityAsync<Subject>(input.Id, async item =>
            {
                var validationResults = new List<ValidationResult>();

                var result = await MapJObjectToEntityAsync<Subject, Guid>(input._jObject, item, validationResults);
                if (!result) throw new AbpValidationException("Please correct the errors and try again", validationResults);
            });
            return await MapToDynamicDtoAsync<Subject, Guid>(subject);
        }
    }
}
