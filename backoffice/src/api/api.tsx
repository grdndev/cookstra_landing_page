const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const headers = (token: string) => ({ 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' })

export function postLogin(email: string, password: string) {
    return fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    })
}

export function getDashboard(token: string) {
    return fetch(`${API_URL}/api/admin/dashboard`, { headers: headers(token) })
}

export function getUsers(token: string, params = '') {
    return fetch(`${API_URL}/api/admin/users${params}`, { headers: headers(token) })
}

export function getUser(token: string, userId: string) {
    return fetch(`${API_URL}/api/admin/user/${userId}`, { headers: headers(token) })
}

export function postUser(token: string, userId: string, formdata: object) {
    return fetch(`${API_URL}/api/admin/user/${userId}`, {
        method: 'POST',
        headers: headers(token),
        body: JSON.stringify(formdata),
    })
}

export function deleteUser(token: string, userId: string) {
    return fetch(`${API_URL}/api/admin/user/${userId}`, { method: 'DELETE', headers: headers(token) })
}

export function getMissions(token: string, params = '') {
    return fetch(`${API_URL}/api/admin/missions${params}`, { headers: headers(token) })
}

export function patchMission(token: string, missionId: string, status: string) {
    return fetch(`${API_URL}/api/admin/mission/${missionId}`, { method: 'PATCH', headers: headers(token), body: JSON.stringify({ status }) })
}

export function deleteMission(token: string, missionId: string) {
    return fetch(`${API_URL}/api/admin/mission/${missionId}`, { method: 'DELETE', headers: headers(token) })
}

export function getDocuments(token: string, params = '') {
    return fetch(`${API_URL}/api/admin/documents${params}`, { headers: headers(token) })
}

export function getUserDocuments(token: string, userId: string) {
    return fetch(`${API_URL}/api/admin/user/${userId}/documents`, { headers: headers(token) })
}

export function patchDocument(token: string, documentId: string, status: string) {
    return fetch(`${API_URL}/api/admin/document/${documentId}`, { method: 'PATCH', headers: headers(token), body: JSON.stringify({ status }) })
}

export function getPayouts(token: string, params = '') {
    return fetch(`${API_URL}/api/admin/payouts${params}`, { headers: headers(token) })
}

export function getUpcomingPayments(token: string) {
    return fetch(`${API_URL}/api/admin/payouts/upcoming`, { headers: headers(token) })
}

export function getHoursDisputes(token: string, params = '') {
    return fetch(`${API_URL}/api/admin/payouts/hours-disputes${params}`, { headers: headers(token) })
}

export function resolveHoursDispute(
    token: string,
    missionId: string,
    data: { resolved_start: string; resolved_end: string; decision: 'employer' | 'freelance'; note?: string }
) {
    return fetch(`${API_URL}/api/admin/payouts/hours-disputes/${missionId}/resolve`, {
        method: 'POST',
        headers: headers(token),
        body: JSON.stringify(data),
    })
}

export function getMissionTypes(token: string) {
    return fetch(`${API_URL}/api/admin/mission-types`, { headers: headers(token) })
}

export function getMissionCategories(token: string) {
    return fetch(`${API_URL}/api/admin/mission-categories`, { headers: headers(token) })
}

export function postMissionCategory(token: string, name: string) {
    return fetch(`${API_URL}/api/admin/mission-categories`, { method: 'POST', headers: headers(token), body: JSON.stringify({ name }) })
}

export function deleteMissionCategory(token: string, id: string) {
    return fetch(`${API_URL}/api/admin/mission-categories/${id}`, { method: 'DELETE', headers: headers(token) })
}

export function postMissionType(token: string, name: string) {
    return fetch(`${API_URL}/api/admin/mission-types`, { method: 'POST', headers: headers(token), body: JSON.stringify({ name }) })
}

export function patchMissionType(token: string, id: string, name: string, dress_code: string, category_id: string) {
    return fetch(`${API_URL}/api/admin/mission-types/${id}`, { method: 'PATCH', headers: headers(token), body: JSON.stringify({ name, dress_code, category_id }) })
}

export function deleteMissionType(token: string, id: string) {
    return fetch(`${API_URL}/api/admin/mission-types/${id}`, { method: 'DELETE', headers: headers(token) })
}

export function getHRApplications(token: string) {
    return fetch(`${API_URL}/api/admin/hr/applications`, { headers: headers(token) })
}

export function createUser(token: string, data: { email: string; password: string; role: string; siret: string }) {
    return fetch(`${API_URL}/api/admin/users`, {
        method: 'POST',
        headers: headers(token),
        body: JSON.stringify(data),
    })
}

export function validateUser(token: string, userId: string, status: 'approved' | 'rejected') {
    return fetch(`${API_URL}/api/admin/user/${userId}/validate`, {
        method: 'PATCH',
        headers: headers(token),
        body: JSON.stringify({ status }),
    })
}