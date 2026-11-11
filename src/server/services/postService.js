import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db';
export class PostService {
    static async listPosts(params) {
        const db = await getDb();
        const page = Math.max(1, params.page || 1);
        const limit = Math.min(50, Math.max(1, params.limit || 12));
        const offset = (page - 1) * limit;
        const conditions = [];
        const values = [];
        let pIdx = 1;
        // Status: por padrão lista apenas 'aberta' e 'em_andamento' no mural público, a menos que especificado
        if (params.status) {
            conditions.push(`p.status = $${pIdx++}`);
            values.push(params.status);
        }
        else if (!params.author_id) {
            conditions.push(`p.status IN ('aberta', 'em_andamento')`);
        }
        if (params.author_id) {
            conditions.push(`p.author_id = $${pIdx++}`);
            values.push(params.author_id);
        }
        if (params.intention) {
            conditions.push(`p.intention = $${pIdx++}`);
            values.push(params.intention);
        }
        if (params.opportunity_type_slug) {
            conditions.push(`p.opportunity_type_slug = $${pIdx++}`);
            values.push(params.opportunity_type_slug);
        }
        if (params.service_category_slug) {
            conditions.push(`p.service_category_slug = $${pIdx++}`);
            values.push(params.service_category_slug);
        }
        if (params.modality) {
            conditions.push(`p.modality = $${pIdx++}`);
            values.push(params.modality);
        }
        if (params.city) {
            conditions.push(`LOWER(p.city) LIKE LOWER($${pIdx++})`);
            values.push(`%${params.city.trim()}%`);
        }
        if (params.state) {
            conditions.push(`UPPER(p.state) = UPPER($${pIdx++})`);
            values.push(params.state.trim());
        }
        if (params.search) {
            conditions.push(`(p.title ILIKE $${pIdx} OR p.description ILIKE $${pIdx})`);
            values.push(`%${params.search.trim()}%`);
            pIdx++;
        }
        if (params.min_cents != null) {
            conditions.push(`(p.amount_cents >= $${pIdx} OR p.amount_max_cents >= $${pIdx})`);
            values.push(params.min_cents);
            pIdx++;
        }
        if (params.max_cents != null) {
            conditions.push(`(p.amount_cents <= $${pIdx} OR p.amount_min_cents <= $${pIdx})`);
            values.push(params.max_cents);
            pIdx++;
        }
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        // Contagem total
        const countSql = `SELECT COUNT(*) as total FROM posts p ${whereClause}`;
        const countRes = await db.query(countSql, values);
        const total = parseInt(countRes.rows[0].total, 10);
        const totalPages = Math.ceil(total / limit);
        // Ordenação
        let orderSql = 'ORDER BY p.created_at DESC';
        if (params.sort === 'deadline') {
            orderSql = 'ORDER BY p.deadline ASC NULLS LAST, p.created_at DESC';
        }
        // Consulta de registros
        const querySql = `
      SELECT p.*,
             u.username as author_username,
             pr.avatar_path as author_avatar_path,
             ot.name as opportunity_type_name,
             sc.name as service_category_name,
             (SELECT COUNT(*) FROM applications WHERE post_id = p.id) as applications_count
      FROM posts p
      JOIN users u ON u.id = p.author_id
      LEFT JOIN profiles pr ON pr.user_id = u.id
      JOIN opportunity_types ot ON ot.slug = p.opportunity_type_slug
      JOIN service_categories sc ON sc.slug = p.service_category_slug
      ${whereClause}
      ${orderSql}
      LIMIT $${pIdx++} OFFSET $${pIdx++}
    `;
        const postsRes = await db.query(querySql, [...values, limit, offset]);
        const postIds = postsRes.rows.map((r) => r.id);
        // Buscar imagens associadas
        let imagesMap = {};
        if (postIds.length > 0) {
            const placeholders = postIds.map((_, i) => `$${i + 1}`).join(',');
            const imgRes = await db.query(`SELECT * FROM post_images WHERE post_id IN (${placeholders}) ORDER BY is_cover DESC, order_index ASC`, postIds);
            imgRes.rows.forEach((img) => {
                if (!imagesMap[img.post_id])
                    imagesMap[img.post_id] = [];
                imagesMap[img.post_id].push({
                    id: img.id,
                    post_id: img.post_id,
                    image_url: img.image_path,
                    thumbnail_url: img.thumbnail_path,
                    is_cover: img.is_cover,
                    order_index: img.order_index,
                    created_at: img.created_at,
                });
            });
        }
        // Buscar dados do usuário logado (se salvou ou se candidatou)
        let userSavedSet = new Set();
        let userAppMap = {};
        if (params.currentUserId && postIds.length > 0) {
            const placeholders = postIds.map((_, i) => `$${i + 2}`).join(',');
            const savedRes = await db.query(`SELECT post_id FROM saved_posts WHERE user_id = $1 AND post_id IN (${placeholders})`, [params.currentUserId, ...postIds]);
            savedRes.rows.forEach((s) => userSavedSet.add(s.post_id));
            const appRes = await db.query(`SELECT post_id, status FROM applications WHERE applicant_id = $1 AND post_id IN (${placeholders})`, [params.currentUserId, ...postIds]);
            appRes.rows.forEach((a) => {
                userAppMap[a.post_id] = a.status;
            });
        }
        const posts = postsRes.rows.map((r) => ({
            id: r.id,
            author_id: r.author_id,
            author_username: r.author_username,
            author_avatar_url: r.author_avatar_path ? `/uploads/avatars/${r.author_avatar_path}` : null,
            origin_module: r.origin_module,
            intention: r.intention,
            title: r.title,
            description: r.description,
            opportunity_type_slug: r.opportunity_type_slug,
            opportunity_type_name: r.opportunity_type_name,
            service_category_slug: r.service_category_slug,
            service_category_name: r.service_category_name,
            modality: r.modality,
            city: r.city,
            state: r.state,
            compensation_type: r.compensation_type,
            amount_cents: r.amount_cents,
            amount_min_cents: r.amount_min_cents,
            amount_max_cents: r.amount_max_cents,
            amount_unit: r.amount_unit,
            deadline: r.deadline,
            status: r.status,
            version: r.version,
            created_at: r.created_at,
            updated_at: r.updated_at,
            images: imagesMap[r.id] || [],
            is_saved: userSavedSet.has(r.id),
            user_application_status: userAppMap[r.id] || null,
            applications_count: parseInt(r.applications_count, 10) || 0,
        }));
        return { posts, total, page, totalPages };
    }
    static async getPostById(postId, currentUserId) {
        const db = await getDb();
        const res = await db.query(`SELECT p.*,
              u.username as author_username,
              pr.avatar_path as author_avatar_path,
              ot.name as opportunity_type_name,
              sc.name as service_category_name,
              (SELECT COUNT(*) FROM applications WHERE post_id = p.id) as applications_count
       FROM posts p
       JOIN users u ON u.id = p.author_id
       LEFT JOIN profiles pr ON pr.user_id = u.id
       JOIN opportunity_types ot ON ot.slug = p.opportunity_type_slug
       JOIN service_categories sc ON sc.slug = p.service_category_slug
       WHERE p.id = $1
       LIMIT 1`, [postId]);
        if (res.rows.length === 0)
            return null;
        const r = res.rows[0];
        // Imagens
        const imgRes = await db.query(`SELECT * FROM post_images WHERE post_id = $1 ORDER BY is_cover DESC, order_index ASC`, [postId]);
        const images = imgRes.rows.map((img) => ({
            id: img.id,
            post_id: img.post_id,
            image_url: img.image_path,
            thumbnail_url: img.thumbnail_path,
            is_cover: img.is_cover,
            order_index: img.order_index,
            created_at: img.created_at,
        }));
        let isSaved = false;
        let userApplicationStatus = null;
        if (currentUserId) {
            const savedRes = await db.query(`SELECT 1 FROM saved_posts WHERE user_id = $1 AND post_id = $2`, [currentUserId, postId]);
            isSaved = savedRes.rows.length > 0;
            const appRes = await db.query(`SELECT status FROM applications WHERE applicant_id = $1 AND post_id = $2`, [currentUserId, postId]);
            if (appRes.rows.length > 0) {
                userApplicationStatus = appRes.rows[0].status;
            }
        }
        return {
            id: r.id,
            author_id: r.author_id,
            author_username: r.author_username,
            author_avatar_url: r.author_avatar_path ? `/uploads/avatars/${r.author_avatar_path}` : null,
            origin_module: r.origin_module,
            intention: r.intention,
            title: r.title,
            description: r.description,
            opportunity_type_slug: r.opportunity_type_slug,
            opportunity_type_name: r.opportunity_type_name,
            service_category_slug: r.service_category_slug,
            service_category_name: r.service_category_name,
            modality: r.modality,
            city: r.city,
            state: r.state,
            compensation_type: r.compensation_type,
            amount_cents: r.amount_cents,
            amount_min_cents: r.amount_min_cents,
            amount_max_cents: r.amount_max_cents,
            amount_unit: r.amount_unit,
            deadline: r.deadline,
            status: r.status,
            version: r.version,
            created_at: r.created_at,
            updated_at: r.updated_at,
            images,
            is_saved: isSaved,
            user_application_status: userApplicationStatus,
            applications_count: parseInt(r.applications_count, 10) || 0,
        };
    }
    static async createPost(authorId, data) {
        const db = await getDb();
        const postId = uuidv4();
        await db.query(`INSERT INTO posts (
         id, author_id, origin_module, intention, title, description,
         opportunity_type_slug, service_category_slug, modality, city, state,
         compensation_type, amount_cents, amount_min_cents, amount_max_cents,
         amount_unit, deadline, status, version
       )
       VALUES (
         $1, $2, $3, $4, $5, $6,
         $7, $8, $9, $10, $11,
         $12, $13, $14, $15,
         $16, $17, 'aberta', 1
       )`, [
            postId,
            authorId,
            data.origin_module || 'guilda',
            data.intention,
            data.title,
            data.description,
            data.opportunity_type_slug,
            data.service_category_slug,
            data.modality,
            data.city || null,
            data.state || null,
            data.compensation_type,
            data.amount_cents != null ? data.amount_cents : null,
            data.amount_min_cents != null ? data.amount_min_cents : null,
            data.amount_max_cents != null ? data.amount_max_cents : null,
            data.amount_unit || null,
            data.deadline || null,
        ]);
        const post = await this.getPostById(postId, authorId);
        if (!post)
            throw new Error('Erro ao criar publicação.');
        return post;
    }
    static async updatePost(postId, authorId, data) {
        const db = await getDb();
        const existing = await db.query(`SELECT author_id, status, version FROM posts WHERE id = $1`, [postId]);
        if (existing.rows.length === 0) {
            const err = new Error('Publicação não encontrada.');
            err.statusCode = 404;
            throw err;
        }
        if (existing.rows[0].author_id !== authorId) {
            const err = new Error('Apenas o autor pode editar esta publicação.');
            err.statusCode = 403;
            throw err;
        }
        if (existing.rows[0].status === 'encerrada') {
            const err = new Error('Publicações encerradas não podem ser editadas.');
            err.statusCode = 400;
            throw err;
        }
        await db.query(`UPDATE posts
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           modality = COALESCE($3, modality),
           city = COALESCE($4, city),
           state = COALESCE($5, state),
           compensation_type = COALESCE($6, compensation_type),
           amount_cents = COALESCE($7, amount_cents),
           amount_min_cents = COALESCE($8, amount_min_cents),
           amount_max_cents = COALESCE($9, amount_max_cents),
           amount_unit = COALESCE($10, amount_unit),
           deadline = COALESCE($11, deadline),
           version = version + 1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $12 AND author_id = $13`, [
            data.title !== undefined ? data.title : null,
            data.description !== undefined ? data.description : null,
            data.modality !== undefined ? data.modality : null,
            data.city !== undefined ? data.city : null,
            data.state !== undefined ? data.state : null,
            data.compensation_type !== undefined ? data.compensation_type : null,
            data.amount_cents !== undefined ? data.amount_cents : null,
            data.amount_min_cents !== undefined ? data.amount_min_cents : null,
            data.amount_max_cents !== undefined ? data.amount_max_cents : null,
            data.amount_unit !== undefined ? data.amount_unit : null,
            data.deadline !== undefined ? data.deadline : null,
            postId,
            authorId,
        ]);
        const post = await this.getPostById(postId, authorId);
        if (!post)
            throw new Error('Publicação não encontrada.');
        return post;
    }
    static async closePost(postId, userId, userRole) {
        const db = await getDb();
        const existing = await db.query(`SELECT author_id, status FROM posts WHERE id = $1`, [postId]);
        if (existing.rows.length === 0) {
            const err = new Error('Publicação não encontrada.');
            err.statusCode = 404;
            throw err;
        }
        const post = existing.rows[0];
        if (post.author_id !== userId && userRole !== 'administrador' && userRole !== 'moderador') {
            const err = new Error('Apenas o autor ou moderadores podem encerrar esta publicação.');
            err.statusCode = 403;
            throw err;
        }
        await db.query(`UPDATE posts
       SET status = 'encerrada', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`, [postId]);
    }
    static async toggleSave(postId, userId) {
        const db = await getDb();
        const check = await db.query(`SELECT id FROM saved_posts WHERE user_id = $1 AND post_id = $2`, [userId, postId]);
        if (check.rows.length > 0) {
            await db.query(`DELETE FROM saved_posts WHERE user_id = $1 AND post_id = $2`, [userId, postId]);
            return { saved: false };
        }
        else {
            await db.query(`INSERT INTO saved_posts (id, user_id, post_id) VALUES ($1, $2, $3)`, [uuidv4(), userId, postId]);
            return { saved: true };
        }
    }
    static async listSavedPosts(userId) {
        const db = await getDb();
        const res = await db.query(`SELECT post_id FROM saved_posts WHERE user_id = $1 ORDER BY created_at DESC`, [userId]);
        const postIds = res.rows.map((r) => r.post_id);
        if (postIds.length === 0)
            return [];
        const posts = [];
        for (const id of postIds) {
            const p = await this.getPostById(id, userId);
            if (p)
                posts.push(p);
        }
        return posts;
    }
}
