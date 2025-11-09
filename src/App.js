import React, { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import Auth from './components/Auth'
import Dashboard from './components/dashboard'

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  return (
    <div
      className="flex items-center min-h-screen"
    >
      <div className="flex-1 bg-white rounded-2xl min-h-screen">
        {!session ? <Auth /> : <Dashboard session={session} />}
      </div>
    </div>
  );

}

export default App
