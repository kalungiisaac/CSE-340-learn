// Import any needed model functions
import { getProjectsReport } from '../models/projects.js';

// Define any controller functions
const showProjectsPage = async (req, res, next) => {
    try {
        const report = await getProjectsReport();
        const title = 'Projects';

        res.render('projects', { title, report });
    } catch (error) {
        next(error);
    }
};

// Export any controller functions
export { showProjectsPage };
