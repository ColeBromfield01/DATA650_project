import React, { useState } from 'react';

const App = () => {
  const [fileName, setFileName] = useState('');
  const [teamLookup, setTeamLookup] = useState('');
  const [tableData, setTableData] = useState([]);

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    // Fetch the team lookup data
    const teamLookupResponse = await fetch('https://osir3dme2h.execute-api.us-east-1.amazonaws.com/dev/team_lookup?year=1936&team=New+York+Yankees');
    const teamLookupData = await teamLookupResponse.json();
    console.log(teamLookupData);
    setTeamLookup(teamLookupData.team);

    // Fetch the CSV data
    const response = await fetch('https://osir3dme2h.execute-api.us-east-1.amazonaws.com/dev/read_csv', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ file_name: fileName }),
    });
    const data = await response.json();
    console.log(data);
    setTableData(data);
    setFileName('');
  };

  return (
    <div>
      <h1>Welcome to my Serverless Web App!</h1>
      <p>This is a static website hosted on AWS S3.</p>

      <h2>Data</h2>
      <form onSubmit={handleFormSubmit}>
        <label htmlFor="name">File Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="data/ManagersHalf.csv"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          required
        />
        <br />
        <button type="submit">Submit</button>
      </form>

      <h2>String</h2>
      <p>String from backend will be displayed here:</p>
      <div>{teamLookup}</div>

      <h2>Table</h2>
      <p>Table from backend will be displayed here:</p>
      <table border="1">
        <thead>
          <tr>
            {tableData.length > 0 && Object.keys(tableData[0]).map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, index) => (
            <tr key={index}>
              {Object.values(row).map((value, i) => (
                <td key={i}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;

