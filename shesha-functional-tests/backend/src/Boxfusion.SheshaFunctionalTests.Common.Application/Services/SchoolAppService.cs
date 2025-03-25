using Abp.Domain.Repositories;
using Abp.Runtime.Validation;
using Boxfusion.SheshaFunctionalTests.Common.Application.Services.Dto;
using Boxfusion.SheshaFunctionalTests.Common.Domain.Domain;
using Shesha;
using Shesha.DynamicEntities.Dtos;
using Shesha.Reflection;
using System.ComponentModel.DataAnnotations;

namespace Boxfusion.SheshaFunctionalTests.Common.Application.Services
{
    public class SchoolsAppService : SheshaAppServiceBase
    {
        private readonly IRepository<School, Guid> _schoolRepo;
        private readonly IRepository<Subject, Guid> _subjectRepo;

        public SchoolsAppService(IRepository<School, Guid> schoolRepo, IRepository<Subject, Guid> subjectRepo)
        {
            _schoolRepo = schoolRepo;
            _subjectRepo = subjectRepo;
        }
        /// <summary>
        /// 
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        /// <exception cref="AbpValidationException"></exception>
        public async Task<DynamicDto<School, Guid>> CreateSchoolCustomAsync(DynamicDto<School, Guid> input)
        {
            var school = await SaveOrUpdateEntityAsync<School>(null, async item =>
            {
                var validationResults = new List<ValidationResult>();

                var result = await MapJObjectToEntityAsync<School, Guid>(input._jObject.NotNull(), item, validationResults);
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
        public async Task<DynamicDto<School, Guid>> UpdateSchoolCustomAsync(DynamicDto<School, Guid> input)
        {
            var school = await SaveOrUpdateEntityAsync<School>(input.Id, async item =>
            {
                var validationResults = new List<ValidationResult>();

                var result = await MapJObjectToEntityAsync<School, Guid>(input._jObject.NotNull(), item, validationResults);
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
        public async Task<DynamicDto<Subject, Guid>> CreateSubjectCustomAsync(DynamicDto<Subject, Guid> input)
        {
            var subject = await SaveOrUpdateEntityAsync<Subject>(null, async item =>
            {
                var validationResults = new List<ValidationResult>();

                var result = await MapJObjectToEntityAsync<Subject, Guid>(input._jObject.NotNull(), item, validationResults);
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
        public async Task<DynamicDto<Subject, Guid>> UpdateSubjectCustomAsync(DynamicDto<Subject, Guid> input)
        {
            var subject = await SaveOrUpdateEntityAsync<Subject>(input.Id, async item =>
            {
                var validationResults = new List<ValidationResult>();

                var result = await MapJObjectToEntityAsync<Subject, Guid>(input._jObject.NotNull(), item, validationResults);
                if (!result) throw new AbpValidationException("Please correct the errors and try again", validationResults);
            });
            return await MapToDynamicDtoAsync<Subject, Guid>(subject);
        }

        public Task<SchoolDto> GetSchoolAsync(Guid id)
        {
            var school = _schoolRepo.GetAll().Where(n => n.Id == id).Select(x => new SchoolDto
            {
                Id = x.Id,
                Name = x.Name,
                ContactNumber = x.ContactNumber,
            }).FirstOrDefault();
            return Task.FromResult(ObjectMapper.Map<SchoolDto>(school));
        }

        public Task<List<SubjectDto>> GetSchoolSubjectsAsync(Guid id)
        {
            var school = _subjectRepo.GetAll().Where(n => n.School.Id == id).Select(x => new SubjectDto
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description,
            }).ToList();
            return Task.FromResult(ObjectMapper.Map<List<SubjectDto>>(school));
        }
    }
}
