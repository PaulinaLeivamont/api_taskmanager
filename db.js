const {MongoClient} = require("mongodb")
const { default: mongoose } = require("mongoose")
const { generateId } = require("./id-enerator")
require('dotenv').config()
const urlConexion = process.env.DATABASE_URL

let dbClient = null
async function connect() {
  if (!dbClient) {
    dbClient = new MongoClient(urlConexion)
    await dbClient.connect()
  }
  return dbClient
}

/* Inicia sesión de un usuario utilizando el nombre y la contraseña proporcionados.
Devuelve el objeto de usuario si la autenticación es exitosa.
Lanza un error si el usuario no se encuentra o la contraseña es incorrecta. */
const loginUser = async (name, password) => {
    try {
        const connection = await connect()
        const collection = connection.db("task_manager").collection("task_manager")
        const user = await collection.findOne({ name })
        if (!user) throw new Error('Usuario no encontrado')
        if (user.password !== password) throw new Error('Contraseña incorrecta')
        return user
    } catch (error) { throw error }
}

/* Obtiene las tareas de un usuario basado en su ID.
Devuelve un arreglo de tareas si el usuario y sus tareas son encontradas.
Lanza un error si el usuario no se encuentra o si las tareas no son un arreglo. */
const getUserTasks = async (userId) => {
    try {
        const connection = await connect()
        const collection = connection.db("task_manager").collection("task_manager")
        const user = await collection.findOne({ _id: new mongoose.Types.ObjectId(userId) })
        if (!user) throw new Error('Usuario no encontrado')
        if (!Array.isArray(user.tasks)) throw new Error('Ha ocurrido un error')
        return user.tasks
    } catch (error) {
        throw error
    }
}

/* Añade una nueva tarea a la lista de tareas de un usuario.
Devuelve la tarea recién añadida si la operación es exitosa.
Lanza un error si la operación falla. */
const addTask = async (userId) => {
    try {
        const newTask = { id: generateId(), name: '', type: '', status: 0 }
        const connection = await connect()
        const collection = connection.db("task_manager").collection("task_manager")
        await collection.updateOne({ _id: new mongoose.Types.ObjectId(userId) }, { $push: { tasks: newTask } })
        return newTask
    } catch (error) {
        throw error
    }
}

/* Elimina una tarea de la lista de tareas de un usuario.
Devuelve true si la tarea se eliminó correctamente.
Lanza un error si la operación falla. */
const deleteTask = async (userId, taskId) => {
    try {
        const connection = await connect()
        const collection = connection.db("task_manager").collection("task_manager")
        await collection.updateOne({ _id: new mongoose.Types.ObjectId(userId) }, { $pull: { tasks: { id: taskId } } })
        return true
    } catch (error) {
        throw error
    }
}

/* Edita una tarea existente en la lista de tareas de un usuario.
Devuelve true si la tarea se editó correctamente.
Lanza un error si la tarea no se encuentra o la operación falla. */
const editTask = async (userId, task) => {
    try {
        const connection = await connect()
        const collection = connection.db("task_manager").collection("task_manager")
        const result = await collection.updateOne(
            { _id: new mongoose.Types.ObjectId(userId), "tasks.id": task.id },
            { $set: { "tasks.$": task } }
        )
        if (result.modifiedCount === 0) {
            throw new Error('Tarea no encontrada o no modificada')
        }
        return true
    } catch (error) {
        throw error
    }
}


module.exports = {
 loginUser,
 getUserTasks,
 addTask,
 deleteTask,
 editTask
}
