import { type NextRequest } from 'next/server';
import fs from 'fs';

export interface FileContentResponse {
  exists: boolean;
  content?: string;
}

export const GET = (request: NextRequest): Response => {
  const searchParams = request.nextUrl.searchParams;
  const fileName = searchParams.get('fileName');

  const response: FileContentResponse = {
    exists: fs.existsSync(fileName),
  };
  if (response.exists) {
    response.content = fs.readFileSync(fileName, 'utf8');
  }

  return Response.json(response);
};
