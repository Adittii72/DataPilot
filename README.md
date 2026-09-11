# PRISM — Reveal What's Inside Your Data

> An automated data analysis platform that helps you understand, explore, and visualize datasets without manually writing repetitive EDA code.

## Live Demo

**[Try PRISM Live](data-pilot-maek7qbbm-aditi-shrimankars-projects.vercel.app)**

---

## About PRISM

PRISM is an automated data analysis platform designed to reveal what is happening inside a dataset.

Instead of manually performing the same data-cleaning checks, statistical analysis, exploratory data analysis, and visualization steps for every dataset, PRISM automates the process and presents the results through an interactive dashboard.

The goal is simple:

**Upload your data → Analyze it → Understand it → Visualize it.**

---

## Features

### Dataset Profiling

PRISM automatically analyzes an uploaded CSV and provides:

- Dataset dimensions
- Column names
- Data types
- Numerical and categorical feature identification
- Unique value counts
- Unique value ratios

### Data Quality Analysis

PRISM checks the dataset for common data-quality issues:

- Missing values
- Duplicate rows
- Constant columns
- High-cardinality features
- Rare categories

### Statistical Analysis

For numerical features, PRISM calculates:

- Count
- Mean
- Median
- Mode
- Variance
- Standard deviation
- Minimum
- Maximum
- Range
- Skewness

For categorical features, PRISM provides:

- Count
- Number of unique values
- Mode
- Mode frequency

### Exploratory Data Analysis

PRISM performs automated EDA including:

- IQR-based outlier detection
- Skewness analysis
- Numerical correlation analysis
- Categorical value frequencies
- Rare-category detection
- Numerical vs categorical relationships
- Categorical vs categorical relationships

### Interactive Visualizations

Users can select columns from their dataset and generate visualizations dynamically.

Supported chart types include:

- Bar charts
- Line charts
- Scatter plots

Charts are rendered interactively using Chart.js.

---

## Architecture

PRISM follows a modular service-based architecture:

```text
                    ┌─────────────────────┐
                    │    React Frontend   │
                    │      :5173          │
                    └──────────┬──────────┘
                               │
                               │ HTTP
                               ▼
                    ┌─────────────────────┐
                    │   Django Backend    │
                    │      :8000          │
                    └──────────┬──────────┘
                               │
                               │ HTTP
                               ▼
                    ┌─────────────────────┐
                    │ FastAPI DS Service  │
                    │      :8001          │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Python DS Engine  │
                    │                     │
                    │ Dataset Profiling   │
                    │ Data Quality        │
                    │ Statistics          │
                    │ EDA                 │
                    │ Visualization       │
                    └─────────────────────┘
```

### Architecture Responsibilities

**React Frontend**

Handles the user interface, dataset upload interaction, dashboard, visualization controls, and Chart.js rendering.

**Django Backend**

Acts as the main backend and API layer. It receives requests from the frontend and communicates with the FastAPI data-science service.

**FastAPI Data Science Service**

Handles requests related to data analysis and visualization and connects the web application to the reusable data-science engine.

**Python Data Science Engine**

Contains the core analysis logic independently from the web frameworks. This includes dataset profiling, data-quality analysis, statistical analysis, EDA, and visualization data preparation.

---

## Tech Stack

### Frontend

- **React** — User interface and dashboard
- **Vite** — Frontend development and build tooling
- **JavaScript** — Application logic
- **Chart.js** — Interactive data visualizations
- **react-chartjs-2** — React integration for Chart.js
- **CSS** — Styling and responsive UI

### Backend

- **Python** — Core backend and data-processing language
- **Django** — Main backend and API layer
- **FastAPI** — Dedicated data-science service
- **Pydantic** — Request and response validation
- **HTTPX** — Communication between Django and FastAPI

### Data Science

- **Pandas** — Data loading, manipulation, profiling, and analysis
- **NumPy** — Numerical operations and data processing

### Development & Testing

- **Git** — Version control
- **GitHub** — Source-code hosting
- **Postman** — API development and testing

---

## Project Structure

```text
PRISM/
│
├── backend/
│   ├── analyzer/
│   ├── manage.py
│   └── ...
│
├── fastapi_service/
│   ├── main.py
│   └── schemas.py
│
├── src/
│   ├── data_loader.py
│   ├── dataset_profiler.py
│   ├── dataset_quality.py
│   ├── statistical_analyzer.py
│   ├── eda_analyzer.py
│   ├── visualization_analyzer.py
│   ├── analysis_pipeline.py
│   └── serialization.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
│
├── tests/
├── notebooks/
├── data/
├── pyproject.toml
├── requirements.txt
└── README.md
```

---

## How PRISM Works

### 1. Upload Dataset

The user uploads a CSV file through the React frontend.

### 2. Request Processing

The frontend sends the request to the Django backend.

Django forwards the dataset to the FastAPI data-science service.

### 3. Dataset Profiling

The Python analysis engine examines the dataset structure and identifies:

- Number of rows
- Number of columns
- Feature names
- Data types
- Numerical columns
- Categorical columns

### 4. Data Quality Analysis

The dataset is checked for common issues such as:

- Missing values
- Duplicate rows
- Constant columns
- High cardinality
- Rare categories

### 5. Statistical Analysis

PRISM calculates descriptive statistics for numerical and categorical features.

### 6. Automated EDA

The system performs exploratory analysis including:

- Outlier detection
- Skewness analysis
- Correlation analysis
- Value frequencies
- Rare-category analysis
- Feature relationships

### 7. Visualization

The user selects two columns and a chart type.

