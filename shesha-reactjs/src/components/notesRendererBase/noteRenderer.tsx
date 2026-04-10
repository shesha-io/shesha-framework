import React, { FC, useState } from 'react';
import DateDisplay from '@/components/dateDisplay';
import { Input, Button, Typography, Popconfirm } from 'antd';
import { Comment } from '@/components/antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import _ from 'lodash';
import ShaDivider from '@/components/shaDivider';
import { useStyles } from './styles/index.style';
import { useAuth } from '@/providers';
import { DeleteNoteArgs, NoteModel, UpdateNoteArgs } from '@/providers/notes/models';
import { CharCounter } from './charCounter';
import { getNoteValidationError } from './utils';

const { Paragraph } = Typography;

export type NoteRendererProps = {
  note: NoteModel;
  allowEdit: boolean;
  allowDelete: boolean;
  minLength?: number;
  maxLength?: number;
  showCharCount: boolean;
  updateNoteAsync: (args: UpdateNoteArgs) => Promise<void>;
  deleteNoteAsync: (args: DeleteNoteArgs) => Promise<void>;
};

export const NoteRenderer: FC<NoteRendererProps> = ({ note, allowEdit, allowDelete, minLength, maxLength, showCharCount, updateNoteAsync, deleteNoteAsync }) => {
  const { styles } = useStyles();
  const auth = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [editCharCount, setEditCharCount] = useState(0);
  const [editValidationError, setEditValidationError] = useState('');

  const handleEditTextChange = (value: string): void => {
    setEditedText(value);
    setEditCharCount(value.length);

    const error = getNoteValidationError(value, minLength, maxLength);
    setEditValidationError(error);
  };

  const handleEditClick = (): void => {
    setIsEditing(true);
    setEditedText(note.noteText);
    setEditCharCount(note.noteText.length);
    setEditValidationError('');
  };

  const handleSave = async (): Promise<void> => {
    const error = getNoteValidationError(editedText, minLength, maxLength);
    setEditValidationError(error);

    await updateNoteAsync({ id: note.id, noteText: editedText });

    setEditedText('');
    setEditCharCount(0);
    setEditValidationError('');
  };

  const handleCancelEdit = (): void => {
    setIsEditing(false);
    setEditedText('');
    setEditCharCount(0);
    setEditValidationError('');
  };

  const handleDelete = async (): Promise<void> => {
    await deleteNoteAsync({ id: note.id });
  };

  const userId = auth?.loginInfo?.personId;

  return (
    <div className={styles.commentItemBody}>
      {allowDelete && note.author?.id === userId && (
        <Popconfirm
          title="Delete Note"
          description="Are you sure you want to delete this note?"
          onConfirm={() => handleDelete()}
          okText="Yes"
          cancelText="No"
          okButtonProps={{ type: 'primary', danger: true }}
        >
          <DeleteOutlined className={styles.deleteIcon} />
        </Popconfirm>
      )}
      {allowEdit && !isEditing && note.author?.id === userId && (
        <EditOutlined
          className={styles.editIcon}
          onClick={() => handleEditClick()}
        />
      )}
      {isEditing ? (
        <div className={styles.editControls}>
          <Input.TextArea
            value={editedText}
            onChange={(e) => handleEditTextChange(e.target.value)}
            autoSize={{ minRows: 2 }}
            maxLength={maxLength}
          />
          {showCharCount && <CharCounter count={editCharCount} maxLength={maxLength} error={editValidationError} />}
          <div className={styles.editButtons}>
            <Button
              size="small"
              type="primary"
              onClick={() => handleSave()}
              disabled={!editedText?.trim() || !!editValidationError}
            >
              Save
            </Button>
            <Button size="small" onClick={handleCancelEdit}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Comment
          className={styles.commentItem}
          author={note.author?._displayName || 'Anonymous'}
          content={(
            <div>
              <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}>{note.noteText}</Paragraph>
            </div>
          )}
          datetime={<DateDisplay>{note.creationTime}</DateDisplay>}
        />
      )}
      <ShaDivider />
    </div>
  );
};
