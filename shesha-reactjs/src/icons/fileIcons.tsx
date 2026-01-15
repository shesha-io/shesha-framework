import React from 'react';
import { MusicNoteOutlined } from './musicNote';
import { FileExcelOutlined, FileImageOutlined, FilePdfOutlined, FilePptOutlined, FileTextOutlined, FileWordOutlined, FileZipOutlined, PaperClipOutlined } from '@ant-design/icons';
import { MovieOutlined } from './movieOutlined';
// file icons
const imageTypes = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
const videoTypes = ['.mp4', '.webm', '.ogg'];
const audioTypes = ['.mp3', '.wav', '.ogg', '.m4a'];
const compressedTypes = ['.zip', '.rar', '.tar'];

export const isImageType = (type: string): boolean => imageTypes.includes(type);
export const isVideoType = (type: string): boolean => videoTypes.includes(type);
export const isAudioType = (type: string): boolean => audioTypes.includes(type);

export const fileIcons = {
  ...Object.assign({}, ...imageTypes.map((type) => ({ [type]: { color: '#0083BE', icon: FileImageOutlined } }))),
  ...Object.assign({}, ...videoTypes.map((type) => ({ [type]: { color: '#FF6D01', icon: MovieOutlined, fill: true } }))),
  ...Object.assign({}, ...audioTypes.map((type) => ({ [type]: { color: '#8A4FFF', icon: MusicNoteOutlined, fill: true } }))),
  ...Object.assign({}, ...compressedTypes.map((type) => ({ [type]: { color: '#F9AA00', icon: FileZipOutlined } }))),
  '.pdf': { color: '#ED2224', icon: FilePdfOutlined },
  '.doc': { color: '#2B579A', icon: FileWordOutlined },
  '.docx': { color: '#2B579A', icon: FileWordOutlined },
  '.xls': { color: '#217346', icon: FileExcelOutlined },
  '.xlsx': { color: '#217346', icon: FileExcelOutlined },
  '.ppt': { color: '#D24726', icon: FilePptOutlined },
  '.pptx': { color: '#D24726', icon: FilePptOutlined },
  '.txt': { color: '#848588', icon: FileTextOutlined },
  '.csv': { color: '#848588', icon: FileTextOutlined },
  "default": { color: '#848588', icon: PaperClipOutlined },
};

export const getFileIcon = (type: string, iconSize?: string | number): JSX.Element => {
  const fileIcon = fileIcons[type] || fileIcons.default;
  const Icon = fileIcon.icon;
  const style = { color: fileIcon.color, fontSize: iconSize };

  return fileIcon.fill
    ? <Icon fill={fileIcon.color} style={style} />
    : <Icon style={style} />;
};