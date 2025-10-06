import empcontroller from '../controller/employee-controller.js';
import taskcontroller from '../controller/task-controller.js';
import express from 'express';
import bodyParser from 'body-parser';
import empauth from '../middleware/empauth.js'

import crypto from 'crypto';
import { error } from 'console';
const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());


// Status check route
router.get('/status', (req, res) => {
    res.status(200).json({ status: 'API is running smoothly' });
});

// Task list route
router.get('/list', taskcontroller.tasklist);

router.post('/register',  empcontroller.addemployee);

router.post('/login', empcontroller.loginemployee);

router.post('/send-reset-password-link', empcontroller.sendpasswordresetlink);

router.post('/reset-password', empcontroller.resetaccountpassword)

router.get('/getempdetails', empcontroller.getemployeedetails);

router.get('/searchusers', empcontroller.searchusers);

router.post('/postemployeedetails', empcontroller.updateemployeedetails);

export default router;