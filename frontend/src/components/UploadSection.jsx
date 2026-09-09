function UploadSection(){
  return (
    <section className = "upload-section">
      <div className="upload-content">
        <h2>Upload Dataset</h2>
        <p>Upload a CSV file and let DataPilot automatically analyze your dataset.</p>
        <label className="upload-button">
          Choose CSV file
          <input type="file" accept= ".csv"/>
        </label>
      </div>
    </section>
  );
}

export default UploadSection;