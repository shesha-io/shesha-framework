import React, { FC, useState, useEffect, CSSProperties, useRef } from 'react';
import DateDisplay from '@/components/dateDisplay';
import { Skeleton, Card, List, Empty, Input, App, Button, Typography, Popconfirm } from 'antd';
import { Comment } from '@/components/antd';
import { CheckOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { INote, ICreateNotePayload } from '@/providers/notes/contexts';
import _ from 'lodash';
import ShaDivider from '@/components/shaDivider';
import classNames from 'classnames';
import { useStyles } from './styles/index.style';

const { Paragraph } = Typography;

export interface INotesRendererBaseProps {
  showSaveBtn?: boolean;
  showCommentBox?: boolean;
  commentListStyles?: CSSProperties;
  className?: string;
  commentListClassName?: string;
  style?: CSSProperties;
  isFetchingNotes?: boolean;
  isPostingNotes?: boolean;
  notes?: INote[];
  postNotes: (payload: ICreateNotePayload) => void;
  deleteNotes: (selectedCommentId: string) => void;
  buttonFloatRight?: boolean;
  autoSize?: boolean;
  allowDelete?: boolean;
  //new props
  showCharCount?: boolean;
  minLength?: number;
  maxLength?: number;
  onDeleteAction?: (note: INote) => void;
  onCreateAction?: (note: INote) => void;
  allowEdit?: boolean;
  updateNotes?: (payload: ICreateNotePayload) => void;
  onUpdateAction?: (note: ICreateNotePayload) => void;
}

export const NotesRendererBase: FC<INotesRendererBaseProps> = ({
  showCommentBox = true,
  commentListStyles,
  isFetchingNotes,
  isPostingNotes,
  postNotes,
  deleteNotes,
  className,
  style,
  notes,
  showSaveBtn = true,
  commentListClassName,
  buttonFloatRight,
  autoSize,
  allowDelete,
  showCharCount = false,
  minLength,
  maxLength,
  onCreateAction,
  allowEdit = true,
  updateNotes,
  onUpdateAction,
  onDeleteAction,
}) => {
  const [newComments, setNewComments] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState('');
  const [editCharCount, setEditCharCount] = useState(0);
  const [validationError, setValidationError] = useState('');
  const [editValidationError, setEditValidationError] = useState('');
  const textRef = useRef(null);
  const { styles } = useStyles();
  const { notification } = App.useApp();

  useEffect(() => {
    if (!isPostingNotes && newComments) {
      setNewComments('');
      setCharCount(0);
      setValidationError('');

      if (textRef) {
        textRef.current.focus();
      }
    }
  }, [isPostingNotes]);

  const handleTextChange = (value: string) => {
    setNewComments(value);
    setCharCount(value.length);

    // Validate min and max length
    let error = '';
    if (minLength && value.length < minLength) {
      error = `Minimum ${minLength} characters required`;
    } else if (maxLength && value.length > maxLength) {
      error = `Maximum ${maxLength} characters allowed`;
    }
    setValidationError(error);
  };

  const handleEditTextChange = (value: string) => {
    setEditedText(value);
    setEditCharCount(value.length);

    // Validate against max length
    if (maxLength && value.length > maxLength) {
      setEditValidationError(`Maximum ${maxLength} characters allowed`);
    } else {
      setEditValidationError('');
    }
  };

  const handleSaveNotes = () => {
    // Validate against min length
    if (minLength && newComments.length < minLength) {
      setValidationError(`Minimum ${minLength} characters required`);
      return;
    }

    if (!_.isEmpty(newComments?.trim())) {
      const payload = {
        noteText: newComments,
      };
      postNotes(payload);

      // Call onCreateAction after successful post
      if (onCreateAction) {
        // This would be called after the note is actually created in the success handler
      }
    } else {
      notification.info({
        message: 'No new comments',
        description: 'Please make sure you have entered some notes before saving',
      });
    }
  };

  const handleEditClick = (note: INote) => {
    setEditingId(note.id);
    setEditedText(note.noteText);
    setEditCharCount(note.noteText.length);
    setEditValidationError('');
  };

  const handleUpdate = (noteId: string) => {
    if (minLength && editedText.length < minLength) {
      setEditValidationError(`Minimum ${minLength} characters required`);
      return;
    }

    if (maxLength && editedText.length > maxLength) {
      setEditValidationError(`Maximum ${maxLength} characters allowed`);
      return;
    }

    if (!_.isEmpty(editedText?.trim())) {
      if (updateNotes) {
        const payload = {
          id: noteId,
          noteText: editedText,
        };
        updateNotes(payload);

        // Call onUpdateAction if provided
        if (onUpdateAction) {
          onUpdateAction(payload);
        }

        setEditingId(null);
        setEditedText('');
        setEditCharCount(0);
        setEditValidationError('');
      }
    } else {
      notification.warning({
        message: 'Empty note',
        description: 'Please enter some text before saving',
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedText('');
    setEditCharCount(0);
    setEditValidationError('');
  };

  const handleDelete = (note: INote) => {
    deleteNotes(note.id);
    if (onDeleteAction) {
      onDeleteAction({
        ...note,
        creationTime: note.creationTime || null,
        priority: note.priority || null,
        parentId: note.parentId || null,
      });
    }
  };

  const renderCharCounter = (count: number, error: string) => {
    if (!showCharCount) return null;

    return (
      <div className={styles.charCounter}>
        {count}
        {maxLength ? `/${maxLength}` : ''}
        {error && <span className={styles.errorText}>{error}</span>}
      </div>
    );
  };

  const renderEditControls = (note: INote) => (
    <div className={styles.editControls}>
      <Input.TextArea
        value={editedText}
        onChange={(e) => handleEditTextChange(e.target.value)}
        autoSize={{ minRows: 2 }}
        maxLength={maxLength}
      />
      {renderCharCounter(editCharCount, editValidationError)}
      <div className={styles.editButtons}>
        <Button
          size="small"
          type="primary"
          onClick={() => handleUpdate(note.id)}
          disabled={!editedText?.trim() || !!editValidationError}
        >
          Save
        </Button>
        <Button size="small" onClick={handleCancelEdit}>
          Cancel
        </Button>
      </div>
    </div>
  );

  return (
    <div className={classNames(styles.notes, className)} style={style}>
      {showCommentBox && (
        <div className={styles.notesTextarea}>
          <Input.TextArea
            ref={textRef}
            rows={2}
            value={newComments}
            onChange={({ target: { value } }) => handleTextChange(value)}
            disabled={isPostingNotes}
            onPressEnter={handleSaveNotes}
            autoSize={autoSize ? { minRows: 2 } : false}
            maxLength={maxLength}
            showCount={false} // We'll implement our own counter
          />
          {renderCharCounter(charCount, validationError)}
          {showSaveBtn && (
            <div className={classNames(styles.saveBtn, { right: buttonFloatRight })}>
              <Button
                size="small"
                type="primary"
                disabled={!newComments?.trim() || !!validationError}
                onClick={handleSaveNotes}
                loading={isPostingNotes}
                icon={<CheckOutlined />}
              >
                Save
              </Button>
            </div>
          )}
        </div>
      )}

      <Skeleton loading={isFetchingNotes} active>
        <Card className={classNames(styles.commentListCard, commentListClassName)} size="small">
          <List
            locale={{ emptyText: <Empty description="There are no notes" /> }}
            className={`${styles.commentList} scroll scroll-y`}
            style={{ ...commentListStyles }}
            itemLayout="horizontal"
            dataSource={_.orderBy(notes, ['creationTime'], ['desc']).map(({ noteText, author, creationTime, id }) => ({
              postedBy: author?._displayName || 'Unknown',
              content: (
                <div>
                  <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}>{noteText}</Paragraph>
                </div>
              ),
              postedDate: <DateDisplay date={creationTime} />,
              id,
              noteText,
              author,
              creationTime,
            }))}
            renderItem={({ postedBy, id, content, postedDate, noteText, author, creationTime }) => (
              <div className={styles.commentItemBody}>
                {allowDelete && editingId !== id && (
                  <Popconfirm
                    title="Delete Note"
                    description="Are you sure you want to delete this note?"
                    onConfirm={() =>
                      handleDelete({
                        id,
                        noteText,
                        author,
                        creationTime,
                        ownerId: '', 
                        ownerType: '',
                        category: '',
                      })
                    }
                    okText="Yes"
                    cancelText="No"
                    okButtonProps={{ type: 'primary', danger: true }}
                  >
                    <DeleteOutlined className={styles.deleteIcon} />
                  </Popconfirm>
                )}
                {allowEdit && editingId !== id && (
                  <EditOutlined
                    className={styles.editIcon}
                    onClick={() => handleEditClick({ id, noteText, author, creationTime } as INote)}
                  />
                )}
                {editingId === id ? (
                  renderEditControls({ id, noteText, author, creationTime } as INote)
                ) : (
                  <Comment
                    className={styles.commentItem}
                    author={postedBy || 'Anonymous'}
                    content={content}
                    datetime={postedDate}
                  />
                )}
                <ShaDivider />
              </div>
            )}
          />
        </Card>
      </Skeleton>
    </div>
  );
};

export default NotesRendererBase;
