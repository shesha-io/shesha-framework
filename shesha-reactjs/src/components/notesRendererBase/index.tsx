import React, { FC, useState, useEffect, CSSProperties, useRef } from 'react';
import { Skeleton, Card, List, Empty, Input, Button, GetRef } from 'antd';
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
  notes?: NoteModel[] | undefined;

  allowEdit?: boolean | undefined;
  allowDelete?: boolean | undefined;

  createNoteAsync: (args: CreateNoteArgs) => Promise<void>;
  updateNoteAsync: (args: UpdateNoteArgs) => Promise<void>;
  deleteNoteAsync: (args: DeleteNoteArgs) => Promise<void>;

  isFetchingNotes?: boolean | undefined;
  isPostingNotes?: boolean | undefined;

  showSaveBtn?: boolean | undefined;
  allowCreate?: boolean | undefined;
  commentListStyles?: CSSProperties | undefined;
  className?: string | undefined;
  commentListClassName?: string | undefined;
  style?: CSSProperties | undefined;
  buttonFloatRight?: boolean | undefined;
  autoSize?: boolean | undefined;
  showCharCount?: boolean | undefined;
  minLength?: number | undefined;
  maxLength?: number | undefined;
}

type TextAreaRef = GetRef<typeof Input.TextArea>;

const EMPTY_NOTES: NoteModel[] = [];

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
  const textRef = useRef<TextAreaRef>(null);
  const { styles } = useStyles();

  useEffect(() => {
    if (!isPostingNotes && newComment) {
      setNewComment('');
      setCharCount(0);
      setValidationError('');

      if (textRef.current) {
        textRef.current.focus();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
                disabled={isNullOrWhiteSpace(newComment) || !isNullOrWhiteSpace(validationError)}
                onClick={handleSaveNotes}
                loading={isPostingNotes ?? false}
                icon={<CheckOutlined />}
              >
                Save
              </Button>
            </div>
          )}
        </div>
      )}

      <Skeleton loading={isFetchingNotes ?? false} active>
        <Card className={classNames(styles.commentListCard, commentListClassName)} size="small">
          <List<NoteModel>
            locale={{ emptyText: <Empty description="There are no notes" /> }}
            className={`${styles.commentList} scroll scroll-y`}
            style={{ ...commentListStyles }}
            itemLayout="horizontal"
            dataSource={notes ?? EMPTY_NOTES}
            renderItem={(note) => (
              <NoteRenderer
                note={note}
                allowEdit={allowEdit}
                allowDelete={allowDelete ?? false}
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
