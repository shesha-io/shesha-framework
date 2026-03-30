import React, { FC, useState, useEffect, CSSProperties, useRef } from 'react';
import { Skeleton, Card, List, Empty, Input, Button } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import _ from 'lodash';
import classNames from 'classnames';
import { useStyles } from './styles/index.style';
import { CreateNoteArgs, DeleteNoteArgs, NoteModel, UpdateNoteArgs } from '@/providers/notes/models';
import { NoteRenderer } from './noteRenderer';
import { CharCounter } from './charCounter';
import { isNullOrWhiteSpace } from '@/utils/nullables';
import { getNoteValidationError } from './utils';

export interface INotesRendererBaseProps {
  notes?: NoteModel[];

  allowEdit?: boolean;
  allowDelete?: boolean;

  createNoteAsync: (args: CreateNoteArgs) => Promise<void>;
  updateNoteAsync: (args: UpdateNoteArgs) => Promise<void>;
  deleteNoteAsync: (args: DeleteNoteArgs) => Promise<void>;

  isFetchingNotes?: boolean;
  isPostingNotes?: boolean;

  showSaveBtn?: boolean;
  allowCreate?: boolean;
  commentListStyles?: CSSProperties;
  className?: string;
  commentListClassName?: string;
  style?: CSSProperties;
  buttonFloatRight?: boolean;
  autoSize?: boolean;
  showCharCount?: boolean;
  minLength?: number;
  maxLength?: number;
}

export const NotesRendererBase: FC<INotesRendererBaseProps> = ({
  notes,

  allowEdit = true,
  allowDelete,

  createNoteAsync,
  updateNoteAsync,
  deleteNoteAsync,

  isFetchingNotes,
  isPostingNotes,

  allowCreate: showCommentBox = true,
  commentListStyles,
  className,
  style,
  showSaveBtn = true,
  commentListClassName,
  buttonFloatRight,
  autoSize,
  showCharCount = false,
  minLength,
  maxLength,
}) => {
  const [newComment, setNewComment] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [validationError, setValidationError] = useState('');
  const textRef = useRef(null);
  const { styles } = useStyles();

  useEffect(() => {
    if (!isPostingNotes && newComment) {
      setNewComment('');
      setCharCount(0);
      setValidationError('');

      if (textRef) {
        textRef.current.focus();
      }
    }
  }, [isPostingNotes]);

  const handleTextChange = (value: string): void => {
    setNewComment(value);
    setCharCount(value.length);

    // Validate min and max length
    const error = getNoteValidationError(value, minLength, maxLength);
    setValidationError(error);
  };

  const handleSaveNotes = async (): Promise<void> => {
    const error = getNoteValidationError(newComment, minLength, maxLength);
    if (!isNullOrWhiteSpace(error)) {
      setValidationError(error);
      return;
    }

    try {
      await createNoteAsync({ noteText: newComment });

      setNewComment('');
      setCharCount(0);
      setValidationError('');
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  return (
    <div className={classNames(styles.notes, className)} style={style}>
      {showCommentBox && (
        <div className={styles.notesTextarea}>
          <Input.TextArea
            ref={textRef}
            rows={2}
            value={newComment}
            onChange={({ target: { value } }) => handleTextChange(value)}
            disabled={isPostingNotes}
            onPressEnter={handleSaveNotes}
            autoSize={autoSize ? { minRows: 2 } : false}
            maxLength={maxLength}
            showCount={false} // We'll implement our own counter
          />
          {showCharCount && <CharCounter count={charCount} maxLength={maxLength} error={validationError} />}
          {showSaveBtn && (
            <div className={classNames(styles.saveBtn, { right: buttonFloatRight })}>
              <Button
                size="small"
                type="primary"
                disabled={!newComment?.trim() || !!validationError}
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
          <List<NoteModel>
            locale={{ emptyText: <Empty description="There are no notes" /> }}
            className={`${styles.commentList} scroll scroll-y`}
            style={{ ...commentListStyles }}
            itemLayout="horizontal"
            dataSource={notes}
            renderItem={(note) => (
              <NoteRenderer
                note={note}
                allowEdit={allowEdit}
                allowDelete={allowDelete}
                updateNoteAsync={updateNoteAsync}
                deleteNoteAsync={deleteNoteAsync}
                minLength={minLength}
                maxLength={maxLength}
                showCharCount={showCharCount}
              />
            )}
          />
        </Card>
      </Skeleton>
    </div>
  );
};

export default NotesRendererBase;
