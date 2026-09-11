export async function analyzeDataset(file) {
  if (!file) {
    throw new Error('No file provided for analysis');
  }

  const formData = new FormData();
  formData.append('file', file);

  let response;
  try {
    response = await fetch('/api/analyze/', {
      method: 'POST',
      body: formData,
    });
  } catch {
    try {
      response = await fetch('http://127.0.0.1:8000/api/analyze/', {
        method: 'POST',
        body: formData,
      });
    } catch (fallbackErr) {
      throw new Error(
        'Unable to reach PRISM analysis service. Ensure backend server is running on port 8000.',
        { cause: fallbackErr }
      );
    }
  }

  if (!response.ok) {
    let errorMessage = 'Analysis failed (' + response.status + ')';
    try {
      const errorJson = await response.json();
      if (errorJson.message) {
        errorMessage = errorJson.message;
      } else if (errorJson.detail) {
        errorMessage = errorJson.detail;
      }
    } catch {
      errorMessage = response.statusText || errorMessage;
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

  let response;
  try {
    response = await fetch('/api/visualize/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch {
    try {
      response = await fetch('http://127.0.0.1:8000/api/visualize/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (fallbackErr) {
      throw new Error(
        'Unable to reach PRISM visualization service. Ensure backend server is running on port 8000.',
        { cause: fallbackErr }
      );
    }
  }

  if (!response.ok) {
    let errorMessage = 'Visualization request failed (' + response.status + ')';
    try {
      const errorJson = await response.json();
      if (errorJson.detail) {
        errorMessage = errorJson.detail;
      } else if (errorJson.message) {
        errorMessage = errorJson.message;
      }
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  const result = await response.json();
  if (result.status === 'error') {
    throw new Error(result.message || 'Visualization generation failed');
  }

  return result;
}
