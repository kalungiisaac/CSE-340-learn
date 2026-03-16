import db from './db.js';

const getProjectsReport = async () => {
    const allProjectsQuery = `
        SELECT
            p.project_id,
            p.organization_id,
            o.name AS organization_name,
            p.title,
            p.description,
            p.location,
            p.project_date,
            p.created_at
        FROM public.service_project p
        JOIN public.organization o ON o.organization_id = p.organization_id
        ORDER BY o.name, p.project_date;
    `;

    const totalCountQuery = `
        SELECT COUNT(*) AS total_projects
        FROM public.service_project;
    `;

    const countByOrgQuery = `
        SELECT
            o.name,
            COUNT(p.project_id) AS project_count
        FROM public.organization o
        LEFT JOIN public.service_project p ON o.organization_id = p.organization_id
        GROUP BY o.organization_id, o.name
        ORDER BY project_count DESC;
    `;

    const upcomingQuery = `
        SELECT
            o.name AS organization,
            p.title,
            p.location,
            p.project_date,
            p.created_at
        FROM public.service_project p
        JOIN public.organization o ON o.organization_id = p.organization_id
        WHERE p.project_date >= CURRENT_DATE
        ORDER BY p.project_date
        LIMIT 10;
    `;

    const [totalRes, allRes, countRes, upcomingRes] = await Promise.all([
        db.query(totalCountQuery),
        db.query(allProjectsQuery),
        db.query(countByOrgQuery),
        db.query(upcomingQuery)
    ]);

    return {
        totalProjects: Number(totalRes.rows[0]?.total_projects ?? 0),
        projects: allRes.rows,
        projectsByOrg: countRes.rows,
        upcomingProjects: upcomingRes.rows
    };

};

// Get all categories for a given project
const getCategoriesByProjectId = async (projectId) => {
    const query = `
        SELECT c.category_id, c.name, c.description
        FROM public.category c
        JOIN public.project_categories pc ON c.category_id = pc.category_id
        WHERE pc.project_id = $1
        ORDER BY c.name;
    `;
    const result = await db.query(query, [projectId]);
    return result.rows;
};

const getUpcomingProjects = async (number_of_projects) => {
    const upcomingQuery = `
        SELECT
            p.project_id,
            p.title,
            p.description,
            p.project_date AS date,
            p.location,
            p.organization_id,
            o.name AS organization_name
        FROM public.service_project p
        JOIN public.organization o ON o.organization_id = p.organization_id
        WHERE p.project_date >= CURRENT_DATE
        ORDER BY p.project_date ASC
        LIMIT $1;
    `;

    const result = await db.query(upcomingQuery, [number_of_projects]);

    // If there are no future projects, fall back to the most recent projects so the page isn't empty
    if (result.rows.length === 0) {
        const fallbackQuery = `
            SELECT
                p.project_id,
                p.title,
                p.description,
                p.project_date AS date,
                p.location,
                p.organization_id,
                o.name AS organization_name
            FROM public.service_project p
            JOIN public.organization o ON o.organization_id = p.organization_id
            ORDER BY p.project_date DESC
            LIMIT $1;
        `;

        const fallbackResult = await db.query(fallbackQuery, [number_of_projects]);
        return fallbackResult.rows;
    }

    return result.rows;
};

const getProjectDetails = async (projectId) => {
    const query = `
        SELECT
            p.project_id,
            p.title,
            p.description,
            p.project_date AS date,
            p.location,
            p.organization_id,
            o.name AS organization_name
        FROM public.service_project p
        JOIN public.organization o ON o.organization_id = p.organization_id
        WHERE p.project_id = $1;
    `;

    const result = await db.query(query, [projectId]);
    return result.rows.length > 0 ? result.rows[0] : null;
};
const getProjectsByOrganizationId = async (organizationId) => {
      const query = `
        SELECT
          project_id,
          organization_id,
          title,
          description,
          location,
          project_date
        FROM service_project
        WHERE organization_id = $1
        ORDER BY project_date;
      `;
      
      const query_params = [organizationId];
      const result = await db.query(query, query_params);

      return result.rows;
};
// Export the model functions
export { getProjectsReport, getUpcomingProjects, getProjectDetails, getProjectsByOrganizationId, getCategoriesByProjectId };