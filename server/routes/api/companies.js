import { Router } from 'express';
import { createCompany, getCompanies, getCompanyById, updateCompany, deleteCompany, getTopResumes } from '../../controllers/companyController.js';
import auth from '../../middleware/auth.js';

const router = Router();

router.post(
    '/', 
    // auth, 
    createCompany
);
router.get(
    '/', 
    getCompanies
);
// router.get(
//     '/:id', 
//     getCompanyById
// );
// router.put(
//     '/:id', 
//     // auth, 
//     updateCompany
// );
// router.delete(
//     '/:id', 
//     // auth, 
//     deleteCompany
// );
// router.get(
//     '/:id/resumes', 
//     // auth, 
//     getTopResumes
// );

export default router;
