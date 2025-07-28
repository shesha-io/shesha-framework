import React from 'react';
import { MusicNoteOutlined } from './musicNote';
import { FileExcelOutlined, FileImageOutlined, FilePdfOutlined, FilePptOutlined, FileTextOutlined, FileWordOutlined, FileZipOutlined, PaperClipOutlined } from '@ant-design/icons';
import { MovieOutlined } from './movieOutlined';
//file icons
const imageTypes = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
const videoTypes = ['.mp4', '.webm', '.ogg'];
const audioTypes = ['.mp3', '.wav', '.ogg', '.m4a'];
const compressedTypes = ['.zip', '.rar', '.tar'];

export const isImageType = (type) => imageTypes.includes(type);
export const isVideoType = (type) => videoTypes.includes(type);
export const isAudioType = (type) => audioTypes.includes(type);

export const fileIcons = {
    ...Object.assign({}, ...imageTypes.map(type => ({ [type]: { component: <FileImageOutlined style={{ color: '#0083BE' }} /> } }))),
    ...Object.assign({}, ...videoTypes.map(type => ({ [type]: { component: <MovieOutlined fill='#FF6D01' style={{ color: '#FF6D01' }} /> } }))),
    ...Object.assign({}, ...audioTypes.map(type => ({ [type]: { component: <MusicNoteOutlined fill='#8A4FFF' style={{ color: '#8A4FFF' }} /> } }))),
    ...Object.assign({}, ...compressedTypes.map(type => ({ [type]: { component: <FileZipOutlined style={{ color: '#F9AA00' }} /> } }))),
    '.pdf': { component: <FilePdfOutlined style={{ color: '#ED2224' }} /> },
    '.doc': { component: <FileWordOutlined style={{ color: '#2B579A' }} /> },
    '.docx': { component: <FileWordOutlined style={{ color: '#2B579A' }} /> },
    '.xls': { component: <FileExcelOutlined style={{ color: '#217346' }} /> },
    '.xlsx': { component: <FileExcelOutlined style={{ color: '#217346' }} /> },
    '.ppt': { component: <FilePptOutlined style={{ color: '#D24726' }} /> },
    '.pptx': { component: <FilePptOutlined style={{ color: '#D24726' }} /> },
    '.txt': { component: <FileTextOutlined style={{ color: '#848588' }} /> },
    '.csv': { component: <FileTextOutlined style={{ color: '#848588' }} /> },
    default: { component: <PaperClipOutlined style={{ color: '#848588' }} /> },
};

export const getFileIcon = (type: string) => {
    return fileIcons[type]?.component || fileIcons.default?.component;
};