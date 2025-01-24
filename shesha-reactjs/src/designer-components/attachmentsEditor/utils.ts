const imageTypes = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
const videoTypes = ['.mp4', '.webm', '.ogg'];
const audioTypes = ['.mp3', '.wav', '.ogg'];

export const isImageType = (type) => imageTypes.includes(type);
export const isVideoType = (type) => videoTypes.includes(type);
export const isAudioType = (type) => audioTypes.includes(type);

export const fileIcons = {
    ...Object.assign({}, ...imageTypes.map(type => ({ [type]: { name: 'FileImageOutlined', color: '#0083BE' } }))),
    ...Object.assign({}, ...videoTypes.map(type => ({ [type]: { name: 'VideoCameraOutlined', color: '#848588' } }))),
    ...Object.assign({}, ...audioTypes.map(type => ({ [type]: { name: 'AudioOutlined', color: '#848588' } }))),
    '.pdf': { name: 'FilePdfOutlined', color: '#ED2224' },
    '.doc': { name: 'FileWordOutlined', color: '#2B579A' },
    '.docx': { name: 'FileWordOutlined', color: '#2B579A' },
    '.xls': { name: 'FileExcelOutlined', color: '#217346' },
    '.xlsx': { name: 'FileExcelOutlined', color: '#217346' },
    '.ppt': { name: 'FilePptOutlined', color: '#D24726' },
    '.pptx': { name: 'FilePptOutlined', color: '#D24726' },
    '.zip': { name: 'FileZipOutlined', color: '#F9AA00' },
    '.rar': { name: 'FileZipOutlined', color: '#F9AA00' },
    '.tar': { name: 'FileZipOutlined', color: '#F9AA00' },
    '.txt': { name: 'FileTextOutlined', color: '#848588' },
    '.csv': { name: 'FileTextOutlined', color: '#848588' },
    default: { name: 'PaperClipOutlined', color: '#848588' },
};