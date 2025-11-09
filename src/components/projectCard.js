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
    <div className="rounded-xl p-6 bg-white shadow-lg hover:shadow-md transition-shadow">
      <h4 className="text-xl font-extrabold text-gray-800 mb-3">{project.name}</h4>
      <p className="text-gray-600 text-base mb-4">{project.description}</p>
      <p className="text-sm text-gray-500">
        Join Key: <span className="font-mono">{project.join_key}</span>
      </p>
      {isOwner && (
        <button
          onClick={deleteProject}
          className="mt-5 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-semibold transition"
        >
          Delete Project
        </button>
      )}
    </div>
  );
}

export default ProjectCard
