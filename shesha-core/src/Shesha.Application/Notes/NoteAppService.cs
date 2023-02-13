using Abp.Domain.Repositories;
using NHibernate.Linq;
using Shesha.Application.Services.Dto;
using Shesha.Domain;
using Shesha.Notes.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Notes
{
    public class NoteAppService : SheshaCrudServiceBase<Note, NoteDto, Guid, FilteredPagedAndSortedResultRequestDto, CreateNoteDto, UpdateNoteDto>, INoteAppService
    {
        public NoteAppService(IRepository<Note, Guid> repository): base(repository)
        {
            
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="ownerType"></param>
        /// <returns></returns>
        //[HttpGet, Route("")]
        public async Task<List<NoteDto>> GetListAsync(GetListInput input)
        {
            var notes = await Repository.GetAll()
                .Where(c => c.OwnerId == input.OwnerId && c.OwnerType == input.OwnerType && (input.AllCategories || c.Category == input.Category))
                .OrderBy(c => c.CreationTime)
                .ToListAsync();
            return notes.Select(c => ObjectMapper.Map<NoteDto>(c)).ToList();
        }

        public override async Task<NoteDto> CreateAsync(CreateNoteDto input)
        {
            CheckCreatePermission();

            var entity = MapToEntity(input);
            entity.Author = await GetCurrentPersonAsync();
            
            await Repository.InsertAsync(entity);
            await CurrentUnitOfWork.SaveChangesAsync();

            return MapToEntityDto(entity);
        }
    }
}
