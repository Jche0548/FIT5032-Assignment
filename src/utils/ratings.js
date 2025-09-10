const KEY = 'wh_ratings'

// Read all rating information
function load() {
    try{
        return JSON.parse(localStorage.getItem(KEY) || '{}')
    } catch {
        return {}
    }
}

function save(data) {
    localStorage.setItem(KEY, JSON.stringify(data))
}

// Get all ratings for a single activity
export function getRatings(activityId) {
    const db = load()
    return db[activityId] || []
}

// Get average and total
export function getSummary(activityId) {
    const list = getRatings(activityId)
    if (!list.length) return { avg: 0, count: 0 }
    const sum = list.reduce((s, r) => s + Number(r.score || 0), 0)
    return { avg: +(sum / list.length).toFixed(2), count: list.length }
}

// Get a user's score for this activity (if any)
export function getUserScore(activityId, email) {
    const list = getRatings(activityId)
    const found = list.find(r => r.email === email)
    return found ? Number(found.score) : null
  }

  // Score/Update Score (returns new {avg, count})
  export function rate(activityId, email, score) {
    if (!email) throw new Error('login required')
    const s = Math.max(1, Math.min(5, Number(score)))
    const db = load()
    const list = db[activityId] || []
    const idx = list.findIndex(r => r.email === email)
    if (idx >= 0) list[idx].score = s
    else list.push({ email, score: s })
    db[activityId] = list
    save(db)
    return getSummary(activityId)
  }