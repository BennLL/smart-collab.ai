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
    <div className="flex items-center  justify-center min-h-screen img bg-[url('https://images.pexels.com/photos/5212337/pexels-photo-5212337.jpeg?cs=srgb&dl=pexels-max-fischer-5212337.jpg')] bg-cover bg-center">
      <div className="flex items-center justify-center p-12 bg-white  rounded-2xl">
        {!session ? <Auth /> : <Dashboard session={session} />}
      </div>
    </div>
  );

}

export default App
