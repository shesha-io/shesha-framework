import React from 'react';
import { MusicNoteOutlined } from './musicNote';
import { FileExcelOutlined, FileImageOutlined, FilePdfOutlined, FilePptOutlined, FileTextOutlined, FileWordOutlined, FileZipOutlined, PaperClipOutlined } from '@ant-design/icons';
import { MovieOutlined } from './movieOutlined';
import { IconProps } from './interfaces';
import { isNullOrWhiteSpace } from '@/utils/nullables';
// file icons
const imageTypes = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
const videoTypes = ['.mp4', '.webm', '.ogg'];
const audioTypes = ['.mp3', '.wav', '.ogg', '.m4a'];
const compressedTypes = ['.zip', '.rar', '.tar'];

type FileTypeProps = {
  color: string;
  icon: React.FC<IconProps>;
  fill?: boolean;
};

export const isImageType = (type: string | null | undefined): boolean => !isNullOrWhiteSpace(type) && imageTypes.includes(type);
export const isVideoType = (type: string | null | undefined): boolean => !isNullOrWhiteSpace(type) && videoTypes.includes(type);
export const isAudioType = (type: string | null | undefined): boolean => !isNullOrWhiteSpace(type) && audioTypes.includes(type);

const DEFAULT_ICON: FileTypeProps = { color: '#848588', icon: PaperClipOutlined };

export const fileIcons: Record<string, FileTypeProps> = {
  '.pdf': { color: '#ED2224', icon: FilePdfOutlined },
  '.doc': { color: '#2B579A', icon: FileWordOutlined },
  '.docx': { color: '#2B579A', icon: FileWordOutlined },
  '.xls': { color: '#217346', icon: FileExcelOutlined },
  '.xlsx': { color: '#217346', icon: FileExcelOutlined },
  '.ppt': { color: '#D24726', icon: FilePptOutlined },
  '.pptx': { color: '#D24726', icon: FilePptOutlined },
  '.txt': { color: '#848588', icon: FileTextOutlined },
  '.csv': { color: '#848588', icon: FileTextOutlined },
  "default": DEFAULT_ICON,
};

const addFileTypes = (container: Record<string, FileTypeProps>, extensions: string[], mapper: (type: string) => FileTypeProps): void => {
  extensions.forEach((ext) => container[ext] = mapper(ext));
};
addFileTypes(fileIcons, imageTypes, () => ({ color: '#0083BE', icon: FileImageOutlined }));
addFileTypes(fileIcons, videoTypes, () => ({ color: '#FF6D01', icon: MovieOutlined, fill: true }));
addFileTypes(fileIcons, audioTypes, () => ({ color: '#8A4FFF', icon: MusicNoteOutlined, fill: true }));
addFileTypes(fileIcons, compressedTypes, () => ({ color: '#F9AA00', icon: FileZipOutlined }));

export const getFileIcon = (type: string, fontSize?: string | number): React.JSX.Element => {
  const fileIcon = fileIcons[type] || DEFAULT_ICON;
  const Icon = fileIcon.icon;
  const style = { color: fileIcon.color, fontSize };

  return fileIcon.fill
    ? <Icon fill={fileIcon.color} style={style} />
    : <Icon style={style} />;
};
