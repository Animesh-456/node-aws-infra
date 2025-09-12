import taskcontroller from '../controller/task-controller.js';
import express from 'express';
import bodyParser from 'body-parser';
const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
import empauth from '../middleware/empauth.js'
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads') // Uploads will be stored in the 'uploads/' directory
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname.substring(0, 6) + path.extname(file.originalname)); // Use the original fieldname with a unique suffix
    }
});

const upload = multer({ storage: storage });

// router.get('/users/:userId', userController.getUserById);

router.post('/addtask', upload.array('file', 10), taskcontroller.addtask)

router.get('/viewtasks-pending', empauth, taskcontroller.viewtaskPending)


router.get('/viewtasks-complete', empauth, taskcontroller.viewtaskComplete)

router.get('/viewtasks-unassigned', empauth, taskcontroller.viewtasks_unassigned)


router.get('/viewtasks-assigned', empauth, taskcontroller.viewtasks_assigned)


router.get('/recent-tasks', empauth, taskcontroller.recent_task)

router.get('/created-recent-tasks', empauth, taskcontroller.recent_task_created)

router.get('/viewtaskbyid', empauth, taskcontroller.viewstaskByid)


router.post('/updatetask', taskcontroller.updatetask)


router.post('/markdone', taskcontroller.markdone)

router.post('/deletetask', taskcontroller.deletetask)

router.post('/assigntask', taskcontroller.assigntask)


export default router;