import React from 'react'
import { supabase } from '../lib/supabaseClient'

function ProjectCard({ project, userId }) {
  const isOwner = project.owner_id === userId

  const deleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      await supabase.from('projects').delete().eq('id', project.id)
      window.location.reload()
    }
  }

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0.75rem' }}>
      <h4 style={{ fontWeight: '600', fontSize: '1rem' }}>{project.name}</h4>
      <p style={{ color: '#4b5563', fontSize: '0.9rem' }}>{project.description}</p>
      <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>
        Join Key: <span style={{ fontFamily: 'monospace' }}>{project.join_key}</span>
      </p>
      {isOwner && (
        <button
          onClick={deleteProject}
          style={{
            marginTop: '0.5rem',
            background: '#dc2626',
            color: 'white',
            border: 'none',
            padding: '0.4rem 0.8rem',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Delete Project
        </button>
      )}
    </div>
  )
}

export default ProjectCard
