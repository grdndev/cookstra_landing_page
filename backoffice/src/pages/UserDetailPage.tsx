import { useEffect, useState } from "react"
import { useAuth } from "../auth/AuthContext"
import { deleteUser, getUser, postUser } from "../api/api"
import { useParams } from "react-router-dom";

type User = {
  id: string;
  email: string;
  role: 'admin' | 'hr' | 'freelance' | 'employer';
}

const roles = {
  admin: 'Administrateur',
  hr: 'Ressources humaines',
  freelance: 'Freelance',
  employer: 'Employeur',
}

export default function UserDetailPage() {
  const { userId } = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'hr' | 'freelance' | 'employer'>('freelance')
  const { token } = useAuth()

  async function loadUser() {
    try {
      const response = await getUser(token!, userId!)
      if (response.ok) {
        const data = await response.json()
        setUser(data.data)
        setEmail(data.data.email)
        setRole(data.data.role)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(userId: string) {
    const response = await postUser(token!, userId, {

    })
    if (response.ok) {
      loadUser()
    }
  }

  async function handleDelete(userId: string) {
    const response = await deleteUser(token!, userId)
    if (response.ok) {
      loadUser()
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
