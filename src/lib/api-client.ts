/**
 * HTTP client for the Omnus API.
 * Handles all communication between the CLI and the Omnus backend.
 */

import { VERSION } from './version.js';

interface ExportContextOptions {
  force?: boolean;
}

interface ExportContextResponse {
  files: Record<string, string>;
  metadata: {
    project_id: string;
    generated_at: string;
    file_count: number;
    total_tokens: number;
  };
}

interface CaptureResponse {
  ingestionId: string;
  status: string;
}

interface SearchOptions {
  scope?: string;
  kind?: string;
  limit?: number;
}

interface SearchResponse {
  records: Array<{
    id: string;
    title: string;
    body: string;
    kind: string;
    scope: string;
    confidence: number;
    score: number;
    createdAt: string;
  }>;
  totalFound: number;
}

interface StatusResponse {
  fragmentCount: number | null;
  lastIngestion: string | null;
  lastExport: string | null;
}

export class OmnusApiClient {
  private baseUrl: string;
  private apiKey: string | undefined;

  constructor(baseUrl: string, apiKey?: string) {
    // Strip trailing slash
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
  }

  /**
   * Fetch generated context files for a project.
   */
  async exportContext(
    projectId: string,
    options?: ExportContextOptions
  ): Promise<ExportContextResponse> {
    const params = new URLSearchParams();
    if (options?.force) params.set('force', 'true');

    const queryString = params.toString();
    const url = `${this.baseUrl}/api/projects/${encodeURIComponent(projectId)}/export-context${queryString ? `?${queryString}` : ''}`;

    const response = await this.fetch(url, { method: 'POST' });
    return response as ExportContextResponse;
  }

  /**
   * Send a text fragment to Omnus for ingestion and processing.
   */
  async capture(
    text: string,
    projectHint?: string,
    scopeHint?: 'shared' | 'project' | 'personal' | 'mixed'
  ): Promise<CaptureResponse> {
    const url = `${this.baseUrl}/api/ingestions`;

    const body: Record<string, unknown> = {
      sourceType: 'manual_paste',
      text,
    };

    if (projectHint) body.projectHint = projectHint;
    if (scopeHint) body.scopeHint = scopeHint;

    const response = await this.fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return response as CaptureResponse;
  }

  /**
   * Search the knowledge base.
   */
  async search(query: string, options?: SearchOptions): Promise<SearchResponse> {
    const url = `${this.baseUrl}/api/query`;

    const body: Record<string, unknown> = { query };
    if (options?.scope) body.scope = options.scope;
    if (options?.kind) body.kind = options.kind;
    if (options?.limit) body.limit = options.limit;

    const response = await this.fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return response as SearchResponse;
  }

  /**
   * Get project status from the API.
   */
  async getStatus(projectId: string): Promise<StatusResponse> {
    const url = `${this.baseUrl}/api/projects/${encodeURIComponent(projectId)}`;
    const response = await this.fetch(url, { method: 'GET' });
    return response as StatusResponse;
  }

  /**
   * Verify a project exists in Omnus by slug.
   * Returns the project data if found, null if not found (404).
   * Throws on network/server errors.
   */
  async verifyProject(projectId: string): Promise<{ id: string; name: string; slug: string } | null> {
    const url = `${this.baseUrl}/api/projects/${encodeURIComponent(projectId)}`;
    try {
      const response = await this.fetch(url, { method: 'GET' });
      return response as { id: string; name: string; slug: string };
    } catch (err) {
      if (err instanceof Error && err.message.includes('404')) {
        return null;
      }
      throw err;
    }
  }

  /**
   * Simple health check to verify API connectivity.
   */
  async healthCheck(): Promise<void> {
    const url = `${this.baseUrl}/api/health`;
    await this.fetch(url, { method: 'GET' });
  }

  private async fetch(
    url: string,
    options: { method: string; body?: string }
  ): Promise<unknown> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': `terso-cli/${VERSION}`,
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    let response: Response;
    try {
      response = await globalThis.fetch(url, {
        method: options.method,
        headers,
        body: options.body,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown network error';
      throw new Error(`Network error connecting to ${this.baseUrl}: ${message}`);
    }

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(
        `API error ${response.status}: ${response.statusText}${text ? ` - ${text}` : ''}`
      );
    }

    // Some endpoints (like health) may return no body
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json();
    }

    return {};
  }
}
