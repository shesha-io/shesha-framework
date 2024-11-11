import React, { FC, useState, useEffect, CSSProperties, useRef } from 'react';
import DateDisplay from '@/components/dateDisplay';
import { Skeleton, Card, List, Empty, Input, App, Button, Typography } from 'antd';
import { Comment } from '@/components/antd';
import { CheckOutlined, DeleteOutlined } from '@ant-design/icons';
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
  allowDelete
}) => {
  const [newComments, setNewComments] = useState('');
  const textRef = useRef(null);
  const { styles } = useStyles();
  const { notification } = App.useApp();

  useEffect(() => {
    if (!isPostingNotes && newComments) {
      setNewComments('');

      if (textRef) {
        textRef.current.focus();
      }
    }
  }, [isPostingNotes]);

  const handleSaveNotes = () => {
    if (!_.isEmpty(newComments?.trim())) {
      postNotes({
        noteText: newComments,
      });
    } else {
      notification.info({
        message: 'No new comments',
        description: 'Please make sure you have entered some notes before saving',
      });
    }
  };

  return (
    <div className={classNames(styles.notes, className)} style={style}>
      {showCommentBox && (
        <div className={styles.notesTextarea}>
          <Input.TextArea
            ref={textRef}
            rows={2}
            value={newComments}
            onChange={({ target: { value } }) => setNewComments(value)}
            disabled={isPostingNotes}
            onPressEnter={handleSaveNotes}
            autoSize={autoSize ? { minRows: 2 } : false}
          />
          {showSaveBtn && (
            <div className={classNames(styles.saveBtn, { right: buttonFloatRight })}>
              <Button
                size="small"
                type="primary"
                disabled={!newComments?.trim()}
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
            locale={{ emptyText: <Empty description="The are no notes" /> }}
            className={`${styles.commentList} scroll scroll-y`}
            style={{ ...commentListStyles }}
            itemLayout="horizontal"
            dataSource={_.orderBy(notes, ['creationTime'], ['desc']).map(({ noteText, author, creationTime, id }) => ({
              postedBy: (author?._displayName) || 'Unknown',
              content: (
                <div>
                  <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}>{noteText}</Paragraph>
                </div>
              ),
              postedDate: <DateDisplay date={creationTime} />,
              id,
            }))}
            renderItem={({ postedBy, id, content, postedDate }) => (
              <div className={styles.commentItemBody}>
                {allowDelete && <DeleteOutlined className={styles.deleteIcon} onClick={() => deleteNotes(id)} />}
                <Comment
                  className={styles.commentItem}
                  author={postedBy || 'Anonymous'}
                  content={content}
                  datetime={postedDate}
                />
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
