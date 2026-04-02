const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export function postLogin(email: string, password: string) {
    return fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    })
}

export function getDashboard(token: string) {
    return fetch(`${API_URL}/api/admin/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` },
    })
}

export function getUsers(token: string) {
    return fetch(`${API_URL}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` },
    })
}

export function getUser(token: string, userId: string) {
    return fetch(`${API_URL}/api/admin/user/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
    })
}

export function postUser(token: string, userId: string, formdata: any) {
    return fetch(`${API_URL}/api/admin/user/${userId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formdata),
    })
}

export function deleteUser(token: string, userId: string) {
    return fetch(`${API_URL}/api/admin/user/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
    })
}