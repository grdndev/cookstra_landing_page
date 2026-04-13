import { useEffect, useState } from "react"
import { useAuth } from "../auth/AuthContext"
import { getUser } from "../api/api"
import { useParams } from "react-router-dom";

type User = {
  id: string;
  email: string;
  role: 'admin' | 'hr' | 'freelance' | 'employer';
}

export default function UserDetailPage() {
  const { userId } = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()

  async function loadUser() {
    try {
      const response = await getUser(token!, userId!)
      if (response.ok) {
        const data = await response.json()
        setUser(data.data)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUser()
  }, [])

  if (loading) {
    return <div className="animate-pulse">Chargement...</div>
  }

  return (
    <main className="flex flex-col gap-4">
      <div>
        <h2>Utilisateurs</h2>
      </div>

      {JSON.stringify(user) || ""}
    </main>
  )
}
