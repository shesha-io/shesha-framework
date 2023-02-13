import React, { FC, useState, useEffect, CSSProperties, useRef } from 'react';
import DateDisplay from '../dateDisplay';
import { Skeleton, Comment, Card, List, Empty, Input, notification, Button, Typography } from 'antd';
import { CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import { INote, ICreateNotePayload } from '../../providers/notes/contexts';
import _ from 'lodash';
import ShaDivider from '../shaDivider';
import classNames from 'classnames';

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
}) => {
  const [newComments, setNewComments] = useState('');
  const textRef = useRef(null);

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
    <div className={classNames('sha-notes', className)} style={style}>
      {showCommentBox && (
        <div className="notes-textarea">
          <Input.TextArea
            ref={textRef}
            rows={2}
            value={newComments}
            onChange={({ target: { value } }) => setNewComments(value)}
            disabled={isPostingNotes}
            onPressEnter={handleSaveNotes}
          />
          {showSaveBtn && (
            <div className="notes-textarea-save-btn">
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

      <Skeleton loading={isFetchingNotes} active paragraph={{ rows: 15 }}>
        <Card className={classNames('comment-list-card', commentListClassName)} size="small">
          <List
            locale={{ emptyText: <Empty description="The are no notes" /> }}
            className="comment-list scroll scroll-y"
            style={{ ...commentListStyles }}
            itemLayout="horizontal"
            dataSource={_.orderBy(notes, ['creationTime'], ['desc']).map(({ noteText, author, creationTime, id }) => ({
              postedBy: (author && author._displayName) || 'Unknown',
              content: (
                <div>
                  <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}>{noteText}</Paragraph>
                </div>
              ),
              postedDate: <DateDisplay date={creationTime} />,
              id,
            }))}
            renderItem={({ postedBy, id, content, postedDate }) => (
              <div className="comment-item-body">
                <DeleteOutlined onClick={() => deleteNotes(id)} />
                <Comment
                  author={postedBy || 'Anonymous'}
                  // avatar={item.avatar}
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
