import jwt from "jsonwebtoken";
import employee from '../schema/employee-schema.js';
//import employee from "../schema/employee-schema";

const authmiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        let response = await jwt.verify(token, process.env.SECRET)
        var user = await employee.findOne({ _id: response })
        if (!user) {
            return res.status(500).json(user)
        }
        next()
    } catch (error) {
        return res.status(500).json({ message: "No authorisation token was found" })
    }

    //return res.status(200).json(user)
}
export default authmiddleware