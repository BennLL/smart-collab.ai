import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import ProjectCard from './projectCard'

function Dashboard({ session }) {
  const [projects, setProjects] = useState([])
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDesc, setNewProjectDesc] = useState('')
  const [joinKey, setJoinKey] = useState('')

  const user = session?.user

  // Fetch projects whenever user changes
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

  // Create project
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

      // Add creator as project member
      await supabase.from('project_members').insert([
        { project_id: data[0].id, user_id: user.id, role: 'owner' },
      ])

      setNewProjectName('')
      setNewProjectDesc('')
      // Refresh project list
      const { data: refreshedProjects, error: fetchError } = await supabase.from('projects').select('*')
      if (!fetchError) setProjects(refreshedProjects)
    } catch (err) {
      console.error('Unexpected error creating project:', err)
    }
  }

  // Join project
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
    <>
      {!user ? (
        <p>Loading session...</p>
      ) : (
        <div
          style={{
            width: '100%',
            maxWidth: '700px',
            background: '#fff',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <h2 style={{ fontWeight: 'bold' }}>Welcome, {user.email}</h2>
            <button
              onClick={logout}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
              }}
            >
              Logout
            </button>
          </div>

          {/* Create Project */}
          <form onSubmit={createProject} style={{ marginBottom: '1rem' }}>
            <input
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Project name"
              style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }}
            />
            <input
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
              placeholder="Project description"
              style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }}
            />
            <button style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px' }}>
              Create Project
            </button>
          </form>

          {/* Join Project */}
          <form onSubmit={joinProject} style={{ marginBottom: '1.5rem' }}>
            <input
              value={joinKey}
              onChange={(e) => setJoinKey(e.target.value)}
              placeholder="Enter project join key"
              style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }}
            />
            <button style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px' }}>
              Join Project
            </button>
          </form>

          <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Your Projects</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} userId={user.id} />
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default Dashboard
