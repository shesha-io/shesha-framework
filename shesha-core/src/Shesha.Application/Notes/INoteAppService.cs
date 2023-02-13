using Abp.Application.Services;
using Shesha.Application.Services.Dto;
using Shesha.Notes.Dto;
using System;

namespace Shesha.Notes
{
    public interface INoteAppService : IAsyncCrudAppService<NoteDto, Guid, FilteredPagedAndSortedResultRequestDto, CreateNoteDto, UpdateNoteDto>
    {
    }
}
