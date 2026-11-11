import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { getDb } from '../db';

export class ImageService {
  static ensureUploadDirs() {
    fs.mkdirSync(config.avatarUploadDir, { recursive: true });
    fs.mkdirSync(config.postUploadDir, { recursive: true });
  }

  static async processAvatar(
    buffer: Buffer,
    userId: string
  ): Promise<{ filename: string; relativeUrl: string }> {
    this.ensureUploadDirs();

    // 1. Validar imagem e metadados com sharp
    const image = sharp(buffer);
    const metadata = await image.metadata();

    if (!metadata.format || !['jpeg', 'png', 'webp'].includes(metadata.format)) {
      const err = new Error('Formato de imagem inválido. Aceitos apenas JPEG, PNG e WebP.');
      (err as any).statusCode = 400;
      throw err;
    }

    const width = metadata.width || 0;
    const height = metadata.height || 0;
    if (width * height > config.maxMegapixels * 1_000_000) {
      const err = new Error('A imagem ultrapassa a resolução máxima permitida de 20 megapixels.');
      (err as any).statusCode = 400;
      throw err;
    }

    // 2. Buscar avatar anterior para remoção segura
    const db = await getDb();
    const prevRes = await db.query(`SELECT avatar_path FROM profiles WHERE user_id = $1`, [userId]);
    const oldAvatarPath = prevRes.rows[0]?.avatar_path;

    // 3. Processar: rotacionar se necessário (corrige EXIF), redimensionar para até 512x512, converter para WebP
    const filename = `${uuidv4()}.webp`;
    const targetPath = path.join(config.avatarUploadDir, filename);

    await sharp(buffer)
      .rotate()
      .resize(512, 512, { fit: 'cover', position: 'center' })
      .webp({ quality: 85 })
      .toFile(targetPath);

    // 4. Atualizar banco
    await db.query(
      `UPDATE profiles
       SET avatar_path = $1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2`,
      [filename, userId]
    );

    // 5. Apagar avatar antigo do disco se existia
    if (oldAvatarPath) {
      const oldDiskPath = path.join(config.avatarUploadDir, oldAvatarPath);
      if (fs.existsSync(oldDiskPath)) {
        try {
          fs.unlinkSync(oldDiskPath);
        } catch (_) {}
      }
    }

    return {
      filename,
      relativeUrl: `/uploads/avatars/${filename}`,
    };
  }

  static async removeAvatar(userId: string): Promise<void> {
    const db = await getDb();
    const res = await db.query(`SELECT avatar_path FROM profiles WHERE user_id = $1`, [userId]);
    const avatarPath = res.rows[0]?.avatar_path;

    await db.query(
      `UPDATE profiles SET avatar_path = NULL, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1`,
      [userId]
    );

    if (avatarPath) {
      const oldDiskPath = path.join(config.avatarUploadDir, avatarPath);
      if (fs.existsSync(oldDiskPath)) {
        try {
          fs.unlinkSync(oldDiskPath);
        } catch (_) {}
      }
    }
  }

  static async processPostImage(
    buffer: Buffer,
    userId: string,
    postId: string,
    orderIndex: number,
    isCover: boolean
  ): Promise<{ id: string; imagePath: string; thumbnailPath: string }> {
    this.ensureUploadDirs();

    const image = sharp(buffer);
    const metadata = await image.metadata();

    if (!metadata.format || !['jpeg', 'png', 'webp'].includes(metadata.format)) {
      const err = new Error('Formato de imagem inválido. Aceitos apenas JPEG, PNG e WebP.');
      (err as any).statusCode = 400;
      throw err;
    }

    const width = metadata.width || 0;
    const height = metadata.height || 0;
    if (width * height > config.maxMegapixels * 1_000_000) {
      const err = new Error('A imagem ultrapassa o limite de 20 megapixels.');
      (err as any).statusCode = 400;
      throw err;
    }

    const imageId = uuidv4();
    const baseName = `${postId}_${imageId}`;
    const mainFilename = `${baseName}_main.webp`;
    const thumbFilename = `${baseName}_thumb.webp`;

    const mainDiskPath = path.join(config.postUploadDir, mainFilename);
    const thumbDiskPath = path.join(config.postUploadDir, thumbFilename);

    // Processa versão principal (até 1600x1200) sem metadados
    await sharp(buffer)
      .rotate()
      .resize(1600, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(mainDiskPath);

    // Processa miniatura (até 400x300)
    await sharp(buffer)
      .rotate()
      .resize(400, 300, { fit: 'cover' })
      .webp({ quality: 80 })
      .toFile(thumbDiskPath);

    const db = await getDb();
    await db.query(
      `INSERT INTO post_images (id, post_id, owner_id, object_key, image_path, thumbnail_path, is_cover, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        imageId,
        postId,
        userId,
        mainFilename,
        `/uploads/posts/${mainFilename}`,
        `/uploads/posts/${thumbFilename}`,
        isCover,
        orderIndex,
      ]
    );

    return {
      id: imageId,
      imagePath: `/uploads/posts/${mainFilename}`,
      thumbnailPath: `/uploads/posts/${thumbFilename}`,
    };
  }

  static async deletePostImage(imageId: string, userId: string): Promise<void> {
    const db = await getDb();
    const res = await db.query(
      `SELECT object_key, image_path, thumbnail_path
       FROM post_images
       WHERE id = $1 AND owner_id = $2`,
      [imageId, userId]
    );

    if (res.rows.length === 0) {
      const err = new Error('Imagem não encontrada ou sem permissão.');
      (err as any).statusCode = 404;
      throw err;
    }

    const img = res.rows[0];
    await db.query(`DELETE FROM post_images WHERE id = $1`, [imageId]);

    const mainFile = path.basename(img.image_path);
    const thumbFile = path.basename(img.thumbnail_path);

    [mainFile, thumbFile].forEach((f) => {
      const diskPath = path.join(config.postUploadDir, f);
      if (fs.existsSync(diskPath)) {
        try {
          fs.unlinkSync(diskPath);
        } catch (_) {}
      }
    });
  }
}
