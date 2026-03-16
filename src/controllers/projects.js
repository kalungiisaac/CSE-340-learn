// Import any needed model functions
import { getUpcomingProjects, getProjectDetails, getCategoriesByProjectId } from '../models/projects.js';

const NUMBER_OF_UPCOMING_PROJECTS = 5;

// Define any controller functions

const showProjectsPage = async (req, res, next) => {
    try {
        const projects = await getUpcomingProjects(NUMBER_OF_UPCOMING_PROJECTS);


        const title = 'Upcoming Service Projects';
        res.render('projects', { title, projects });
    } catch (error) {
        next(error);
    }
};

const showProjectDetailsPage = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const project = await getProjectDetails(projectId);
        if (!project) {
            const err = new Error('Project not found');
            err.status = 404;
            throw err;
        }
        // Get categories for this project
        const categories = await getCategoriesByProjectId(projectId);
        const title = 'Service Project Details';
        res.render('project', { title, project, categories });
    } catch (error) {
        next(error);
    }
};

// Export any controller functions
export { showProjectsPage, showProjectDetailsPage };
