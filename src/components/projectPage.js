import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function ProjectPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [files, setFiles] = useState([])
  const [newTask, setNewTask] = useState({ title: '', description: '', deadline: '' })
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchProject = useCallback(async () => {
    const { data, error } = await supabase.from('projects').select('*').eq('id', id).single()
    if (!error) setProject(data)
  }, [id])

  const fetchTasks = useCallback(async () => {
    const { data } = await supabase.from('tasks').select('*').eq('project_id', id).order('created_at', { ascending: false })
    setTasks(data || [])
  }, [id])

  const fetchFiles = useCallback(async () => {
    const { data } = await supabase.from('project_files').select('*').eq('project_id', id).order('uploaded_at', { ascending: false })
    setFiles(data || [])
  }, [id])

  useEffect(() => {
    fetchProject()
    fetchTasks()
    fetchFiles()
  }, [id, fetchProject, fetchTasks, fetchFiles])

  const createTask = async (e) => {
    e.preventDefault()
    if (!newTask.title) return alert('Task title is required')
    setLoading(true)
    const { error } = await supabase.from('tasks').insert([{ ...newTask, project_id: id }])
    setLoading(false)
    if (!error) {
      setNewTask({ title: '', description: '', deadline: '' })
      fetchTasks()
    }
  }

  const uploadFile = async (e) => {
    e.preventDefault()
    if (!selectedFile) return alert('No file selected')
    setLoading(true)
    const { error: uploadError } = await supabase.storage // might need data: uploadData,
      .from('project_uploads')
      .upload(`projects/${id}/${selectedFile.name}`, selectedFile)
    if (uploadError) {
      alert(uploadError.message)
      setLoading(false)
      return
    }
    const publicUrl = supabase.storage
      .from('project_uploads')
      .getPublicUrl(`projects/${id}/${selectedFile.name}`).data.publicUrl

    await supabase.from('project_files').insert([{ project_id: id, file_url: publicUrl }])
    setSelectedFile(null)
    setLoading(false)
    fetchFiles()
  }

  if (!project) return <div className="p-10 text-center text-gray-500">Loading...</div>

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="text-indigo-600 underline mb-4 hover:text-indigo-800"
      >
        ← Back
      </button>

      <h1 className="text-4xl font-bold mb-2 text-gray-800">{project.name}</h1>
      <p className="text-gray-600 mb-3">{project.description}</p>
      <p className="text-sm text-gray-500 mb-8">
        Deadline: {project.deadline || 'No deadline set'}
      </p>

      {/* TASKS */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Tasks</h2>
        <form onSubmit={createTask} className="flex flex-col md:flex-row gap-3 mb-6">
          <input
            className="border rounded p-2 flex-1"
            placeholder="Task title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            required
          />
          <input
            className="border rounded p-2 flex-1"
            placeholder="Description"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          />
          <input
            type="date"
            className="border rounded p-2"
            value={newTask.deadline}
            onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
          />
          <button
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition disabled:opacity-50"
          >
            Add Task
          </button>
        </form>

        {tasks.length === 0 ? (
          <p className="text-gray-500">No tasks yet.</p>
        ) : (
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li key={task.id} className="bg-white p-4 rounded shadow border">
                <h3 className="font-semibold text-lg">{task.title}</h3>
                <p className="text-gray-600">{task.description}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Deadline: {task.deadline || 'None'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* FILES */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Project Files</h2>
        <form onSubmit={uploadFile} className="flex gap-3 mb-6">
          <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
          <button
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
          >
            Upload
          </button>
        </form>

        {files.length === 0 ? (
          <p className="text-gray-500">No files uploaded yet.</p>
        ) : (
          <ul className="space-y-2">
            {files.map((file) => (
              <li key={file.id}>
                <a
                  href={file.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  {file.file_url.split('/').pop()}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default ProjectPage
