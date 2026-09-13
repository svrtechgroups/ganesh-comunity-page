import * as ftp from 'basic-ftp';
import { Readable } from 'stream';
import path from 'path';

export type UploadUseCase =
  | 'leader_profile'
  | 'member_profile'
  | 'event_banner'
  | 'sponsor_logo'
  | 'media_gallery'
  | 'general';

/**
 * Usecase directory mapping:
 * e.g. leader_profile -> leaders/profiles/<name>_<timestamp>.<ext>
 */
export const UPLOAD_PATH_MAP: Record<
  UploadUseCase,
  {
    subDir: string;
    generateFilename: (name: string, ext: string) => string;
  }
> = {
  leader_profile: {
    subDir: 'leaders/profiles',
    generateFilename: (name, ext) => {
      const sanitized = sanitizeSlug(name || 'leader');
      const shortTs = Date.now().toString(36); // e.g. "l5xyz"
      return `${sanitized}_${shortTs}${ext}`;
    },
  },
  member_profile: {
    subDir: 'members/profiles',
    generateFilename: (name, ext) => {
      const sanitized = sanitizeSlug(name || 'member');
      const shortTs = Date.now().toString(36);
      return `${sanitized}_${shortTs}${ext}`;
    },
  },
  event_banner: {
    subDir: 'events/banners',
    generateFilename: (name, ext) => {
      const sanitized = sanitizeSlug(name || 'event');
      const shortTs = Date.now().toString(36);
      return `${sanitized}_${shortTs}${ext}`;
    },
  },
  sponsor_logo: {
    subDir: 'sponsors/logos',
    generateFilename: (name, ext) => {
      const sanitized = sanitizeSlug(name || 'sponsor');
      const shortTs = Date.now().toString(36);
      return `${sanitized}_${shortTs}${ext}`;
    },
  },
  media_gallery: {
    subDir: 'media/gallery',
    generateFilename: (name, ext) => {
      const sanitized = sanitizeSlug(name || 'media');
      const shortTs = Date.now().toString(36);
      return `${sanitized}_${shortTs}${ext}`;
    },
  },
  general: {
    subDir: 'uploads/general',
    generateFilename: (name, ext) => {
      const sanitized = sanitizeSlug(name || 'file');
      const shortTs = Date.now().toString(36);
      return `${sanitized}_${shortTs}${ext}`;
    },
  },
};

function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40) || 'upload';
}

export interface UploadResult {
  success: boolean;
  url: string;
  relativePath: string;
  filename: string;
  storageType: 'ftp';
  error?: string;
}

/**
 * Uploads a buffer via FTP using FTP_HOST, FTP_USER, FTP_PASSWORD.
 */
export async function uploadFileViaFTP(
  fileBuffer: Buffer,
  originalFilename: string,
  useCase: UploadUseCase = 'general',
  identifierName: string = 'file'
): Promise<UploadResult> {
  const ext = path.extname(originalFilename).toLowerCase() || '.jpg';
  const config = UPLOAD_PATH_MAP[useCase] || UPLOAD_PATH_MAP.general;
  const filename = config.generateFilename(identifierName, ext);
  const relativePath = `${config.subDir}/${filename}`;

  const ftpHost = process.env.FTP_HOST?.trim();
  const ftpUser = process.env.FTP_USER?.trim();
  const ftpPassword = process.env.FTP_PASSWORD?.trim();
  const ftpPort = parseInt(process.env.FTP_PORT || '21', 10);
  const ftpBaseUrl = process.env.FTP_BASE_URL?.trim() || 'https://mitrauk.com/uploads';
  const ftpRemoteRootDir = process.env.FTP_ROOT_DIR?.trim() || '';

  if (!ftpHost || !ftpUser || !ftpPassword) {
    return {
      success: false,
      url: '',
      relativePath: '',
      filename: '',
      storageType: 'ftp',
      error: 'FTP credentials (FTP_HOST, FTP_USER, FTP_PASSWORD) are not configured in environment.',
    };
  }

  const client = new ftp.Client(20000); // 20s timeout
  client.ftp.verbose = false;

  try {
    await client.access({
      host: ftpHost,
      user: ftpUser,
      password: ftpPassword,
      port: ftpPort,
      secure: process.env.FTP_SECURE === 'true',
    });

    // Target remote directory: e.g. public_html/uploads/leaders/profiles
    const targetRemoteDir = `${ftpRemoteRootDir}/${config.subDir}`.replace(/\/+/g, '/');
    await client.ensureDir(targetRemoteDir);

    const stream = Readable.from(fileBuffer);
    await client.uploadFrom(stream, filename);
    client.close();

    const publicUrl = `${ftpBaseUrl}/${config.subDir}/${filename}`.replace(/([^:]\/)\/+/g, '$1');

    return {
      success: true,
      url: publicUrl,
      relativePath,
      filename,
      storageType: 'ftp',
    };
  } catch (ftpError: any) {
    client.close();
    console.error('[FTP UPLOAD ERROR]:', ftpError);
    return {
      success: false,
      url: '',
      relativePath: '',
      filename: '',
      storageType: 'ftp',
      error: `FTP Upload failed: ${ftpError.message || 'Connection or permission error'}`,
    };
  }
}
