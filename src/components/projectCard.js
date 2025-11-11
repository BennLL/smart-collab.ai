import React from 'react'
import { useNavigate } from 'react-router-dom'

function ProjectCard({ project }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/project/${project.id}`)}
      className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer border hover:border-indigo-500"
    >
      <h3 className="text-2xl font-bold text-gray-800 mb-2">{project.name}</h3>
      <p className="text-gray-600 mb-2">{project.description}</p>
      <p className="text-sm text-gray-500">
        Join Key: <span className="font-mono">{project.join_key}</span>
      </p>
    </div>
  )
}

export default ProjectCard
