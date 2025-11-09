import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import ProjectCard from './projectCard'

function Dashboard({ session }) {
  const [projects, setProjects] = useState([])
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDesc, setNewProjectDesc] = useState('')
  const [joinKey, setJoinKey] = useState('')
  const [profile, setProfile] = useState(null)

  const user = session?.user

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single()
      if (!error) setProfile(data)
    }
    fetchProfile()
  }, [user])

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) console.error('Fetch projects error:', error)
      else setProjects(data)
    }
    fetchProjects()
  }, [user])

  const createProject = async (e) => {
    e.preventDefault()
    if (!user?.id) return alert('User session not ready')
    if (!newProjectName) return alert('Project name is required')

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{ name: newProjectName, description: newProjectDesc, owner_id: user.id }])
        .select()

      if (error) {
        console.error('Error creating project:', error)
        return alert('Error creating project: ' + error.message)
      }

      await supabase.from('project_members').insert([
        { project_id: data[0].id, user_id: user.id, role: 'owner' },
      ])

      setNewProjectName('')
      setNewProjectDesc('')
      const { data: refreshedProjects, error: fetchError } = await supabase.from('projects').select('*')
      if (!fetchError) setProjects(refreshedProjects)
    } catch (err) {
      console.error('Unexpected error creating project:', err)
    }
  }

  const joinProject = async (e) => {
    e.preventDefault()
    if (!joinKey) return alert('Please enter a project key')
    if (!user?.id) return alert('User session not ready')

    try {
      const { data: project, error } = await supabase
        .from('projects')
        .select('id')
        .eq('join_key', joinKey)
        .single()

      if (error || !project) {
        console.error('Error finding project:', error)
        return alert('Invalid project key')
      }

      await supabase.from('project_members').insert([
        { project_id: project.id, user_id: user.id, role: 'member' },
      ])

      setJoinKey('')

      const { data: refreshedProjects, error: fetchError } = await supabase.from('projects').select('*')
      if (!fetchError) setProjects(refreshedProjects)
    } catch (err) {
      console.error('Unexpected error joining project:', err)
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      {/* Sidebar left */}
      <aside className="w-64 bg-indigo-900 text-white flex flex-col p-6">
        <div className="border-b-2 border-gray-300 mb-4">
          <h1 className="text-3xl font-bold mb-4">Smart Collab</h1>
        </div>

        <div className="border-b-2 border-gray-300 mb-4">
          <nav className="flex flex-col gap-4 text-indigo-200 grow mb-4">
            <a className="text-lg font-medium hover:text-white transition">Dashboard</a>
            <a className="text-lg font-medium hover:text-white transition">Projects</a>
            <a className="text-lg font-medium hover:text-white transition">Settings</a>
          </nav>
        </div>


        <div>
          <h1 className="text-2xl font-bold mb-4">Active Projects</h1>
          <ul>
            {projects.map((p) => (
              <li className="text-lg font-medium text-gray-300 hover:text-white transition hover:cursor-pointer">• {p.name}</li>
            ))}
          </ul>
        </div>

        <footer className="mt-auto pt-6 border-t border-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-lg">
              {profile?.first_name ? profile.first_name[0] : 'U'}
            </div>
            <div>
              <h2 className="text-base font-semibold">
                {profile ? `${profile.first_name} ${profile.last_name}` : user.email}
              </h2>
              <p className="text-xs text-indigo-300">Student</p>
            </div>
          </div>
        </footer>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-12 w-full overflow-auto">
        <header className="flex justify-between items-center mb-10">
          <h2 className="text-4xl font-extrabold text-gray-800">
            Welcome, {profile ? `${profile.first_name} ${profile.last_name}` : user.email}
          </h2>
          <button
            onClick={logout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-12">
          {/* Create Project Form */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold mb-4">Create New Project</h3>
            <form onSubmit={createProject} className="flex flex-col gap-4">
              <input
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Project name"
                className="border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <textarea
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                placeholder="Project description"
                className="border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 transition"
              >
                Create Project
              </button>
            </form>
          </div>

          {/* Join Project Form */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold mb-4">Join a Project</h3>
            <form onSubmit={joinProject} className="flex flex-col gap-4">
              <input
                value={joinKey}
                onChange={(e) => setJoinKey(e.target.value)}
                placeholder="Enter project join key"
                className="border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <button
                type="submit"
                className="bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition"
              >
                Join Project
              </button>
            </form>
          </div>
        </section>

        <section>
          <h3 className="text-3xl font-bold mb-6">Active Projects</h3>
          {projects.length === 0 ? (
            <p className="text-gray-500">You don't have any projects yet.</p>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 w-full">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} userId={user.id} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default Dashboard
