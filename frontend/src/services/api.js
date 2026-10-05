const RAW_API_URL = import.meta.env.VITE_API_URL || '';
const API_BASE = RAW_API_URL.replace(/\/+$/, '');

function buildEndpointUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (API_BASE) {
    return `${API_BASE}${normalizedPath}`;
  }
  return normalizedPath;
}

export async function analyzeDataset(file) {
  if (!file) {
    throw new Error('No file provided for analysis');
  }

  const formData = new FormData();
  formData.append('file', file);

  const endpointUrl = buildEndpointUrl('/api/analyze/');

  let response;
  try {
    response = await fetch(endpointUrl, {
      method: 'POST',
      body: formData,
    });
  } catch (networkErr) {
    throw new Error(
      `Unable to reach analysis service at ${endpointUrl}. Please ensure your backend is deployed, running, and CORS is enabled.`,
      { cause: networkErr }
    );
  }

  if (!response.ok) {
    let errorMessage = `Analysis failed (${response.status})`;
    if (response.status === 404) {
      errorMessage = `Analysis endpoint not found (404) at ${endpointUrl}. If this is a deployed frontend, ensure your backend server is deployed and the VITE_API_URL environment variable is configured in your Vercel project settings.`;
    } else if (response.status === 413) {
      errorMessage = `The uploaded file (${(file.size / (1024 * 1024)).toFixed(1)} MB) is too large for the backend server to process in a single request.`;
    } else {
      try {
        const errorJson = await response.json();
        if (errorJson.message) {
          errorMessage = errorJson.message;
        } else if (errorJson.detail) {
          errorMessage = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
        }
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
    }
    throw new Error(errorMessage);
  }

  const result = await response.json();
  if (result.status === 'error') {
    throw new Error(result.message || 'Dataset analysis failed');
  }

  return {
    filename: result.filename || file.name,
    analysis: result.analysis,
  };
}

export async function fetchVisualization({ filename, column_1, column_2, chart_type }) {
  if (!filename) {
    throw new Error('No dataset filename provided');
  }
  if (!column_1 || !column_2) {
    throw new Error('Both column 1 and column 2 must be selected');
  }
  if (column_1 === column_2) {
    throw new Error('Column 1 and Column 2 must be different columns');
  }
  if (!chart_type) {
    throw new Error('Chart type is required');
  }

  const payload = {
    filename,
    column_1,
    column_2,
    chart_type,
  };

  const endpointUrl = buildEndpointUrl('/api/visualize/');

  let response;
  try {
    response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (networkErr) {
    throw new Error(
      `Unable to reach visualization service at ${endpointUrl}. Please ensure your backend is deployed and running.`,
      { cause: networkErr }
    );
  }

  if (!response.ok) {
    let errorMessage = `Visualization request failed (${response.status})`;
    if (response.status === 404) {
      errorMessage = `Visualization endpoint not found (404) at ${endpointUrl}. Ensure VITE_API_URL is configured properly.`;
    } else {
      try {
        const errorJson = await response.json();
        if (errorJson.detail) {
          errorMessage = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
        } else if (errorJson.message) {
          errorMessage = errorJson.message;
        }
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
    }
    throw new Error(errorMessage);
  }

  const result = await response.json();
  if (result.status === 'error') {
    throw new Error(result.message || 'Visualization generation failed');
  }

  return result;
}

