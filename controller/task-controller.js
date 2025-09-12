import employee from '../schema/employee-schema.js';
import task from '../schema/task-chema.js';
import sendmail from '../helpers/mail.js';
import updateTask from '../helpers/globalmail/update-task.js';
import assignTask from '../helpers/globalmail/asssign-task.js'
import markDone from '../helpers/globalmail/mark-done.js';
import { isObjectIdOrHexString } from 'mongoose';


const taskcontroller = {



  tasklist: async (req, res) => {
    try {
      // Fetch recent tasks
      let tasks = await task.find().sort({ createdAt: -1 }).limit(10);
     return res.status(200).json({ data: tasks, message: 'Task list fetched successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  addtask: async (req, res) => {
    const tk = req.body;

    const fileNames = req.files.map(file => file.filename);
    
    try {
      let data = {
        title: tk.title,
        description: tk.description,
        assignedBy: tk.assignedBy,
        files: fileNames
      }
      let create = new task(data);
      await create.save();
      return res.status(201).json({ data: create, message: 'Task Added' });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },


  viewtaskPending: async (req, res) => {


    const userId = req.query.id;
    const pageNumber = req.query.pageNumber;
    const pageSize = 10;
    const offset = (pageNumber - 1) * pageSize;


    try {
      const tks = await task.aggregate([
        {
          $match:
          {
            $and: [
              { $expr: { $eq: ['$assignedTo', { $toObjectId: userId }] } },
              { status: 'pending' }
            ]
          }

        },


        {
          $lookup: {
            from: "employees",
            localField: "assignedBy",
            foreignField: "_id",
            as: "assignedByDetails",
          }
        },
        {
          $project: {
            "assignedByDetails.password": 0,
          }
        },

        {
          $facet: {
            task: [
              { $sort: { createdAt: -1 } },
              { $skip: offset },
              { $limit: pageSize },
              {
                $match: {
                  $and: [

                    { $expr: { $eq: ['$assignedTo', { $toObjectId: userId }] } },
                    { status: 'pending' }
                  ]
                }

              },
            ],
            totalCount: [
              { $count: 'count' }
            ]
          }
        }
      ])

      // Total Count of the documents for pagination logic
      console.log("Actual task is : - ", tks[0])
      console.log("tsks : -", tks[0]?.totalCount[0]?.count)


      const TotalPages = Math.ceil(tks[0]?.totalCount[0]?.count / pageSize);
      //return { tks, TotalPages }

      return res.status(201).json({ tks: tks, TotalPages: TotalPages, message: 'Task fetched!' });
    } catch (error) {
      return res.status(401).json({ error: 'Internal server error' });
    }
  },



  viewtaskComplete: async (req, res) => {



    const userid = req.query.id;
    const pageNumber = req.query.pageNumber;
    const pageSize = 10;
    const offset = (pageNumber - 1) * pageSize;


    try {
      const tks = await task.aggregate([
        {
          $match:
          {
            $and: [
              { $expr: { $eq: ['$assignedTo', { $toObjectId: userid }] } },
              { status: 'complete' }
            ]
          }

        },


        {
          $lookup: {
            from: "employees",
            localField: "assignedBy",
            foreignField: "_id",
            as: "assignedByDetails",
          }
        },
        {
          $project: {
            "assignedByDetails.password": 0,
          }
        },

        {
          $facet: {
            task: [
              { $sort: { createdAt: -1 } },
              { $skip: offset },
              { $limit: pageSize },
              {
                $match: {
                  $and: [

                    { $expr: { $eq: ['$assignedTo', { $toObjectId: userid }] } },
                    { status: 'complete' }
                  ]
                }

              },
            ],
            totalCount: [
              { $count: 'count' }
            ]
          }
        }
      ])

      // Total Count of the documents for pagination logic
      console.log("Actual task is : - ", tks[0])
      console.log("tsks : -", tks[0]?.totalCount[0]?.count)


      const TotalPages = Math.ceil(tks[0]?.totalCount[0]?.count / pageSize);
      //return { tks, TotalPages }
      return res.status(201).json({ tks: tks, TotalPages: TotalPages, message: 'Fetched successfully!' });
    } catch (error) {
      console.log("catch error !")
      return res.status(500).json({ error: 'Internal server error' });
    }
  },



  viewstaskByid: async (req, res) => {
    try {
      let tasks = await task.find({ _id: req.query.id }).populate({
        path: 'assignedTo assignedBy',
        select: 'fname lname email account_type'
      })
      // return tasks
      return res.status(201).json({ data: tasks, message: 'Fetched successgully!' });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },




  updatetask: async (req, res) => {
    try {
      var ty = await task.findByIdAndUpdate({ _id: req.body.id }, { $set: { title: req.body.title, description: req.body.description } }, { new: true })
      // let result = await task.findByIdAndUpdate({ _id: tk.id }, { title: tk.title, description: tk.description }, { new: true })
      // let mailtosend = await employee.findOne({ _id: result.assignedTo })
      // let mail = updateTask(mailtosend.fname, result._id, result.title, result.description)
      // const subject = mail.subject
      // const text2 = mail.body
      //sendmail(mailtosend.email, subject, text2)
      return res.status(201).json({ data: ty, message: 'Task Updated!' });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
  deletetask: async (req, res) => {
    const tk = req.body
    console.log("task id :-->", tk?.id)
    try {
      let tasks = await task.findByIdAndDelete({ _id: tk.id })
      return res.status(201).json({ data: tasks, message: 'Task Deleted' });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
  assigntask: async (req, res) => {

    const tk = req?.body

    try {
      let result = await task.findByIdAndUpdate({ _id: tk.id.toString() }, { assignedTo: tk.assignedTo.toString() }, { new: true })
      let mailtosend = await employee.findOne({ _id: result.assignedTo })
      let mailfrom = await employee.findOne({ _id: result.assignedBy })
      let mail = await assignTask(mailtosend.fname, result._id, result.title, result.description, mailfrom.fname)
      const subject = mail.subject
      const text = mail.body
      await sendmail(mailtosend.email, subject, text)
      return res.status(201).json({ data: result, message: 'Task Assigned!' });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
  recent_task: async (req, res) => {
    try {
      let tasks = await task.find({ assignedTo: req.query.id }).sort({ createdAt: -1 }).limit(10).populate({
        path: 'assignedTo assignedBy',
        select: 'fname lname email account_type username',
      })
      //console.log("controller task", tasks)
      return res.status(201).json({ data: tasks, message: 'Task fetched !' });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
  markdone: async (req, res) => {
    const tk = req.body;
    try {
      let result = await task.findByIdAndUpdate({ _id: tk.params }, { status: 'complete' }, { new: true })
      let mailtosend = await employee.findOne({ _id: result.assignedBy })
      let empname = await employee.findOne({ _id: result.assignedTo })
      console.log(empname.fname)
      let mail = markDone(mailtosend.fname, result._id, result.title, result.description, empname.fname)
      const subject = mail.subject
      const text2 = mail.body
      await sendmail(mailtosend.email, subject, text2)
      return res.status(201).json({ data: result, message: 'Task marked done !' });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
  recent_task_created: async (req, res) => {
    try {
      let tasks = await task.find({ assignedBy: req.query.id }).sort({ createdAt: -1 }).limit(10).populate({
        path: 'assignedTo assignedBy',
        select: 'fname lname email account_type username',
      })
      //console.log("controller task", tasks)
      //return tasks
      return res.status(201).json({ data: tasks, message: 'Task fetched !' });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
  viewtasks_unassigned: async (req, res) => {

    const userid = req.query.id;
    const pageNumber = req.query.page;
    const pageSize = 10;
    const offset = (pageNumber - 1) * pageSize;

    try {
      const tks = await task.aggregate([
        {
          $match:
          {
            $and: [
              { $expr: { $eq: ['$assignedBy', { $toObjectId: userid }] } },
              { assignedTo: null }
            ]
          }

        },
        {
          $lookup: {
            from: "employees",
            localField: "assignedBy",
            foreignField: "_id",
            as: "assignedByDetails",
          }
        },
        {
          $project: {
            "assignedByDetails.password": 0,
          }
        },

        {
          $facet: {
            task: [
              { $sort: { createdAt: -1 } },
              { $skip: offset },
              { $limit: pageSize },
              {
                $match: {
                  $and: [

                    { $expr: { $eq: ['$assignedBy', { $toObjectId: userid }] } },
                    { assignedTo: null }
                  ]
                }
              },
            ],
            totalCount: [
              { $count: 'count' }
            ]
          }
        }
      ])

      // Total Count of the documents for pagination logic
      //console.log("Actual task is : - ", tks[0])
      //console.log("tsks : -", tks[0]?.totalCount[0]?.count)




      const TotalPages = Math.ceil(tks[0]?.totalCount[0]?.count / pageSize);
      //return { tks, TotalPages }
      return res.status(201).json({ tks: tks, TotalPages: TotalPages, message: 'Task fetched!' });

    } catch (error) {
      console.log("catch error !")
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
  viewtasks_assigned: async (req, res) => {
    const userid = req.query.id;
    const pageNumber = req.query.page;
    const pageSize = 10;
    const offset = (pageNumber - 1) * pageSize;
    try {
      const tks = await task.aggregate([
        {
          $match:
          {
            $and: [
              { $expr: { $eq: ['$assignedBy', { $toObjectId: userid }] } },
              { assignedTo: { $ne: null } }
            ]
          }

        },

        // {
        //   $lookup: {
        //     from: "employees",
        //     let: { assignedBy: '$assignedBy', assignedTo: '$assignedTo' }, // Define local variables
        //     pipeline: [
        //       {
        //         $match: {
        //           $expr: {
        //             $and: [
        //               { $eq: ['$assignedBy', '$assignedBy'] }, // Join condition for assignedBy field
        //               { $eq: ['$assgnedTo', '$assignedTo'] },

        //             ]
        //           }

        //         }
        //       }
        //     ],
        //     as: "assignedDetails" // Output array field containing matching documents
        //   }
        // },

        {
          $lookup: {
            from: "employees",
            localField: "assignedBy",
            foreignField: "_id",
            as: "assignedByDetails",
          }
        },

        {
          $lookup: {
            from: "employees",
            localField: "assignedTo",
            foreignField: "_id",
            as: "assignedToDetails",
          }
        },

        {
          $facet: {
            task: [
              { $sort: { createdAt: -1 } },
              { $skip: offset },
              { $limit: pageSize },
              {
                $match: {
                  $and: [

                    { $expr: { $eq: ['$assignedBy', { $toObjectId: userid }] } },
                    { assignedTo: { $ne: null } }
                  ]
                }



              },
            ],
            totalCount: [
              { $count: 'count' }
            ],



          },


        },




      ])

      // Total Count of the documents for pagination logic
      //console.log("Actual task is : - ", tks)
      //console.log("tsks : -", tks[0]?.totalCount[0]?.count)




      const TotalPages = Math.ceil(tks[0]?.totalCount[0]?.count / pageSize);
      return res.status(201).json({ tks: tks, TotalPages: TotalPages, message: 'Task fetched!' });
    } catch (error) {
      console.log("catch error !")
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}


export default taskcontroller