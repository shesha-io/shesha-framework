using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Runtime.Validation;
using Abp.Web.Models;
using Boxfusion.SheshaFunctionalTests.Common.Application.Services.Dto;
using Boxfusion.SheshaFunctionalTests.Common.Domain.Domain;
using Microsoft.IdentityModel.Tokens;
using Shesha;
using Shesha.DynamicEntities.Dtos;
using Shesha.Elmah;
using Shesha.Extensions;
using System.ComponentModel.DataAnnotations;
using System.Runtime.ExceptionServices;

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
        public async Task<DynamicDto<School, Guid>> CreateSchoolCustom(DynamicDto<School, Guid> input)
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

        public async Task<SchoolDto> GetSchool(Guid id)
        {
            var school = _schoolRepo.GetAll().Where(n => n.Id == id).Select(x => new SchoolDto
            {
                Id = x.Id,
                Name = x.Name,
                ContactNumber = x.ContactNumber,
            }).FirstOrDefault();
            return ObjectMapper.Map<SchoolDto>(school);
        }

        public async Task<List<SubjectDto>> GetSchoolSubjects(Guid id)
        {
            var school = _subjectRepo.GetAll().Where(n => n.School.Id == id).Select(x => new SubjectDto
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description,
            }).ToList();

            return ObjectMapper.Map<List<SubjectDto>>(school);
        }

        public void TestExceptionLogging()
        {
            /*
            using (LoggingScope.BeginScope(new ErrorReference("School", "B77F6E39-9E38-434C-8E3A-9826CACDAC31")))
            {
                using (LoggingScope.BeginScope(new ErrorReference("Book", "88375074-5659-4555-80C6-31FCA4041B9B"))) 
                {
                    throw new Exception("Test exception!");
                }                
            }
            */
            using (new WatchDog())
            {
                throw new Exception("Test exception!");
            }
            Console.WriteLine("Never run");
        }

        public void TestExceptionLogging2()
        {
            using (new WatchDog())
            {

            }
            Console.WriteLine("Always run");
        }

        [DontWrapResult]
        public void TestWatchDogLeak()
        {
            var school = new School();
            var wd = school.MakeWatchDog();

            using (var dog = LoggingScope.MakeEntityWatchDog(school))
            {

            }
        }

        public void TestWatchDogLeakWrap()
        {
            var school = new School();
            var wd = school.MakeWatchDog();

            using (var dog = LoggingScope.MakeEntityWatchDog(school))
            {

            }
        }

        public void TestWatchDog1()
        {
            var school = FakeSchool();
            using var wd = school.MakeWatchDog();
            throw new Exception("My test exception 1!");
        }

        public void TestWatchDog2()
        {
            var school = FakeSchool();
            using (school.MakeWatchDog()) 
            {
                throw new Exception("My test exception 2!");
            }
        }

        public void TestWatchDog3()
        {
            var school = FakeSchool();
            using (school.MakeWatchDog())
            {
            }
            throw new Exception("My test exception 3!");
        }

        public void TestWatchDog4()
        {
            var school = FakeSchool();
            using (school.MakeWatchDog())
            {
                try 
                {
                    throw new Exception("My test exception 4!");
                }
                catch (Exception e) 
                { 

                }
                throw new Exception("My test exception 5!");
            }            
        }

        private School FakeSchool() 
        {
            return new School { Id = Guid.NewGuid() };
        }

        private IDisposable BeginEntityScope<TEntity, TId>(TEntity entity) where TEntity : IEntity<TId> 
        {
            return null;
        }

        public ILoggingContextCollector LoggingScope { get; set; }
    }
}
