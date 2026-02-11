export async function fetchProjects(client) {
  const response = await client.get('/projects.json')
  return response.projects || []
}

export async function fetchProject(client, projectId, options = {}) {
  const { include = [] } = options
  const includeParam = Array.isArray(include) ? include.join(',') : include
  const query = includeParam ? `?include=${includeParam}` : ''
  const response = await client.get(`/projects/${projectId}.json${query}`)
  return response?.project ?? null
}

export async function fetchStatuses(client) {
  const response = await client.get('/issue_statuses.json')
  return response.issue_statuses || []
}

export async function fetchIssuesPage(client, projectId, options = {}) {
  const { limit = 100, offset = 0 } = options
  const params = new URLSearchParams({
    project_id: projectId,
    status_id: '*',
    limit: String(limit),
    offset: String(offset)
  })

  const response = await client.get(`/issues.json?${params}`)
  
  return {
    issues: response.issues || [],
    totalCount: response.total_count || 0,
    offset: response.offset || 0,
    limit: response.limit || limit
  }
}

export async function fetchAllIssues(client, projectId) {
  const allIssues = []
  let offset = 0
  const limit = 100

  while (true) {
    const page = await fetchIssuesPage(client, projectId, { limit, offset })
    const issues = page?.issues ?? []
    allIssues.push(...issues)

    if (allIssues.length >= page.totalCount) {
      break
    }

    offset += limit
  }

  return allIssues
}

export async function updateIssueStatus(client, issueId, statusId) {
  await client.patch(`/issues/${issueId}.json`, {
    issue: {
      status_id: statusId
    }
  })
}

export async function createIssue(client, issueData) {
  const response = await client.post('/issues.json', {
    issue: issueData
  })
  const issue = response?.issue
  if (!issue) {
    throw new Error('Сервер не вернул созданную задачу')
  }
  return issue
}

export async function fetchTrackers(client) {
  const response = await client.get('/trackers.json')
  return response.trackers || []
}
