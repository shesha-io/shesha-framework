import { IAnnotation } from './model';

function canSubmit(data: IAnnotation[], minPoints: number): boolean {
  const numberOfPoints = data?.filter(({ comment }) => !!comment)?.length;

  if (numberOfPoints < minPoints) {
    return false;
  }
  return true;
}

function parseIntOrDefault(input: string | number | undefined | null, defaultValue: number = 0): number {
  if (typeof (input) === 'number')
    return input;

  const parsed = parseInt(input, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

function getImageBits(imageUrl: string): Promise<string | ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', imageUrl, true);
    xhr.responseType = 'blob';
    xhr.onload = () => {
      if (xhr.status === 200) {
        const reader = new FileReader();
        reader.onload = () => {
          const binaryString = reader.result;
          resolve(binaryString);
        };
        reader.readAsBinaryString(xhr.response);
      } else {
        reject(new Error('Failed to load image'));
      }
    };
    xhr.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    xhr.send();
  });
}

function sortAnnotationData(data: IAnnotation[]): IAnnotation[] {
  let annotationLength = data?.length;
  const arrangedComments = data
    ?.filter((mark) => !!mark?.comment)
    ?.sort((a, b) => {
      const order = [...a.comment?.split('.'), ...b.comment?.split('.')];
      return parseInt(order[0], 10) - parseInt(order[2], 10);
    })
    ?.map(({ comment, ...rest }, index) => {
      const [, commt] = comment?.split('.');
      return {
        ...rest,
        comment: `${index + 1}.${commt}`,
      };
    });

  if (data[annotationLength - 1]) {
    if (!data[annotationLength - 1]?.comment) {
      arrangedComments.push(data[annotationLength - 1]);
    }
  }

  return arrangedComments;
}
function getViewData(data: IAnnotation[], allowAddingNotes = false): IAnnotation[] {
  let viewData = data?.map((mrk, index) => {
    return {
      ...mrk,
      comment: allowAddingNotes ? `${index + 1}.` : `${index + 1}.X`,
    };
  });

  return viewData;
}

export { parseIntOrDefault, sortAnnotationData, getViewData, canSubmit, getImageBits };
