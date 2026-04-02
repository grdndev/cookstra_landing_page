import { useEffect, useState } from "react"
import { useAuth } from "../auth/AuthContext"
import { deleteUser, getUsers } from "../api/api"
import { useNavigate } from "react-router-dom";

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

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()
  const navigate = useNavigate();

  async function loadUsers() {
    try {
      const response = await getUsers(token!)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.data)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(userId: string) {
    const response = await deleteUser(token!, userId)
    if (response.ok) {
      loadUsers()
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  if (loading) {
    return <div className="animate-pulse">Chargement...</div>
  }

  return (
    <main className="flex flex-col gap-4">
      <div>
        <h2>Utilisateurs</h2>
      </div>

      <table className="text-left border-separate border-spacing-y-2">
        <tr>
          <th>Email</th>
          <th>Rôle</th>
          <th className="text-right">Actions</th>
        </tr>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.email}</td>
            <td>{roles[user.role]}</td>
            <td className="flex gap-2 justify-end">
              <button
                className="border border-red-500/10 rounded px-2 py-1"
                onClick={() => navigate(`/users/${user.id}`)}
              >
                Modifier
              </button>
              <button
                className="border border-red-500/10 rounded px-2 py-1"
                onClick={() => handleDelete(user.id)}
              >
                Supprimer
              </button>
            </td>
          </tr>
        ))}
      </table>
    </main>
  )
}
