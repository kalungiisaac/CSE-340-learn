import db from './db.js';

const tableExists = async (tableName) => {
    const result = await db.query(
        `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1) AS exists`,
        [tableName]
    );
    return result.rows[0]?.exists === true;
};

const getAllCategories = async () => {
    if (!(await tableExists('category'))) {
        throw new Error('Database table "category" does not exist');
    }

    const query = `
        SELECT category_id, name, description
        FROM public.category
        ORDER BY name;
    `;

    const result = await db.query(query);
    return result.rows;
};

// Get a single category by ID
const getCategoryById = async (categoryId) => {
    const query = `
        SELECT category_id, name, description
        FROM public.category
        WHERE category_id = $1;
    `;
    const result = await db.query(query, [categoryId]);
    return result.rows[0];
};

// Get all service projects for a given category
const getProjectsByCategoryId = async (categoryId) => {
    const query = `
        SELECT p.project_id, p.title, p.description, p.location, p.project_date, p.organization_id
        FROM public.service_project p
        JOIN public.project_categories pc ON p.project_id = pc.project_id
        WHERE pc.category_id = $1
        ORDER BY p.project_date;
    `;
    try {
        const result = await db.query(query, [categoryId]);
        return result.rows;
    } catch (error) {
        // If the join table doesn't exist yet, return an empty list instead of crashing.
        if (error.code === '42P01') {
            return [];
        }
        throw error;
    }
};

// Get categories for a specific project
const getCategoriesByServiceProjectId = async (projectId) => {
    const query = `
        SELECT c.category_id, c.name, c.description
        FROM public.category c
        JOIN public.project_categories pc ON c.category_id = pc.category_id
        WHERE pc.project_id = $1
        ORDER BY c.name;
    `;
    try {
        const result = await db.query(query, [projectId]);
        return result.rows;
    } catch (error) {
        if (error.code === '42P01') {
            return [];
        }
        throw error;
    }
};

const assignCategoryToProject = async (categoryId, projectId) => {
    const query = `
        INSERT INTO public.project_categories (category_id, project_id)
        VALUES ($1, $2);
    `;

    await db.query(query, [categoryId, projectId]);
}

const updateCategoryAssignments = async (projectId, categoryIds) => {
    // First, remove existing category assignments for the project
    const deleteQuery = `
        DELETE FROM public.project_categories
        WHERE project_id = $1;
    `;
    await db.query(deleteQuery, [projectId]);

    // Next, add the new category assignments
    for (const categoryId of categoryIds) {
        await assignCategoryToProject(categoryId, projectId);
    }
}

const createCategory = async (name, description) => {
    const query = `
        INSERT INTO public.category (name, description)
        VALUES ($1, $2)
        RETURNING category_id;
    `;
    const result = await db.query(query, [name, description]);
    return result.rows[0].category_id;
};

const updateCategory = async (categoryId, name, description) => {
    const query = `
        UPDATE public.category
        SET name = $1, description = $2
        WHERE category_id = $3
        RETURNING category_id;
    `;
    const result = await db.query(query, [name, description, categoryId]);
    if (result.rows.length === 0) {
        throw new Error('Category not found');
    }
    return result.rows[0].category_id;
};

export { getAllCategories, getCategoryById, getProjectsByCategoryId, getCategoriesByServiceProjectId, updateCategoryAssignments, createCategory, updateCategory };
