import { model } from 'mongoose';
import employee from '../schema/employee-schema.js';
import task from '../schema/task-chema.js';
import bcrypt from 'bcrypt'
import Jwt from 'jsonwebtoken';
import registerMail from '../helpers/globalmail/register-mail.js';
import sendmail from '../helpers/mail.js';
import resetpassword from '../helpers/globalmail/reset-password.js';
// const addemployee = async (emp) => {

//     // let newEmployee = null;

//     // let data = {
//     //     fname: emp.fname,
//     //     lname: emp.lname,
//     //     email: emp.email,
//     //     account_type: emp.account_type,
//     //     username: emp.username,
//     //     description: "",
//     //     password: ""
//     // }

//     // await bcrypt.hash(emp.password, 10).then(async function (hash) {
//     //     data.password = hash
//     //     newEmployee = new employee(data);
//     //     await newEmployee.save();
//     //     console.log(newEmployee)
//     //     let mail = await registerMail(newEmployee.fname, newEmployee._id, newEmployee.lname, newEmployee.account_type, newEmployee.username)
//     //     const subject = mail.subject
//     //     const text = mail.body
//     //     //sendmail(newEmployee.email, subject, text)
//     // });


//     //return newEmployee

//     try {


//         let userresults = await employee.findOne({
//             $or: [
//                 { email: emp.email },
//                 { username: emp.username }
//             ]
//         })

//         if (userresults) {
//             //console.log("user find results are: -", userresults)
//             return
//         }

//         let data = {
//             fname: emp.fname,
//             lname: emp.lname,
//             email: emp.email,
//             account_type: emp.account_type,
//             username: emp.username,
//             description: "",
//             password: ""
//         }

//         let hashsedpassword = await bcrypt.hash(emp.password, 10);

//         console.log("The hashed password is:-", hashsedpassword)


//         data.password = hashsedpassword;

//         console.log("The object is", data)


//         let newEmployee = new employee(data);
//         await newEmployee.save();
//         console.log("newEmployee", newEmployee)




//         // Mail Functionality

//         let mail = await registerMail(newEmployee.fname, newEmployee._id, newEmployee.lname, newEmployee.account_type, newEmployee.username)
//         const subject = mail.subject
//         const text = mail.body
//         await sendmail(newEmployee.email, subject, text)

//         return newEmployee;
//     } catch (error) {
//         return error
//     }

// }

// const loginemployee = async (emp) => {
//     let token;
//     let resp = false
//     let data = {
//         email: emp.email,
//         password: emp.password
//     }

//     console.log(data)
//     const usr = await employee.findOne({ email: data.email })
//     if (usr) {
//         resp = await bcrypt.compare(data.password, usr.password)
//         if (resp == true) {
//             token = await Jwt.sign(usr?.id, process.env.SECRET)
//             console.log("JSONWEBTOKEN", token)
//         }
//     }

//     return { resp, usr, token }
// }

// const getemployeedetails = async (emp) => {
//     const user = await employee.findOne({ email: emp.email })
//     return user
// }

// const updateemployeedetails = async (emp) => {

//     let obj = {
//         fname: emp.fname,
//         lname: emp.lname,
//         description: emp.description
//     }
//     let result = await employee.updateOne({ email: emp.email }, { $set: obj })
//     return result
// }

// const searchusers = async (q) => {

//     // if (q?.includes(" ")) {
//     //     let str = q?.split(" ");
//     //     let fname = str[0];
//     //     let lname = str[1];
//     //     let result = await employee.find({
//     //         account_type: "Employee",
//     //         fname: fname?.charAt(0).toUpperCase() + fname.slice(1),
//     //         lname: lname?.charAt(0).toUpperCase() + lname.slice(1),
//     //     })
//     //     return result
//     // } else {
//     //     let result = await employee.find({
//     //         account_type: "Employee",
//     //         fname: q?.charAt(0).toUpperCase() + q.slice(1)
//     //     })
//     //     return result
//     // }

//     let result = await employee.find({
//         account_type: "Employee",
//         username: q
//     })

//     return result

// }



// Clean alternative

