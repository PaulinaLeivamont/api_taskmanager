// index.js
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const { loginUser, getUserTasks, addTask, deleteTask, editTask } = require('./db')
require('dotenv').config()

const app = express()
const port = process.env.PORT || 3000

// Middlewares
app.use(cors())
app.use(bodyParser.json())

// Ruta para el login de usuario
app.post('/login', async (req, res) => {
    const { name, password } = req.body

    try {
        const user = await loginUser(name, password)
        res.json({ id: user._id, name: user.name, tasks: [] })
    } catch (error) {
        res.status(401).json({ id: '', name: '' }) // Error de autenticación
    }
})

// Ruta para obtener las tareas de un usuario por su ID
app.get('/tasks/:userId', async (req, res) => {
    const { userId } = req.params

    try {
        const tasks = await getUserTasks(userId)
        res.json(tasks)
    } catch (error) {
        res.status(404).json([]) // Usuario no encontrado o error al obtener tareas
    }
})

// Ruta para añadir una nueva tarea a un usuario
app.post('/add', async (req, res) => {
    const { userId } = req.body

    try {
        const task = await addTask(userId)
        res.json(task)
    } catch (error) {
        res.status(400).json('error') // Error genérico al añadir tarea
    }
})

// Ruta para eliminar una tarea de un usuario
app.delete('/delete', async (req, res) => {
    const { userId, taskId } = req.body

    try {
        const deleted = await deleteTask(userId, taskId)
        res.json(deleted)
    } catch (error) {
        res.status(400).json(false) // Error genérico al eliminar tarea
    }
})

// Ruta para editar una tarea de un usuario
app.put('/edit', async (req, res) => {
    const { userId, task } = req.body

    try {
        const updated = await editTask(userId, task)
        res.json(updated)
    } catch (error) {
        res.status(400).json(false) // Error genérico al editar tarea
    }
})
//error 404
app.use((req, res, next) => {
    res.status(404).json({
        error: 'Ups, URL no encontrada'
    })
})

//error 500
app.use((err, req, res, next) => {
    console.log(err.stack)
    res.status(500).json({
        error: 'Lo sentimos, vuelva a intertarlo en otro momento'
    })
})

app.listen(port)
