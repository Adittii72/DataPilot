# PRISM — Reveal What's Inside Your Data

> An automated data analysis platform that helps you understand, explore, and visualize datasets without manually writing repetitive EDA code.

## Live Demo

**[Try PRISM Live](YOUR_LIVE_URL_HERE)**

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

The system reports both counts and percentages where appropriate, making it easier to understand the scale of potential issues.

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

### Dataset Insights

PRISM highlights potentially important characteristics of a dataset, such as:

- Missing data
- Duplicate records
- Constant features
- High-cardinality features
- Skewed numerical features
- Strong numerical relationships
- Potential outliers

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