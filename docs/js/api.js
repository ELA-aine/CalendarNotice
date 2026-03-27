// GitHub API helpers for reading/writing JSON data files

const API = {
  getConfig() {
    return {
      token: localStorage.getItem('gh_token') || '',
      owner: localStorage.getItem('gh_owner') || '',
      repo:  localStorage.getItem('gh_repo')  || '',
      branch: localStorage.getItem('gh_branch') || 'main',
    };
  },

  isConfigured() {
    const c = this.getConfig();
    return !!(c.token && c.owner && c.repo);
  },

  async getFile(path) {
    const { token, owner, repo, branch } = this.getConfig();
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    if (!res.ok) throw new Error(`GitHub API error ${res.status}: ${await res.text()}`);
    const data = await res.json();
    const content = JSON.parse(atob(data.content.replace(/\n/g, '')));
    return { content, sha: data.sha };
  },

  async putFile(path, content, sha) {
    const { token, owner, repo, branch } = this.getConfig();
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const body = {
      message: `chore: update ${path} via Joshua Fellowship Birthday Calendar`,
      content: btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2)))),
      branch,
    };
    if (sha) body.sha = sha;

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`GitHub API error ${res.status}: ${await res.text()}`);
    return res.json();
  },

  // ── Birthday helpers ──────────────────────────────────────────────
  async getBirthdays() {
    try {
      const { content } = await this.getFile('docs/data/birthdays.json');
      return content;
    } catch (e) {
      console.warn('Could not load birthdays:', e.message);
      return [];
    }
  },

  async saveBirthdays(list) {
    const { sha } = await this.getFile('docs/data/birthdays.json');
    return this.putFile('docs/data/birthdays.json', list, sha);
  },

  // ── Email helpers ─────────────────────────────────────────────────
  async getEmails() {
    try {
      const { content } = await this.getFile('docs/data/emails.json');
      return content;
    } catch (e) {
      console.warn('Could not load emails:', e.message);
      return [];
    }
  },

  async saveEmails(list) {
    const { sha } = await this.getFile('docs/data/emails.json');
    return this.putFile('docs/data/emails.json', list, sha);
  },
};