The backend prepares the required chart data, which is returned to the React frontend and rendered using Chart.js.

---

## Visualization

PRISM currently supports three primary visualization types.

### Bar Chart

Used for comparing categorical groups against a numerical value.

For example:

```text
Product → Sales
Category → Revenue
Location → Transactions
```

### Line Chart

Used for ordered or time-based data.

For example:

```text
Date → Sales
Month → Revenue
Time → Temperature
```

### Scatter Plot

Used for exploring relationships between two numerical variables.

For example:

```text
Price → Sales
Age → Income
Advertising Spend → Revenue
```

The data aggregation and preparation are handled by the backend rather than the React frontend. React focuses on presenting the resulting data through Chart.js.

---

## Example Use Cases

PRISM can be used to quickly explore datasets such as:

- Sales data
- Customer data
- Financial datasets
- Transaction data
- Household and IoT data
- Survey datasets
- Machine-learning datasets
- General tabular CSV datasets

It is particularly useful during the initial data-understanding and exploratory-analysis stage of a machine-learning workflow.

---

## Design Philosophy

PRISM is built around a simple principle:

> **Before building a model, understand your data.**

Machine-learning models are only as useful as the data and assumptions behind them.

PRISM focuses on making the initial investigation of a dataset faster, more systematic, and easier to understand.

Rather than replacing the data scientist, the platform is designed to automate repetitive analysis while keeping the user involved in interpreting the results.

---

## Running Locally

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd PRISM
```

### 2. Create a Python Virtual Environment

```bash
python -m venv venv
```

On Windows:

```bash
venv\Scripts\activate
```

### 3. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 4. Start Django

```bash
cd backend
python manage.py runserver 8000
```

Django will run on:

```text
http://localhost:8000
```

### 5. Start FastAPI

From the project root:

```bash
uvicorn fastapi_service.main:app --reload --port 8001
```

FastAPI will run on:

```text
http://localhost:8001
```

### 6. Start the React Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

## API Endpoints

### Django

```text
GET /api/health/
```

Checks whether the Django backend is running.

```text
POST /api/analyze/
```

Accepts a CSV dataset and forwards it to the data-science service for analysis.

### FastAPI

```text
GET /health/
```

Checks whether the FastAPI service is running.

```text
POST /analyze/
```

Runs the complete dataset analysis pipeline.

```text
POST /visualize/
```

Generates chart-ready data based on the selected columns and visualization type.

---

## Data Science Pipeline

The analysis engine is organized into separate modules:

```text
CSV
 │
 ▼
Data Loader
 │
 ▼
Dataset Profiler
 │
 ├── Shape
 ├── Columns
 ├── Data Types
 ├── Numerical Features
 └── Categorical Features
 │
 ▼
Data Quality Analyzer
 │
 ├── Missing Values
 ├── Duplicates
 ├── Constants
 └── Cardinality
 │
 ▼
Statistical Analyzer
 │
 ├── Numerical Statistics
 └── Categorical Statistics
 │
 ▼
EDA Analyzer
 │
 ├── Outliers
 ├── Skewness
 ├── Correlations
 ├── Frequencies
 ├── Rare Categories
 └── Feature Relationships
 │
 ▼
Visualization Analyzer
 │
 └── Chart-ready Data
```

The `AnalysisPipeline` coordinates these individual analysis modules and produces a unified result.

---

## Handling High-Cardinality Data

A dataset may contain categorical columns with a very large number of unique values.

For example:

```text
Customer ID
Transaction ID
Email
Address
Text
```

Attempting to generate every possible category relationship for such columns can create unnecessarily large computations and responses.

PRISM therefore applies cardinality safeguards when performing categorical EDA.

This allows the system to avoid expensive operations on unsuitable high-cardinality features while still providing useful information about them.

---

## Testing

The project was tested using multiple datasets with different structures and characteristics, including:

- A retail/cafe transaction dataset
- Household power consumption data
- GoEmotions data
- An automobile sales dataset

Testing covered:

- CSV loading
- Dataset profiling
- Missing-value detection
- Duplicate detection
- Constant-column detection
- Cardinality analysis
- Statistical calculations
- Outlier detection
- Skewness
- Correlation analysis
- Categorical relationships
- Numerical-categorical relationships
- JSON serialization
- API communication
- Visualization generation

Special attention was given to datasets containing high-cardinality categorical and text columns to prevent unnecessarily expensive EDA operations.

---

## Future Improvements

Potential future improvements include:

- JWT authentication
- PostgreSQL database integration
- Persistent user accounts
- Dataset history
- Saved analysis results
- Persistent dataset storage
- Machine-learning workflows
- Automatic problem-type detection
- Feature engineering
- Automated preprocessing
- Model training and comparison
- Model evaluation
- Additional visualization types
- Exportable analysis reports
- Support for larger datasets

---

## What I Learned Building PRISM

PRISM was built to understand how a real data-science application works beyond individual Jupyter notebooks.

The project provided practical experience with:

- Data profiling
- Data-quality analysis
- Descriptive statistics
- Exploratory data analysis
- Outlier detection
- Correlation analysis
- Cardinality analysis
- Skewness analysis
- Pandas
- NumPy
- REST APIs
- Django
- FastAPI
- React
- Chart.js
- Frontend/backend communication
- Service-based architecture
- JSON serialization
- API testing
- Modular Python architecture

The project also demonstrates how a reusable data-science engine can be separated from the web application that consumes it.

---

## Author

Built as a hands-on project to explore the intersection of **Data Science, Backend Engineering, and Frontend Development**.

---

## License

This project is intended for learning, experimentation, and portfolio purposes.
