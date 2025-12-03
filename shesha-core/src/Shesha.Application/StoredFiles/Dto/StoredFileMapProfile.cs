using Abp.Domain.Entities.Auditing;
using Abp.Domain.Repositories;
using AutoMapper;
using Shesha.Domain;
using Shesha.Extensions;
using Shesha.Services;
using Shesha.StoredFiles.Dto;
using System;
using System.Linq;

namespace Shesha.StoredFilters.Dtos
{
    public class StoredFileMapProfile: Profile
    {
        public StoredFileMapProfile()
        {
            CreateMap<StoredFile, StoredFileDto>()
                .ForMember(u => u.Name, options => options.MapFrom(e => e.FileName))
                .ForMember(u => u.FileCategory, options => options.MapFrom(e => e.Category))
                .ForMember(u => u.Size,
                    options => options.MapFrom(e => (e.LastVersion() ?? new StoredFileVersion()).FileSize))
                .ForMember(u => u.Url, options => options.MapFrom(e => e.GetFileUrl()));

            CreateMap<StoredFileVersion, StoredFileVersionInfoDto>()
                .ForMember(u => u.Size, options => options.MapFrom(e => e.FileSize))
                .ForMember(u => u.DateUploaded, options => options.MapFrom(e => e.CreationTime))
                .ForMember(u => u.UploadedBy, options => options.MapFrom(e => GetCreatorUserFullName(e)))
                .ForMember(u => u.Url, options => options.MapFrom(e => e.GetFileVersionUrl()));

            CreateMap<StoredFileReplacement, StoredFileReplacementDto>();
        }

        private static string? GetCreatorUserFullName(ICreationAudited entity)
        {
            if (entity.CreatorUserId == null)
                return null;

            var personService = StaticContext.IocManager.Resolve<IRepository<Person, Guid>>();
            var person = personService.GetAll().FirstOrDefault(p => p.User != null && p.User.Id == entity.CreatorUserId);
            return person?.FullName;
        }
    }
}