const empcontroller = {
    addemployee: async (req, res) => {
        const emp = req.body;
        try {
            let userresults = await employee.findOne({
                $or: [
                    { email: emp.email },
                    { username: emp.username }
                ]
            })

            if (userresults) {
                return res.status(500).json({ message: "Email/username already exists" })
            }

            let data = {
                fname: emp.fname,
                lname: emp.lname,
                email: emp.email,
                account_type: emp.account_type,
                username: emp.username,
                description: "",
                password: ""
            }

            let hashsedpassword = await bcrypt.hash(emp.password, 10);

            console.log("The hashed password is:-", hashsedpassword)


            data.password = hashsedpassword;

            console.log("The object is", data)


            let newEmployee = new employee(data);
            await newEmployee.save();
            console.log("newEmployee", newEmployee)




            // Mail Functionality

            let mail = await registerMail(newEmployee.fname, newEmployee._id, newEmployee.lname, newEmployee.account_type, newEmployee.username)
            const subject = mail.subject
            const text = mail.body
            await sendmail(newEmployee.email, subject, text)

            //return newEmployee;

            return res.status(201).json({ newEmployee: newEmployee, message: 'Employee Added !' });
        } catch (error) {
            return res.status(500).json(error)
        }
    },
    loginemployee: async (req, res) => {
        const emp = req.body;
        
        try {
            let token;
            let resp = false
            let data = {
                email: emp.email,
                password: emp.password
            }

            const usr = await employee.findOne({ email: data.email })
            

            if (usr) {
                
                resp = await bcrypt.compare(data.password, usr.password)
                if (resp == true) {
                    
                    token = await Jwt.sign(usr?.id, process.env.SECRET)
                    console.log("JSONWEBTOKEN", token)
                    return res.status(201).json({ resp: resp, usr: usr, token: token, message: 'Login successful !' });
                } else {
                    console.log("not called")
                    
                    return res.status(500).json({ message: "Invalid Email/password !" })
                }
            } else {
                
                return res.status(400).json({ message: "Invalid Email/password !" })
            }
            //return { resp, usr, token }

        } catch (error) {
            return res.status(500).json(error)
        }
    },
    getemployeedetails: async (req, res) => {
        let emp = req.query;
        try {
            const user = await employee.findOne({ email: emp.email })
            return res.status(201).json({ data: user, message: 'Fetched successfullt !' });
        } catch (error) {
            return res.status(500).json(error)
        }
    },
    updateemployeedetails: async (req, res) => {
        const emp = req.body
        try {
            let obj = {
                fname: emp.fname,
                lname: emp.lname,
                description: emp.description
            }
            let result = await employee.updateOne({ email: emp.email }, { $set: obj })
            //return result
            return res.status(201).json({ data: result, message: 'Updates successfully !' });
        } catch (error) {
            return res.status(500).json(error)
        }
    },
    searchusers: async (req, res) => {
        const q = req.query?.q
        try {
            let result = await employee.find({
                account_type: "Employee",
                username: q
            })
            return res.status(201).json({ data: result, message: 'Fetched successfully !' });
        } catch (error) {
            return res.status(500).json(error)
        }
    },


    sendpasswordresetlink: async (req, res) => {
        const email = req.body.email;
        try {
            const user = await employee.findOne({ email: email })
            if (user == null) {
                return res.status(400).json({ message: "No user found !" })
            } else {
                const secret = user?._id + process.env.SECRET
                const token = await Jwt.sign({ userId: user?._id }, secret, { expiresIn: "60s" })
                console.log(token)
                const link = `${process.env.frontendLink}/resetpassword?email=${user?.email}?token=${token}`
                let mail = await resetpassword(link)
                const subject = mail.subject
                const text = mail.body
                await sendmail(user.email, subject, text)
                return res.status(201).json({ message: 'Mail sent' });
            }

        } catch (error) {
            console.log(error)
            return res.status(500).json(error)
        }
    },


    resetaccountpassword: async (req, res) => {
        const body = req.body;
        try {
            const user = await employee.findOne({ email: body.email })
            if (user == null) {
                return res.status(500).json(error)
            } else {
                const secret = user?._id + process.env.SECRET
                let response = await Jwt.verify(body.token, secret)
                console.log(response)

                let tokenuser = await employee.findOne({ _id: response.userId })
                if (tokenuser != null) {
                    const hash = await bcrypt.hash(body.password, 10)
                    let result = await employee.updateOne({ email: tokenuser.email }, { $set: { password: hash } })
                    return res.status(200).json({ data: result, message: "password updated !" })
                } else {
                    return res.status(500).json({ message: "Token expired !" })
                }

            }
        } catch (error) {
            return res.status(500).json({ error: error.message })
        }
    }
}

export default empcontroller
