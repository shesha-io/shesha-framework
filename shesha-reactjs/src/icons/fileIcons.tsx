import React from 'react';
import { MusicNoteOutlined } from './musicNote';
import { FileExcelOutlined, FileImageOutlined, FilePdfOutlined, FilePptOutlined, FileTextOutlined, FileWordOutlined, FileZipOutlined, PaperClipOutlined } from '@ant-design/icons';
import { MovieOutlined } from './movieOutlined';
//file icons
const imageTypes = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
const videoTypes = ['.mp4', '.webm', '.ogg'];
const audioTypes = ['.mp3', '.wav', '.ogg'];
const compressedTypes = ['.zip', '.rar', '.tar'];

export const isImageType = (type) => imageTypes.includes(type);
export const isVideoType = (type) => videoTypes.includes(type);
export const isAudioType = (type) => audioTypes.includes(type);

export const fileIcons = {
    ...Object.assign({}, ...imageTypes.map(type => ({ [type]: { component: <FileImageOutlined style={{ color: '#0083BE', verticalAlign: 'middle' }} /> } }))),
    ...Object.assign({}, ...videoTypes.map(type => ({ [type]: { component: <MovieOutlined fill='#FF6D01' style={{ color: '#FF6D01', verticalAlign: 'middle' }} /> } }))),
    ...Object.assign({}, ...audioTypes.map(type => ({ [type]: { component: <MusicNoteOutlined fill='#8A4FFF' style={{ color: '#8A4FFF', verticalAlign: 'middle' }} /> } }))),
    ...Object.assign({}, ...compressedTypes.map(type => ({ [type]: { component: <FileZipOutlined style={{ color: '#F9AA00', verticalAlign: 'middle' }} /> } }))),
    '.pdf': { component: <FilePdfOutlined style={{ color: '#ED2224', verticalAlign: 'middle' }} /> },
    '.doc': { component: <FileWordOutlined style={{ color: '#2B579A', verticalAlign: 'middle' }} /> },
    '.docx': { component: <FileWordOutlined style={{ color: '#2B579A', verticalAlign: 'middle' }} /> },
    '.xls': { component: <FileExcelOutlined style={{ color: '#217346', verticalAlign: 'middle' }} /> },
    '.xlsx': { component: <FileExcelOutlined style={{ color: '#217346', verticalAlign: 'middle' }} /> },
    '.ppt': { component: <FilePptOutlined style={{ color: '#D24726', verticalAlign: 'middle' }} /> },
    '.pptx': { component: <FilePptOutlined style={{ color: '#D24726', verticalAlign: 'middle' }} /> },
    '.txt': { component: <FileTextOutlined style={{ color: '#848588', verticalAlign: 'middle' }} /> },
    '.csv': { component: <FileTextOutlined style={{ color: '#848588', verticalAlign: 'middle' }} /> },
    default: { component: <PaperClipOutlined style={{ color: '#848588', verticalAlign: 'middle' }} /> },
};

export const getFileIcon = (type: string) => {
    return fileIcons[type]?.component || fileIcons.default?.component;
};